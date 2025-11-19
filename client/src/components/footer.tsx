import { Heart } from "lucide-react";
import { Link } from "wouter";
export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                <img
                  src="/logo.png"
                  alt="ClipFlow Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ClipFlow
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Turn YouTube videos into viral Reels, TikToks, and Shorts in
              seconds. Free, fast, and powerful.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("faq")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ClipFlow is a free tool for content creators to easily cut and
              optimize YouTube videos for social media.
            </p>
            <p className="text-sm text-muted-foreground">
              No limits. No signup. No fees.
            </p>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" />{" "}
            for content creators worldwide
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} ClipFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
