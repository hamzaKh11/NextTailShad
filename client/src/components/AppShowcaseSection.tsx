import { cn } from "@/lib/utils"; // Standard Shadcn utility
import { useEffect, useState } from "react"; // Needed for client-side mode check (optional, but robust)

// Define the paths for your two images
const LIGHT_IMAGE_SRC = "/showcase-dark.jpg";
const DARK_IMAGE_SRC = "/showcase-white.jpg";

export function AppShowcaseSection() {
  // Optional: State to force a re-render on theme change if initial rendering is an issue.
  // We use the 'dark' class provided by the theme provider for the primary control.

  return (
    <section className="relative pb-12 overflow-hidden bg-background">
      {/* --- 1. MINIMAL AMBIENT LIGHT (No heavy patterns) --- */}
      <div className="absolute inset-0 pointer-events-none flex justify-center">
        {/* A single, soft, static glow behind the image */}
        <div className="h-[400px] w-[80%] max-w-[800px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* --- 2. THE STABLE FRAME (No tilting, no jumping) --- */}
        <div className="relative max-w-4xl mx-auto">
          {/* The Border/Container - purely structural, no heavy shadows */}
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-2 md:p-3">
            {/* Inner Content: The "Browser" Window */}
            <div className="relative rounded-lg overflow-hidden border border-border/50 bg-background shadow-sm">
              {/* Sleek Minimal Header */}
              <div className="flex items-center px-4 py-3 border-b border-border/40 bg-muted/20">
                {/* Subtle Window Controls */}
                <div className="flex gap-2 opacity-80">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Optional: Centered "Tab" or Title - Very subtle */}
                <div className="mx-auto">
                  <div className="h-1.5 w-16 rounded-full bg-muted-foreground/10" />
                </div>
              </div>

              {/* The Image Area */}
              <div className="relative bg-muted/10">
                {/* 🚀 IMPROVEMENT: DARK MODE IMAGE (Shown when 'dark' class is present on HTML/body) */}
                <img
                  src={DARK_IMAGE_SRC}
                  alt="App Interface Dark Mode"
                  // Default state: hidden. Theme state: block.
                  className="w-full h-auto block dark:hidden"
                  style={{ imageRendering: "auto" }}
                />

                {/* 🚀 IMPROVEMENT: LIGHT MODE IMAGE (Shown by default, hidden when 'dark' class is present) */}
                <img
                  src={LIGHT_IMAGE_SRC}
                  alt="App Interface Light Mode"
                  // Default state: block. Theme state: hidden.
                  className="w-full h-auto hidden dark:block"
                  style={{ imageRendering: "auto" }}
                />

                {/* --- THE "FADE" OVERLAY --- 
                  This is crucial: The opacity should also adapt slightly to the theme.
                */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-24 to-transparent opacity-20",
                    // Dynamic Gradient based on theme
                    "bg-gradient-to-t from-background"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Optional: A subtle reflection below (The "Apple" style floor reflection) */}
          <div
            className="absolute -bottom-4 left-4 right-4 h-4 bg-primary/20 blur-xl opacity-30 rounded-[100%]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
