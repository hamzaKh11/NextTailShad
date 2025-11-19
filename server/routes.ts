import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import express from "express";

const isWindows = process.platform === "win32";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    const currentDir = process.cwd();
    const pathKey = isWindows ? 'Path' : 'PATH';
    env[pathKey] = `${currentDir}${path.delimiter}${env[pathKey] || ''}`;
    env['PYTHONIOENCODING'] = 'utf-8';
    
    const proc = spawn(command, args, { shell: false, env });
    
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => stdout += data.toString());
    proc.stderr.on("data", (data) => stderr += data.toString());

    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else {
        if (!stdout && stderr.toLowerCase().includes("error")) {
            console.error(`[FFmpeg Fatal Error] ${stderr}`);
            reject(new Error(stderr));
        } else {
            resolve(stdout);
        }
      }
    });
    
    proc.on("error", (err) => reject(err));
  });
}

function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function validateYouTubeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ["www.youtube.com", "youtube.com", "youtu.be", "m.youtube.com"].includes(url.hostname.toLowerCase());
  } catch { return false; }
}

const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");

interface VideoCache {
  title: string;
  thumbnail: string;
  duration: number;
  channel: string;
  videoUrl: string;
  audioUrl: string;
  timestamp: number;
}
const videoCache = new Map<string, VideoCache>();

export async function registerRoutes(app: Express): Promise<Server> {
  if (!existsSync(DOWNLOADS_DIR)) {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true }).catch(console.error);
  }

  app.use('/downloads', express.static(DOWNLOADS_DIR));

  // 1. VIDEO INFO
  app.get("/api/video-info", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url || !validateYouTubeUrl(url)) return res.status(400).json({ message: "Invalid URL" });

      const cached = videoCache.get(url);
      if (cached && (Date.now() - cached.timestamp < 1000 * 60 * 30)) {
        return res.json({
          title: cached.title,
          thumbnail: cached.thumbnail,
          duration: cached.duration,
          channel: cached.channel
        });
      }

      const localYtDlp = path.join(process.cwd(), 'yt-dlp.exe');
      const command = existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';

      const args = [
        "--encoding", "utf-8",
        "--print", "%(title)s|||%(thumbnail)s|||%(duration)s|||%(uploader)s",
        "--get-url",
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--no-playlist", "--no-warnings",
        url
      ];

      const stdout = await runCommand(command, args);
      const lines = stdout.trim().split('\n');
      const meta = lines[0].split('|||');
      
      const title = meta[0] ? meta[0].trim() : "Unknown Video";
      const thumbnail = meta[1] || "";
      const duration = parseFloat(meta[2]) || 0;
      const channel = meta[3] || "Unknown Channel";
      const videoUrl = lines[1] || "";
      const audioUrl = lines[2] || videoUrl;

      videoCache.set(url, { title, thumbnail, duration, channel, videoUrl, audioUrl, timestamp: Date.now() });
      res.json({ title, thumbnail, duration, channel });

    } catch (error: any) {
      console.error("Info Error:", error.message);
      res.status(500).json({ message: "Failed to fetch info" });
    }
  });

  // 2. FETCH SEGMENT (Zero-Encoding Download)
  app.post("/api/fetch-segment", async (req, res) => {
    try {
      const { url, startTime, endTime } = req.body;
      const cached = videoCache.get(url);
      if (!cached) return res.status(400).json({ message: "Session expired. Reload video." });

      const startSec = parseTimestamp(startTime);
      const endSec = parseTimestamp(endTime);
      const durationSec = endSec - startSec;

      const filename = `hq_${Date.now()}.mp4`;
      const outputTemplate = path.join(DOWNLOADS_DIR, filename);
      const localFFmpeg = path.join(process.cwd(), 'ffmpeg.exe');
      const command = existsSync(localFFmpeg) ? localFFmpeg : 'ffmpeg';

      const commonArgs = [
        "-user_agent", USER_AGENT,
        "-headers", `User-Agent: ${USER_AGENT}`,
        "-analyzeduration", "0", "-probesize", "32"
      ];

      const args = [
        ...commonArgs,
        "-ss", `${startSec}`, "-t", `${durationSec}`, "-i", cached.videoUrl,
        ...(cached.videoUrl !== cached.audioUrl ? [
          ...commonArgs, "-ss", `${startSec}`, "-t", `${durationSec}`, "-i", cached.audioUrl
        ] : []),
        ...(cached.videoUrl !== cached.audioUrl ? ["-map", "0:v", "-map", "1:a"] : ["-map", "0"]),
        "-c:v", "copy", 
        "-c:a", "aac", "-b:a", "192k", 
        "-movflags", "+faststart", "-y", outputTemplate
      ];

      await runCommand(command, args);

      if (!existsSync(outputTemplate)) throw new Error("Download failed (File not found)");
      res.json({ success: true, videoUrl: `/downloads/${filename}`, filename });

    } catch (error: any) {
      res.status(500).json({ message: "Fetch failed" });
    }
  });

  // 3. PROCESS CROP (Refactored to prevent crashes and maximize CPU speed)
  app.post("/api/process-crop", async (req, res) => {
    try {
      const { filename, aspectRatio, position } = req.body; 
      const inputPath = path.join(DOWNLOADS_DIR, filename);
      
      if (!existsSync(inputPath)) return res.status(404).json({ message: "Source file not found. Try fetching the clip again." });

      const outputFilename = `final_${Date.now()}.mp4`;
      const processedPath = path.join(DOWNLOADS_DIR, outputFilename);
      const localFFmpeg = path.join(process.cwd(), 'ffmpeg.exe');
      const command = existsSync(localFFmpeg) ? localFFmpeg : 'ffmpeg';

      let args: string[] = [];

      // Add common input arguments (including GPU hint)
      args.push("-hwaccel", "auto", "-i", inputPath);

      // --- Conditional Output Generation ---
      if (aspectRatio !== "16:9") {
        // Cropped Output (Requires re-encoding)
        let targetW_expr = "";
        if (aspectRatio === "9:16") targetW_expr = "ih*9/16";
        else if (aspectRatio === "1:1") targetW_expr = "ih"; 
        
        const posFactor = (parseInt(position) || 50) / 100;
        const cropFilter = `crop=w=${targetW_expr}:h=ih:x=(iw-ow)*${posFactor}:y=0`;
        
        args.push(
          "-vf", cropFilter, 
          "-c:v", "libx264", 
          // FINAL SPEED: veryfast is the most stable high-speed preset
          "-preset", "veryfast", 
          "-tune", "film",
          "-threads", "0", // Use all threads
          "-crf", "23", // Great quality
          "-c:a", "copy"
        );
      } else {
        // 16:9 Output (Stream Copy - Instant)
        args.push("-c", "copy"); 
      }
      
      // Final Output Args
      args.push("-movflags", "+faststart", "-y", processedPath);

      await runCommand(command, args);

      if (!existsSync(processedPath)) throw new Error("Processing failed: Output file missing.");

      res.download(processedPath, outputFilename, () => {
        try { fs.unlink(processedPath).catch(() => {}); } catch {}
      });

    } catch (error: any) {
      console.error("Process Crop Error:", error);
      res.status(500).json({ message: "Processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}