import { useState, useRef, useEffect, useCallback } from "react";
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
  MoveHorizontal,
  Wand2,
  Scissors,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VideoInfo } from "@shared/schema";
import { secondsToTime, timeToSeconds } from "@shared/schema";

const ASPECT_RATIOS = [
  { value: "9:16", label: "TikTok/Reels", Icon: Smartphone, ratio: 9 / 16 },
  { value: "1:1", label: "Instagram", Icon: Square, ratio: 1 / 1 },
  { value: "16:9", label: "YouTube", Icon: Monitor, ratio: 16 / 9 },
] as const;

export function VideoEditor() {
  const [url, setUrl] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:30");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">(
    "9:16"
  );
  const [shouldFetchInfo, setShouldFetchInfo] = useState(false);

  const [fetchedVideo, setFetchedVideo] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [cropPosition, setCropPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Sound State

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const { toast } = useToast();

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
      if (!response.ok) throw new Error("Fetch failed");
      return response.json();
    },
    onSuccess: (data) => {
      setFetchedVideo({ url: data.videoUrl, filename: data.filename });
      setTimeout(
        () =>
          document
            .getElementById("visual-editor")
            ?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
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
      a.download = `clip_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    onSuccess: () => toast({ title: "Success", description: "Video saved!" }),
    onError: (error: Error) =>
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handleLoadVideo = () => {
    if (!url) return;
    setShouldFetchInfo(true);
    setFetchedVideo(null);
  };

  // --- OPTIMIZED DRAG LOGIC (requestAnimationFrame) ---
  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      // Prevent layout thrashing by using animation frame
      if (requestRef.current) cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX =
          "touches" in e ? (e as any).touches[0].clientX : (e as any).clientX;
        const rawRelX = (clientX - rect.left) / rect.width;

        const currentRatioObj = ASPECT_RATIOS.find(
          (r) => r.value === aspectRatio
        );
        const targetAspect = currentRatioObj ? currentRatioObj.ratio : 9 / 16;
        const containerAspect = 16 / 9;

        if (targetAspect >= containerAspect) return;

        const boxWidthPercent = targetAspect / containerAspect;
        const halfBox = boxWidthPercent / 2;
        let constrainedRelX = Math.max(halfBox, Math.min(1 - halfBox, rawRelX));

        setCropPosition(
          ((constrainedRelX - halfBox) / (1 - boxWidthPercent)) * 100
        );
      });
    },
    [isDragging, aspectRatio]
  );

  // Cleanup animation frame
  useEffect(
    () => () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    },
    []
  );

  const currentRatioObj = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
  const targetAspect = currentRatioObj ? currentRatioObj.ratio : 9 / 16;
  const boxWidthPercent = (targetAspect / (16 / 9)) * 100;
  const leftOffset = (cropPosition / 100) * (100 - boxWidthPercent);

  const getOverlayStyle = () => {
    if (aspectRatio === "16:9") return { display: "none" };
    return {
      width: `${boxWidthPercent}%`,
      left: `${leftOffset}%`,
      height: "100%",
      // Hardware acceleration hint
      willChange: "left",
    };
  };

  return (
    <section
      className="bg-background text-foreground py-12 font-sans"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
      id="video-editor"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header & Input Sections (Unchanged) */}
        <div className="text-center mb-8 space-y-4 animate-in fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Reframe. Crop. <span className="text-primary">Create.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn long-form YouTube videos into engaging shorts in seconds.
          </p>
        </div>

        <Card className="border-0 shadow-l bg-card/50 backdrop-blur-xl ring-1 ring-border/50 mb-12 overflow-hidden">
          <CardContent className="p-1">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-muted-foreground">
                <Youtube className="w-6 h-6" />
              </div>
              <Input
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
                  className="h-12 px-6 rounded-lg font-semibold"
                >
                  {isLoadingInfo ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Load Video"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {videoInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom duration-700">
            {/* Left Column (Metadata/Controls) - Unchanged mostly */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border rounded-xl p-4 flex gap-4 items-start shadow-sm">
                {videoInfo.thumbnail && (
                  <div className="w-32 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={videoInfo.thumbnail}
                      alt="Thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
                    {videoInfo.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {videoInfo.channel}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {secondsToTime(videoInfo.duration)}
                  </Badge>
                </div>
              </div>

              <Separator />

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
                <Slider
                  min={0}
                  max={videoInfo.duration}
                  step={1}
                  value={[timeToSeconds(startTime), timeToSeconds(endTime)]}
                  onValueChange={(v) => {
                    setStartTime(secondsToTime(v[0]));
                    setEndTime(secondsToTime(v[1]));
                    setFetchedVideo(null);
                  }}
                  className="py-2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Start
                    </Label>
                    <Input
                      value={startTime}
                      readOnly
                      className="text-center bg-muted/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase">
                      End
                    </Label>
                    <Input
                      value={endTime}
                      readOnly
                      className="text-center bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Output Format
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all hover:bg-muted",
                        aspectRatio === ratio.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "bg-card"
                      )}
                    >
                      <ratio.Icon
                        className={cn(
                          "w-4 h-4",
                          aspectRatio === ratio.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!fetchedVideo && (
                <Button
                  onClick={() => fetchMutation.mutate()}
                  disabled={fetchMutation.isPending}
                  className="w-full h-11 font-medium shadow-lg mt-4"
                >
                  {fetchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Preparing Clip...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" /> Prepare for Editing
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Visual Editor */}
            <div className="lg:col-span-7" id="visual-editor">
              {fetchedVideo ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> Editor Ready
                    </Label>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MoveHorizontal className="w-4 h-4" /> Drag frame to crop
                    </div>
                  </div>

                  <div
                    className="relative rounded-xl overflow-hidden bg-black shadow-2xl border border-border/50 group"
                    ref={containerRef}
                    onMouseMove={handleDragMove}
                    onTouchMove={handleDragMove}
                  >
                    <div className="aspect-video relative">
                      <video
                        ref={videoRef}
                        src={fetchedVideo.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        muted={isMuted} // Controlled mute state
                        playsInline
                      />

                      {/* Left Blur Curtain */}
                      {aspectRatio !== "16:9" && (
                        <div
                          className="absolute top-0 left-0 h-full bg-black/60 backdrop-blur-md z-10 pointer-events-none transition-all duration-75 ease-linear will-change-[width]"
                          style={{ width: `${leftOffset}%` }}
                        />
                      )}

                      {/* Right Blur Curtain */}
                      {aspectRatio !== "16:9" && (
                        <div
                          className="absolute top-0 right-0 h-full bg-black/60 backdrop-blur-md z-10 pointer-events-none transition-all duration-75 ease-linear will-change-[width]"
                          style={{
                            width: `${100 - (leftOffset + boxWidthPercent)}%`,
                          }}
                        />
                      )}

                      {/* Crop Box */}
                      <div
                        className={cn(
                          "absolute top-0 h-full border-2 border-white/90 shadow-2xl cursor-grab active:cursor-grabbing z-20",
                          isDragging && "border-primary"
                        )}
                        style={getOverlayStyle()}
                        onMouseDown={() => setIsDragging(true)}
                        onTouchStart={() => setIsDragging(true)}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                          <div className="border-r border-white/50 h-full col-start-2" />
                          <div className="border-r border-white/50 h-full col-start-3" />
                          <div className="border-b border-white/50 w-full row-start-2 absolute top-0" />
                          <div className="border-b border-white/50 w-full row-start-3 absolute top-0" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none">
                          <MoveHorizontal className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* CONTROLS OVERLAY */}
                      <div className="absolute bottom-4 left-4 z-30 flex gap-2">
                        <button
                          onClick={() => {
                            if (videoRef.current?.paused) {
                              videoRef.current.play();
                              setIsPlaying(true);
                            } else {
                              videoRef.current?.pause();
                              setIsPlaying(false);
                            }
                          }}
                          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
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
                      className="w-full sm:w-auto px-8 font-bold shadow-xl"
                    >
                      {processMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" /> Download Final
                          Clip
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] rounded-xl border-2 border-dashed border-muted-foreground/10 bg-muted/5 flex flex-col items-center justify-center text-center p-8">
                  <div className="relative mb-4">
                    <div className="bg-background p-4 rounded-full shadow-sm relative z-10">
                      <Monitor
                        className={cn(
                          "w-8 h-8 text-muted-foreground/40",
                          fetchMutation.isPending && "text-primary"
                        )}
                      />
                    </div>
                    {fetchMutation.isPending && (
                      <div className="absolute inset-0 -m-1.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin w-[calc(100%+0.75rem)] h-[calc(100%+0.75rem)]"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    {fetchMutation.isPending
                      ? "Preparing Clip..."
                      : "Visual Editor"}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 max-w-xs mt-2">
                    {fetchMutation.isPending
                      ? "Streaming high-quality video data..."
                      : "Select your time range and click 'Prepare for Editing' to enable the visual cropper."}
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
