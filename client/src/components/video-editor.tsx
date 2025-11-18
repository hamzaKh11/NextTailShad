import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Loader2, Youtube, AlertCircle, CheckCircle2, Crop, Smartphone, Square, Monitor, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import type { VideoInfo } from "@shared/schema";
import { secondsToTime, timeToSeconds } from "@shared/schema";

const ASPECT_RATIOS = [
  { value: "9:16", label: "Reels/TikTok", Icon: Smartphone },
  { value: "1:1", label: "Instagram", Icon: Square },
  { value: "16:9", label: "YouTube", Icon: Monitor },
  { value: "4:5", label: "Facebook", Icon: FileText },
] as const;

export function VideoEditor() {
  const [url, setUrl] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:30");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9" | "4:5">("9:16");
  const [shouldFetchInfo, setShouldFetchInfo] = useState(false);
  const { toast } = useToast();

  // Fetch video info
  const { data: videoInfo, isLoading: isLoadingInfo, error: infoError } = useQuery<VideoInfo>({
    queryKey: ["/api/video-info", url],
    enabled: shouldFetchInfo && !!url,
    queryFn: async () => {
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video information");
      }
      return response.json();
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/download-segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, startTime, endTime, aspectRatio }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Download failed");
      }

      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename: string;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        } else {
          // Fallback: determine extension from blob type
          const ext = blob.type === "video/webm" ? ".webm" : 
                      blob.type === "video/x-matroska" ? ".mkv" :
                      ".mp4";
          filename = `reelcutter_${startTime.replace(/:/g, "-")}_${endTime.replace(/:/g, "-")}${ext}`;
        }
      } else {
        // No Content-Disposition header: use blob type as fallback
        const ext = blob.type === "video/webm" ? ".webm" : 
                    blob.type === "video/x-matroska" ? ".mkv" :
                    ".mp4";
        filename = `reelcutter_${startTime.replace(/:/g, "-")}_${endTime.replace(/:/g, "-")}${ext}`;
      }

      return { blob, filename };
    },
    onSuccess: ({ blob, filename }) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Success!",
        description: "Your video clip is downloading now!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message || "Please try again with a different video or time range.",
        variant: "destructive",
      });
    },
  });

  // Validate YouTube URL on client side
  const validateYouTubeUrl = (urlString: string): boolean => {
    try {
      const parsedUrl = new URL(urlString);
      const allowedHosts = [
        "www.youtube.com",
        "youtube.com",
        "youtu.be",
        "m.youtube.com",
        "music.youtube.com",
      ];
      return allowedHosts.includes(parsedUrl.hostname.toLowerCase());
    } catch {
      return false;
    }
  };

  const handleLoadVideo = () => {
    if (!validateYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL from an official YouTube domain",
        variant: "destructive",
      });
      return;
    }
    setShouldFetchInfo(true);
  };

  const handleDownload = () => {
    const start = timeToSeconds(startTime);
    const end = timeToSeconds(endTime);

    if (start >= end) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    if (videoInfo && end > videoInfo.duration) {
      toast({
        title: "Time Out of Range",
        description: "End time exceeds video duration",
        variant: "destructive",
      });
      return;
    }

    downloadMutation.mutate();
  };

  const handleSliderChange = (values: number[]) => {
    if (videoInfo) {
      const [start, end] = values;
      setStartTime(secondsToTime(start));
      setEndTime(secondsToTime(end));
    }
  };

  return (
    <section id="editor" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Create Your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Perfect Clip
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste any YouTube URL and start creating viral-ready content in seconds
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl border-card-border">
          <CardHeader className="space-y-0 pb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Youtube className="w-6 h-6 text-primary" />
              Video Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-base font-semibold">
                YouTube URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
                  className="flex-1 h-12 text-base"
                  data-testid="input-youtube-url"
                />
                <Button
                  onClick={handleLoadVideo}
                  disabled={isLoadingInfo || !url}
                  className="h-12 px-6"
                  data-testid="button-load-video"
                >
                  {isLoadingInfo ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Load"
                  )}
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingInfo && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Fetching video information...</p>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {infoError && (
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-medium">Failed to load video</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please check the URL and try again
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Video Info Preview */}
            {videoInfo && (
              <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    {videoInfo.thumbnail && (
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full md:w-48 h-auto rounded-lg object-cover"
                        data-testid="img-video-thumbnail"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2 mb-1" data-testid="text-video-title">
                            {videoInfo.title}
                          </h3>
                          {videoInfo.channel && (
                            <p className="text-sm text-muted-foreground">{videoInfo.channel}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            Duration: {secondsToTime(videoInfo.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline Editor */}
            {videoInfo && (
              <>
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Select Time Range</Label>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={videoInfo.duration}
                      step={1}
                      value={[timeToSeconds(startTime), timeToSeconds(endTime)]}
                      onValueChange={handleSliderChange}
                      className="w-full"
                      data-testid="slider-timeline"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start" className="text-sm font-medium">
                        Start Time
                      </Label>
                      <Input
                        id="start"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="00:00:00"
                        className="font-mono text-base h-12"
                        data-testid="input-start-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end" className="text-sm font-medium">
                        End Time
                      </Label>
                      <Input
                        id="end"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="00:00:30"
                        className="font-mono text-base h-12"
                        data-testid="input-end-time"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Segment Duration:{" "}
                    <span className="font-semibold text-foreground">
                      {secondsToTime(timeToSeconds(endTime) - timeToSeconds(startTime))}
                    </span>
                  </p>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Crop className="w-4 h-4" />
                    Aspect Ratio
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ASPECT_RATIOS.map((ratio) => {
                      const IconComponent = ratio.Icon;
                      return (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value as typeof aspectRatio)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2 ${
                            aspectRatio === ratio.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card"
                          }`}
                          data-testid={`button-aspect-${ratio.value}`}
                        >
                          <IconComponent className="w-8 h-8 text-primary" />
                          <span className="font-semibold text-sm">{ratio.value}</span>
                          <span className="text-xs text-muted-foreground">{ratio.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Download Progress */}
                {downloadMutation.isPending && (
                  <div className="space-y-3">
                    <Progress value={50} className="h-3" />
                    <p className="text-sm text-center text-muted-foreground">
                      Processing your video clip...
                    </p>
                  </div>
                )}

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending || !videoInfo}
                  size="lg"
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  data-testid="button-download"
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Segment
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  100% free • No watermarks • Unlimited downloads
                </p>
              </>
            )}

            {/* Empty State */}
            {!videoInfo && !isLoadingInfo && !infoError && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-16 text-center">
                  <Youtube className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Ready to create your first clip?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paste a YouTube URL above to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
