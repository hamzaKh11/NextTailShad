import { Scissors, Crop, Clock, Download, Zap, Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Scissors,
    title: "Precision Cutting",
    description:
      "Select exact start and end times with our intuitive timeline editor. Cut to the perfect moment.",
  },
  {
    icon: Crop,
    title: "Smart Aspect Ratios",
    description:
      "One-click conversion to 9:16 (Reels/TikTok), 1:1 (Instagram), 16:9 (YouTube), or 4:5 (Facebook).",
  },
  {
    icon: Clock,
    title: "Timeline Precision",
    description:
      "Visual timeline with drag-and-drop or manual time input. Control every second of your clip.",
  },
  {
    icon: Download,
    title: "Instant Download",
    description:
      "Download your perfectly cut segment in seconds. High quality, optimized for social media.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Powered by cutting-edge video processing. From YouTube URL to downloaded clip in under 30 seconds.",
  },
  {
    icon: Infinity,
    title: "Unlimited Usage",
    description:
      "Create as many clips as you want. No limits, no subscriptions, no hidden fees. Ever.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Everything You Need to Go{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Viral
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional video editing tools, simplified for creators who value
            speed and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover-elevate transition-all duration-200 border-card-border"
              data-testid={`card-feature-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
