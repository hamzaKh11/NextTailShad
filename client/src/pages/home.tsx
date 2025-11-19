import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { SocialProofSection } from "@/components/social-proof-section";
import { VideoEditor } from "@/components/video-editor";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { AppShowcaseSection } from "@/components/AppShowcaseSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AppShowcaseSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <VideoEditor />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
