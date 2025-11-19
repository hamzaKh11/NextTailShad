import { Link } from "wouter";
// Removed Scissors import as it is no longer needed
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center hover-elevate active-elevate-2 rounded-lg px-3 py-2"
          data-testid="link-home"
        >
          <img
            src="/logo.png"
            alt="ClipFlow Logo"
            className="w-8 h-8 object-contain"
          />

          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ClipFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            data-testid="button-nav-how-it-works"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            data-testid="button-nav-features"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            data-testid="button-nav-faq"
          >
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => scrollToSection("editor")}
            data-testid="button-try-now"
          >
            Try Free Now
          </Button>
        </div>
      </div>
    </header>
  );
}
