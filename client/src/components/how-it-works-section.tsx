import { ArrowRight, Link as LinkIcon, Scissors, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    icon: LinkIcon,
    title: "Paste YouTube URL",
    description:
      "Copy any YouTube video link and paste it into ReelCutter. We'll load the video instantly.",
  },
  {
    number: "2",
    icon: Scissors,
    title: "Select Your Segment",
    description:
      "Use our visual timeline or type exact timestamps. Pick the perfect clip in seconds.",
  },
  {
    number: "3",
    icon: Download,
    title: "Download & Share",
    description:
      "Get your optimized video segment ready for TikTok, Reels, or Shorts. It's that easy!",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Simple as 1-2-3
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From YouTube URL to viral-ready clip in three simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                data-testid={`step-${index}`}
              >
                <Card className="w-full hover-elevate transition-all duration-200">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-lg opacity-30" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                          <step.icon className="w-10 h-10" />
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
