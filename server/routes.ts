import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import express from "express";
import { videoInfoSchema, downloadSegmentSchema } from "@shared/schema";

const isWindows = process.platform === "win32";

// Helper to run commands with robust error logging and PATH injection
async function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`[Exec] ${command} ${args.join(' ')}`);
    
    // CRITICAL WINDOWS FIX: 
    // Inject the current working directory into the PATH environment variable.
    // This ensures yt-dlp can automatically find ffmpeg.exe in the same folder.
    const env = { ...process.env };
    const currentDir = process.cwd();
    const pathKey = isWindows ? 'Path' : 'PATH';
    env[pathKey] = `${currentDir}${path.delimiter}${env[pathKey] || ''}`;

    const proc = spawn(command, args, { 
      shell: false, 
      env 
    });
    
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => stdout += data.toString());
    proc.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      // Filter logs to keep console clean, showing only download progress
      if (output.includes("[download]") || output.toLowerCase().includes("error")) {
          console.log(`[Log] ${output.trim()}`);
      }
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        // Detect common errors
        const errorMessage = stderr.includes("ffmpeg is not installed") 
          ? "FFmpeg is missing. Please ensure ffmpeg.exe is in the project root folder."
          : `Process exited with code ${code}`;
        console.error(`[Error] ${errorMessage}`);
        reject(new Error(errorMessage));
      }
    });
    
    proc.on("error", (err) => reject(err));
  });
}

// Validate YouTube URL
function validateYouTubeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const allowedHosts = ["www.youtube.com", "youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"];
    return allowedHosts.includes(url.hostname.toLowerCase());
  } catch { return false; }
}

const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");

async function ensureDownloadsDir() {
  if (!existsSync(DOWNLOADS_DIR)) {
    try {
      await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    } catch (err) {
      console.error("Error creating downloads dir:", err);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureDownloadsDir();

  // Serve downloaded files so the frontend can preview them
  app.use('/downloads', express.static(DOWNLOADS_DIR));

  // 1. Get Video Info
  app.get("/api/video-info", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url || !validateYouTubeUrl(url)) return res.status(400).json({ message: "Invalid URL" });

      const localYtDlp = path.join(process.cwd(), 'yt-dlp.exe');
      const command = existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';

      const stdout = await runCommand(command, ["-4", "--dump-json", "--no-warnings", "--no-playlist", url]);
      const videoData = JSON.parse(stdout);

      res.json({
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        channel: videoData.uploader || videoData.channel,
      });
    } catch (error: any) {
      console.error("Video Info Error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch video info" });
    }
  });

  // 2. Fetch Raw Segment (The "Fetch" Button)
  app.post("/api/fetch-segment", async (req, res) => {
    try {
      const { url, startTime, endTime } = req.body;
      if (!validateYouTubeUrl(url)) return res.status(400).json({ message: "Invalid URL" });

      const timestamp = Date.now();
      const filename = `segment_${timestamp}.mp4`;
      const outputTemplate = path.join(DOWNLOADS_DIR, filename);

      const localYtDlp = path.join(process.cwd(), 'yt-dlp.exe');
      const command = existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';

      // PERFORMANCE ARGS:
      // 1. -4: Force IPv4 to avoid Google 403 blocking.
      // 2. -f ...[vcodec^=avc]: STRICTLY select H.264 video. 
      //    This prevents downloading AV1/VP9 which takes minutes to convert.
      let args = [
        "-4", 
        "--download-sections", `*${startTime}-${endTime}`,
        "-f", "bestvideo[height<=1080][vcodec^=avc]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--force-keyframes-at-cuts",
        "--no-playlist", 
        "--no-warnings",
        "-o", outputTemplate,
        url
      ];

      await runCommand(command, args);

      res.json({ 
        success: true, 
        videoUrl: `/downloads/${filename}`, 
        filename: filename 
      });

    } catch (error: any) {
      console.error("Fetch error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch segment" });
    }
  });

  // 3. Process & Crop (The "Download" Button in Editor)
  app.post("/api/process-crop", async (req, res) => {
    let processedPath: string = ""; 
    try {
      const { filename, aspectRatio, position } = req.body; 
      
      const inputPath = path.join(DOWNLOADS_DIR, filename);
      if (!existsSync(inputPath)) return res.status(404).json({ message: "Original file not found" });

      const outputFilename = `processed_${Date.now()}_${aspectRatio.replace(':', '-')}.mp4`;
      processedPath = path.join(DOWNLOADS_DIR, outputFilename);

      const localFFmpeg = path.join(process.cwd(), 'ffmpeg.exe');
      const command = existsSync(localFFmpeg) ? localFFmpeg : 'ffmpeg';

      // Calculate Dynamic Crop
      let cropFilter = "";
      let targetW_expr = "";
      
      if (aspectRatio === "9:16") targetW_expr = "ih*9/16";
      else if (aspectRatio === "1:1") targetW_expr = "ih";
      else if (aspectRatio === "4:5") targetW_expr = "ih*4/5";
      else if (aspectRatio === "16:9") targetW_expr = "iw"; 

      if (aspectRatio !== "16:9") {
        const posFactor = (parseInt(position) || 50) / 100;
        // x = (input_width - output_width) * percentage
        cropFilter = `crop=w=${targetW_expr}:h=ih:x=(iw-ow)*${posFactor}:y=0`;
      }

      const args = [
        "-i", inputPath,
        "-vf", cropFilter || "null", 
        "-c:v", "libx264", 
        "-preset", "ultrafast", // INSTANT SPEED: Uses more space but encodes instantly
        "-crf", "26", // Reasonable quality for social media
        "-c:a", "copy",
        "-y",
        processedPath
      ];

      await runCommand(command, args);

      res.download(processedPath, outputFilename, (err) => {
        if (err) console.error("Send error:", err);
        // Cleanup the processed file, keep original for re-edits if needed
        if (processedPath && existsSync(processedPath)) {
            fs.unlink(processedPath).catch((e) => console.error("Cleanup error:", e));
        }
      });

    } catch (error: any) {
      console.error("Processing error:", error);
      res.status(500).json({ message: "Failed to process video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}