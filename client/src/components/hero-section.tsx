import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const scrollToEditor = () => {
    const element = document.getElementById("editor");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(138,43,226,0.1),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(138,43,226,0.05),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-24 text-center">
        {/* Social Proof Badge */}
        <div className="flex justify-center mb-8">
          <Badge
            variant="secondary"
            className="px-4 py-2 text-sm gap-2 hover-elevate"
            data-testid="badge-social-proof"
          >
            <Sparkles className="w-4 h-4" />
            500K+ clips created by creators worldwide
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6 max-w-5xl mx-auto">
          YouTube → Viral{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Reels
          </span>{" "}
          in 30 Seconds
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          No editing skills. No downloads. No signup.{" "}
          <br className="hidden md:block" />
          Just paste your YouTube URL and create perfect clips for TikTok, Instagram Reels, or Shorts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="h-14 px-8 text-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
            onClick={scrollToEditor}
            data-testid="button-hero-cta"
          >
            <Zap className="w-5 h-5" />
            Try Free Now
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg"
            onClick={() => {
              const element = document.getElementById("how-it-works");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-hero-learn-more"
          >
            See How It Works
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>No signup needed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>100% free forever</span>
          </div>
        </div>
      </div>
    </section>
  );
}
