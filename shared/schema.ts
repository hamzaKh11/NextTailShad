import { z } from "zod";

// YouTube video information response
export const videoInfoSchema = z.object({
  title: z.string(),
  thumbnail: z.string(),
  duration: z.number(),
  channel: z.string().optional(),
});

export type VideoInfo = z.infer<typeof videoInfoSchema>;

// Download segment request
export const downloadSegmentSchema = z.object({
  url: z.string().url(),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  aspectRatio: z.enum(["9:16", "1:1", "16:9", "4:5"]).optional(),
});

export type DownloadSegment = z.infer<typeof downloadSegmentSchema>;

// Time conversion utilities
export function timeToSeconds(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
