import { ArrowRight, Sparkles, Zap, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const scrollToEditor = () => {
    const element = document.getElementById("video-editor");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background/50">
      {/* --- AMBIENT BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        {/* Grid Pattern for Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 py-12 text-center relative z-10">
        {/* --- ANIMATED BADGE (Restored & Polished) --- */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-medium rounded-full bg-background/50 backdrop-blur-sm border-primary/20 text-foreground/80 hover:bg-primary/5 hover:text-primary transition-all cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-primary animate-pulse" />
            <span>Trusted by creators</span>
          </Badge>
        </div>

        {/* --- MAIN HEADLINE --- */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Turn YouTube Videos into <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-extrabold">
              Viral Shorts
            </span>
            {/* Underline decoration */}
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-50"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
              />
            </svg>
          </span>{" "}
          in Seconds
        </h1>

        {/* --- SUBHEADING --- */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          The fastest AI clipper. Paste a link, get high-retention clips
          optimized for TikTok, Reels, and Shorts.
        </p>

        {/* --- CTA BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Button
            size="lg"
            className="h-14 px-8 text-lg rounded-xl shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.7)] transition-all duration-300 hover:scale-105"
            onClick={scrollToEditor}
            data-testid="button-hero-cta"
          >
            <Zap className="w-5 h-5 mr-2 fill-current" />
            Create Clip Now - Free
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg rounded-xl border-2 hover:bg-accent/50 transition-all duration-300"
            onClick={() => {
              const element = document.getElementById("how-it-works");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            See How It Works
          </Button>
        </div>

        {/* --- TRUST INDICATORS (Refined) --- */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>No login needed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Unlimited 4k exports</span>
          </div>
        </div>
      </div>
    </section>
  );
}
