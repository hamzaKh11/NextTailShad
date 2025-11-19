import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShowcaseSection() {
  const scrollToEditor = () => {
    // Make sure your editor section has id="video-editor" or change this to "editor"
    const element = document.getElementById("video-editor");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-10 pb-10 overflow-hidden bg-white/90">
      {/* --- AMBIENT BACKGROUND GLOW & TEXTURE --- */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Subtle Indigo/Purple Blur Blobs */}
        <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
        <div className="absolute bottom-0 right-[-20%] w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[100px] mix-blend-multiply opacity-50" />

        {/* Subtle Diagonal Lines for Texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diagonalLines"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2"
                stroke="#4f46e5"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLines)" />
        </svg>
      </div>

      <div className="container mx-auto px-2 text-center relative z-10">
        {/* --- SPOTLIGHT IMAGE SHOWCASE --- */}
        {/* max-w-4xl prevents the image from stretching and looking pixelated */}
        <div className="relative group max-w-4xl mx-auto transform hover:scale-[1.005] transition-transform duration-500 ease-out perspective-1000">
          {/* 1. BLURRED AURA (Hides pixelation & adds glow) */}
          <div className="absolute inset-0 filter blur-3xl opacity-60 transition-opacity duration-500">
            <img
              src="/showcase.jpg"
              alt="Blurred Editor Background"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          {/* 2. MAIN FOCUSED IMAGE FRAME */}
          <div className="relative rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100/80 bg-white/95 backdrop-blur-md transform rotate-x-3 hover:rotate-x-0 transition-all duration-700 ease-in-out">
            {/* Window Controls Header */}
            <div className="absolute top-0 left-0 right-0 h-8 md:h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 rounded-t-xl z-10">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
            </div>

            {/* The Actual Screenshot */}
            {/* Padding top (pt-8) pushes image down below the window controls */}
            <div className="pt-8 md:pt-10 rounded-xl overflow-hidden">
              <img
                src="/showcase.jpg"
                alt="ClipFlow Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
