import { Star, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SiYoutube, SiTiktok, SiInstagram } from "react-icons/si";

const stats = [
  {
    icon: Users,
    value: "500K+",
    label: "Creators Worldwide",
  },
  {
    icon: Clock,
    value: "2M+",
    label: "Minutes Downloaded",
  },
  {
    icon: TrendingUp,
    value: "10M+",
    label: "Clips Created",
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average Rating",
  },
];

const platforms = [
  { icon: SiYoutube, name: "YouTube", color: "text-red-500" },
  { icon: SiTiktok, name: "TikTok", color: "text-foreground" },
  { icon: SiInstagram, name: "Instagram", color: "text-pink-500" },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Trusted by Creators{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of content creators making viral clips every day
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-elevate transition-all" data-testid={`stat-${index}`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Support */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">Works seamlessly with</p>
          <div className="flex justify-center items-center gap-8">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center gap-2 hover-elevate p-4 rounded-lg"
                data-testid={`platform-${platform.name.toLowerCase()}`}
              >
                <platform.icon className={`w-10 h-10 ${platform.color}`} />
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
