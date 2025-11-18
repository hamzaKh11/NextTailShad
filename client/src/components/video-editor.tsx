import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Download,
  Loader2,
  Youtube,
  AlertCircle,
  Check,
  Smartphone,
  Square,
  Monitor,
  FileText,
  MoveHorizontal,
  Wand2,
  Scissors,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import type { VideoInfo } from "@shared/schema";
import { secondsToTime, timeToSeconds } from "@shared/schema";

// --- Constants ---
const ASPECT_RATIOS = [
  {
    value: "9:16",
    label: "TikTok/Reels",
    Icon: Smartphone,
    ratio: 9 / 16,
    description: "Portrait",
  },
  {
    value: "1:1",
    label: "Instagram",
    Icon: Square,
    ratio: 1 / 1,
    description: "Square",
  },
  {
    value: "16:9",
    label: "YouTube",
    Icon: Monitor,
    ratio: 16 / 9,
    description: "Landscape",
  },
  {
    value: "4:5",
    label: "Feed",
    Icon: FileText,
    ratio: 4 / 5,
    description: "Portrait",
  },
] as const;

export function VideoEditor() {
  // --- State ---
  const [url, setUrl] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:30");
  const [aspectRatio, setAspectRatio] = useState<
    "9:16" | "1:1" | "16:9" | "4:5"
  >("9:16");
  const [shouldFetchInfo, setShouldFetchInfo] = useState(false);

  // Editor State
  const [fetchedVideo, setFetchedVideo] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [cropPosition, setCropPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // --- Queries & Mutations ---

  const {
    data: videoInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = useQuery<VideoInfo>({
    queryKey: ["/api/video-info", url],
    enabled: shouldFetchInfo && !!url,
    queryFn: async () => {
      const response = await fetch(
        `/api/video-info?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) throw new Error("Could not retrieve video details.");
      return response.json();
    },
  });

  const fetchMutation = useMutation({
    mutationFn: async () => {
      setFetchedVideo(null);
      const response = await fetch("/api/fetch-segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, startTime, endTime }),
      });

      if (!response.ok) {
        let errorMsg = "Fetch failed";
        try {
          const data = await response.json();
          errorMsg = data.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setFetchedVideo({ url: data.videoUrl, filename: data.filename });
      // Auto-scroll to editor
      setTimeout(() => {
        document
          .getElementById("visual-editor")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to prepare video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      if (!fetchedVideo) throw new Error("No video fetched");
      const response = await fetch("/api/process-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fetchedVideo.filename,
          aspectRatio,
          position: cropPosition,
        }),
      });

      if (!response.ok) throw new Error("Processing failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `reelcutter_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your clip is being saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Handlers ---

  const validateYouTubeUrl = (urlString: string): boolean => {
    try {
      const parsedUrl = new URL(urlString);
      const allowedHosts = [
        "www.youtube.com",
        "youtube.com",
        "youtu.be",
        "m.youtube.com",
      ];
      return allowedHosts.includes(parsedUrl.hostname.toLowerCase());
    } catch {
      return false;
    }
  };

  const handleLoadVideo = () => {
    if (!url) return;
    if (!validateYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube link.",
        variant: "destructive",
      });
      return;
    }
    setShouldFetchInfo(true);
    setFetchedVideo(null);
  };

  const handleSliderChange = (values: number[]) => {
    if (videoInfo) {
      const [start, end] = values;
      setStartTime(secondsToTime(start));
      setEndTime(secondsToTime(end));
      setFetchedVideo(null);
    }
  };

  // --- Drag / Crop Logic ---

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

    // Calculate relative position (0 to 1)
    const rawRelX = (clientX - rect.left) / rect.width;

    const currentRatioObj = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
    const targetAspect = currentRatioObj ? currentRatioObj.ratio : 9 / 16;
    const containerAspect = 16 / 9;

    if (targetAspect >= containerAspect) return; // No cropping needed if wider

    const boxWidthPercent = targetAspect / containerAspect;
    const halfBox = boxWidthPercent / 2;

    // Constrain movement so box stays inside
    let constrainedRelX = rawRelX;
    if (constrainedRelX < halfBox) constrainedRelX = halfBox;
    if (constrainedRelX > 1 - halfBox) constrainedRelX = 1 - halfBox;

    const safeWidth = 1 - boxWidthPercent;
    // Map to 0-100 percentage for backend
    const finalPos =
      safeWidth <= 0 ? 50 : ((constrainedRelX - halfBox) / safeWidth) * 100;

    setCropPosition(Math.max(0, Math.min(100, finalPos)));
  };

  const getOverlayStyle = () => {
    if (aspectRatio === "16:9") return { display: "none" };

    const currentRatioObj = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
    const targetAspect = currentRatioObj ? currentRatioObj.ratio : 9 / 16;
    const containerAspect = 16 / 9;

    const boxWidthPercent = (targetAspect / containerAspect) * 100;
    // Logic to convert the 0-100 backend position to CSS 'left' percentage
    const freeSpace = 100 - boxWidthPercent;
    const leftOffset = (cropPosition / 100) * freeSpace;

    return {
      width: `${boxWidthPercent}%`,
      left: `${leftOffset}%`,
      height: "100%",
    };
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // --- Render ---

  return (
    <section
      className="min-h-screen bg-background text-foreground py-12 lg:py-24 font-sans selection:bg-primary/20 selection:text-primary"
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Reframe. Crop. <span className="text-primary">Create.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn long-form YouTube videos into engaging shorts for TikTok,
            Reels, and Shorts in seconds.
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="border-0 shadow-l bg-card/50 backdrop-blur-xl ring-1 ring-border/50 mb-12 overflow-hidden">
          <CardContent className="p-1">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-muted-foreground">
                <Youtube className="w-6 h-6" />
              </div>
              <Input
                id="url"
                placeholder="Paste YouTube URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
                className="h-16 pl-14 pr-32 text-lg bg-background border-0 focus-visible:ring-0 rounded-l shadow-inner"
              />
              <div className="absolute right-2">
                <Button
                  onClick={handleLoadVideo}
                  disabled={isLoadingInfo || !url}
                  size="sm"
                  className="h-12 px-6 rounded-lg font-semibold transition-all"
                >
                  {isLoadingInfo ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Load Video"
                  )}
                </Button>
              </div>
            </div>
            {/* Subtle Error/Status Messages below input */}
            {infoError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 mt-1 rounded-lg flex items-center justify-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4" /> Failed to load video. Check
                the URL.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Area */}
        {videoInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom duration-700">
            {/* LEFT COLUMN: Configuration */}
            <div className="lg:col-span-5 space-y-6">
              {/* Metadata Card */}
              <div className="bg-card border rounded-xl p-4 flex gap-4 items-start shadow-sm">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="Thumb"
                    className="w-24 h-24 rounded-lg object-cover bg-muted"
                  />
                )}
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {videoInfo.channel}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {secondsToTime(videoInfo.duration)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Time Trimming Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Scissors className="w-4 h-4" /> Trim Segment
                  </Label>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                    {secondsToTime(
                      timeToSeconds(endTime) - timeToSeconds(startTime)
                    )}{" "}
                    duration
                  </span>
                </div>

                <div className="px-1 py-4">
                  <Slider
                    min={0}
                    max={videoInfo.duration}
                    step={1}
                    value={[timeToSeconds(startTime), timeToSeconds(endTime)]}
                    onValueChange={handleSliderChange}
                    className="py-2 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Start
                    </Label>
                    <Input
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="font-mono text-center bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase">
                      End
                    </Label>
                    <Input
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="font-mono text-center bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Aspect Ratio Grid */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Output Format
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={cn(
                        "relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-muted",
                        aspectRatio === ratio.value
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)]"
                          : "border-border/50 bg-card"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          aspectRatio === ratio.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <ratio.Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ratio.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {ratio.value}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prepare Button */}
              {!fetchedVideo && (
                <Button
                  onClick={() => fetchMutation.mutate()}
                  disabled={fetchMutation.isPending}
                  className="w-full h-14 text-lg shadow-lg shadow-primary/20 mt-4"
                >
                  {fetchMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Preparing Clip...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" /> Prepare for Editing
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* RIGHT COLUMN: Visual Editor */}
            <div className="lg:col-span-7" id="visual-editor">
              {fetchedVideo ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> Editor Ready
                    </Label>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MoveHorizontal className="w-4 h-4" /> Drag frame to crop
                    </div>
                  </div>

                  {/* THE VIDEO PLAYER CONTAINER */}
                  <div
                    className="relative rounded-xl overflow-hidden bg-black shadow-2xl border border-border/50 group"
                    ref={containerRef}
                    onMouseMove={handleDragMove}
                    onTouchMove={handleDragMove}
                  >
                    {/* Aspect Ratio Container wrapper to maintain shape if needed, or just use aspect-video */}
                    <div className="aspect-video relative">
                      <video
                        ref={videoRef}
                        src={fetchedVideo.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />

                      {/* Darkened Overlay (Cinema Mode) */}
                      {aspectRatio !== "16:9" && (
                        <div className="absolute inset-0 bg-black/70 transition-opacity duration-300"></div>
                      )}

                      {/* The Crop Window */}
                      <div
                        className={cn(
                          "absolute top-0 h-full border-2 border-white/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing z-10 transition-colors",
                          isDragging
                            ? "border-primary scale-[1.01]"
                            : "hover:border-white"
                        )}
                        style={{
                          ...getOverlayStyle(),
                          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)", // The "Spotlight" effect
                        }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                      >
                        {/* Rule of Thirds Grid */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                          <div className="border-r border-white/50 h-full col-start-2"></div>
                          <div className="border-r border-white/50 h-full col-start-3"></div>
                          <div className="border-b border-white/50 w-full row-start-2 absolute top-0"></div>
                          <div className="border-b border-white/50 w-full row-start-3 absolute top-0"></div>
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <MoveHorizontal className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Play/Pause Overlay Control */}
                      <button
                        onClick={togglePlay}
                        className="absolute bottom-4 left-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Final Action */}
                  <div className="bg-card border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg mt-6">
                    <div className="text-sm text-muted-foreground">
                      Output:{" "}
                      <span className="font-semibold text-foreground">
                        {aspectRatio}
                      </span>{" "}
                      • Format:{" "}
                      <span className="font-semibold text-foreground">MP4</span>
                    </div>
                    <Button
                      onClick={() => processMutation.mutate()}
                      disabled={processMutation.isPending}
                      size="lg"
                      className="w-full sm:w-auto px-8 h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20"
                    >
                      {processMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" /> Download Final
                          Clip
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty State Placeholder for Right Column */
                <div className="h-full min-h-[400px] rounded-xl border-2 border-dashed border-muted-foreground/10 bg-muted/5 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                    <Monitor className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Visual Editor
                  </h3>
                  <p className="text-sm text-muted-foreground/60 max-w-xs mt-2">
                    Select your time range and click "Prepare for Editing" to
                    enable the visual cropper.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
