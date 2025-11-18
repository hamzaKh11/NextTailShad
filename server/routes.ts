import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import { videoInfoSchema, downloadSegmentSchema } from "@shared/schema";
import { z } from "zod";

// Safely execute yt-dlp command with arguments
async function execYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", args);
    let stdout = "";
    let stderr = "";

    ytdlp.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
      }
    });

    ytdlp.on("error", (error) => {
      reject(error);
    });
  });
}

// Validate YouTube URL to prevent SSRF attacks
function validateYouTubeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const allowedHosts = [
      "www.youtube.com",
      "youtube.com",
      "youtu.be",
      "m.youtube.com",
      "music.youtube.com",
    ];
    
    // Check if hostname is in the allowlist
    return allowedHosts.includes(url.hostname.toLowerCase());
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

// Ensure downloads directory exists
const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");

async function ensureDownloadsDir() {
  if (!existsSync(DOWNLOADS_DIR)) {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureDownloadsDir();

  // Get YouTube video information
  app.get("/api/video-info", async (req, res) => {
    try {
      const url = req.query.url as string;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Strict YouTube URL validation to prevent SSRF
      if (!validateYouTubeUrl(url)) {
        return res.status(400).json({ 
          message: "Invalid YouTube URL. Only official YouTube domains are allowed." 
        });
      }

      // Use yt-dlp to get video info without downloading - safe parameterized arguments
      const stdout = await execYtDlp([
        "--dump-json",
        "--no-warnings",
        "--no-playlist",
        url
      ]);

      const videoData = JSON.parse(stdout);

      const videoInfo = {
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        channel: videoData.uploader || videoData.channel,
      };

      return res.json(videoInfo);
    } catch (error: any) {
      console.error("Error fetching video info:", error);
      return res.status(500).json({ 
        message: "Failed to fetch video information. Please check the URL and try again." 
      });
    }
  });

  // Download video segment
  app.post("/api/download-segment", async (req, res) => {
    let tempFilePath: string | null = null;
    
    try {
      // Validate request body
      const validation = downloadSegmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors 
        });
      }

      const { url, startTime, endTime, aspectRatio } = validation.data;

      // Strict YouTube URL validation to prevent SSRF
      if (!validateYouTubeUrl(url)) {
        return res.status(400).json({ 
          message: "Invalid YouTube URL. Only official YouTube domains are allowed." 
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const outputTemplate = path.join(DOWNLOADS_DIR, `segment_${timestamp}.%(ext)s`);

      // Download the video segment using yt-dlp with time range - safe parameterized arguments
      console.log("Downloading video segment...");
      await execYtDlp([
        "--download-sections",
        `*${startTime}-${endTime}`,
        "-f",
        "best[height<=720]",
        "--no-playlist",
        "--no-warnings",
        "-o",
        outputTemplate,
        url
      ]);

      // Find the downloaded file
      const files = await fs.readdir(DOWNLOADS_DIR);
      const downloadedFile = files.find(f => f.includes(`segment_${timestamp}`));

      if (!downloadedFile) {
        throw new Error("Downloaded file not found");
      }

      tempFilePath = path.join(DOWNLOADS_DIR, downloadedFile);
      
      // Detect file extension and set appropriate content type
      const fileExt = path.extname(downloadedFile).toLowerCase();
      const contentType = fileExt === '.webm' ? 'video/webm' : 
                         fileExt === '.mkv' ? 'video/x-matroska' :
                         'video/mp4';
      
      // Set appropriate headers for download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="reelcutter_${startTime.replace(/:/g, '-')}_${endTime.replace(/:/g, '-')}${fileExt}"`);

      // Stream the file
      const fileBuffer = await fs.readFile(tempFilePath);
      res.send(fileBuffer);

      // Clean up the file after sending
      setTimeout(async () => {
        if (tempFilePath && existsSync(tempFilePath)) {
          await fs.unlink(tempFilePath);
          console.log("Cleaned up temp file:", tempFilePath);
        }
      }, 1000);

    } catch (error: any) {
      console.error("Error downloading segment:", error);
      
      // Clean up on error
      if (tempFilePath && existsSync(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }

      return res.status(500).json({ 
        message: error.message || "Failed to download video segment. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
