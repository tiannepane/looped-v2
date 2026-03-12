import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Sparkles,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import heroCouch from "@/assets/hero-couch.png";

// Calendar animation data
const CALENDAR_MOMENTS = [
  { month: "MARCH", color: "hsl(350, 40%, 70%)", circleDay: 14, label: "Moving Day" },
  { month: "APRIL", color: "hsl(150, 25%, 55%)", circleDay: 8, label: "Spring Cleaning" },
  { month: "JUNE", color: "hsl(45, 70%, 60%)", circleDay: 21, label: "Fresh Start" },
  { month: "SEPTEMBER", color: "hsl(260, 30%, 75%)", circleDay: 3, label: "New Chapter" },
  { month: "JANUARY", color: "hsl(210, 40%, 80%)", circleDay: 17, label: "New City" },
];

const CALENDAR_DAYS = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, null, null],
];

const CalendarAnimation = () => {
  const [momentIndex, setMomentIndex] = useState(0);
  const [phase, setPhase] = useState<"circle" | "type" | "hold" | "fade">("circle");
  const [typedChars, setTypedChars] = useState(0);
  const [fading, setFading] = useState(false);

  const moment = CALENDAR_MOMENTS[momentIndex];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "circle") {
      timeout = setTimeout(() => {
        setPhase("type");
        setTypedChars(0);
      }, 900);
    } else if (phase === "type") {
      if (typedChars < moment.label.length) {
        timeout = setTimeout(() => setTypedChars((c) => c + 1), 60);
      } else {
        timeout = setTimeout(() => setPhase("hold"), 200);
      }
    } else if (phase === "hold") {
      timeout = setTimeout(() => {
        setFading(true);
        setPhase("fade");
      }, 2000);
    } else if (phase === "fade") {
      timeout = setTimeout(() => {
        setFading(false);
        setMomentIndex((i) => (i + 1) % CALENDAR_MOMENTS.length);
        setPhase("circle");
        setTypedChars(0);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [phase, typedChars, moment.label.length, momentIndex]);

  return (
    <div
      className="w-56 lg:w-64 bg-card rounded-2xl shadow-xl overflow-hidden select-none"
      style={{
        transform: "rotate(2deg)",
        animation: "calendar-float 4s ease-in-out infinite",
      }}
    >
      <div
        className={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        {/* Color strip */}
        <div className="h-8 rounded-t-2xl" style={{ background: moment.color }} />

        <div className="px-5 pt-3 pb-5">
          {/* Month */}
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-medium text-center mb-3"
            style={{ color: moment.color }}
          >
            {moment.month}
          </p>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-y-1.5 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[9px] text-muted-foreground/50 text-center font-medium">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1.5">
            {CALENDAR_DAYS.flat().map((day, i) => {
              const isCircled = day === moment.circleDay;
              return (
                <div key={i} className="relative flex items-center justify-center h-6">
                  <span className={`text-[10px] ${day ? "text-foreground/30" : ""} text-center`}>
                    {day ?? ""}
                  </span>
                  {isCircled && phase !== "circle" && (
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="12"
                        cy="12"
                        rx="10"
                        ry="9"
                        fill="none"
                        stroke={moment.color}
                        strokeWidth="1.5"
                        strokeDasharray="60"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        style={{ animation: "draw-circle 0.8s ease-out forwards" }}
                        transform="rotate(-10 12 12)"
                      />
                    </svg>
                  )}
                  {isCircled && phase === "circle" && (
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="12"
                        cy="12"
                        rx="10"
                        ry="9"
                        fill="none"
                        stroke={moment.color}
                        strokeWidth="1.5"
                        strokeDasharray="60"
                        strokeDashoffset="60"
                        strokeLinecap="round"
                        style={{ animation: "draw-circle 0.8s ease-out forwards" }}
                        transform="rotate(-10 12 12)"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Typewriter label */}
          <div className="mt-3 h-5 flex items-center justify-center">
            <span
              className="text-xs font-semibold tracking-tight"
              style={{ color: moment.color }}
            >
              {moment.label.slice(0, typedChars)}
              {phase === "type" && (
                <span className="inline-block w-[1px] h-3 ml-0.5 align-middle" style={{ background: moment.color, animation: "blink-cursor 0.6s step-end infinite" }} />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const howItWorks = [
  {
    icon: Camera,
    title: "Drop Your Photos",
    subtitle: "Dump everything. Our AI sorts it out.",
    color: "bg-sage/10",
    iconColor: "text-sage",
  },
  {
    icon: Sparkles,
    title: "AI Does The Heavy Lifting",
    subtitle: "Titles. Descriptions. Prices. Done in seconds.",
    color: "bg-mustard/10",
    iconColor: "text-mustard",
  },
  {
    icon: Share2,
    title: "Post Everywhere",
    subtitle: "Facebook. Kijiji. Karrot. One click each.",
    color: "bg-dusty-rose/10",
    iconColor: "text-dusty-rose",
  },
];

const lifeMoments = [
  {
    emoji: "📦",
    title: "The Big Move",
    quote: "Sold $2,400 of furniture in 3 days before moving to my new place.",
    attribution: "— every Toronto renter, eventually",
    bg: "bg-dusty-rose/15",
  },
  {
    emoji: "🌱",
    title: "Spring Reset",
    quote: "Cleared out 5 years of stuff I forgot I owned. Made $800.",
    attribution: "— your future self will thank you",
    bg: "bg-sage/15",
  },
  {
    emoji: "💍",
    title: "Starting Fresh",
    quote: "Replaced everything from my bachelor pad. Funded half the new furniture.",
    attribution: "— adulting, but make it profitable",
    bg: "bg-mustard/15",
  },
  {
    emoji: "💜",
    title: "Fresh Start",
    quote: "Turned memories into next month's rent. No regrets.",
    attribution: "— closure has never been this productive",
    bg: "bg-lavender/15",
  },
  {
    emoji: "🎒",
    title: "New City, New Room",
    quote: "Furnished my dorm for half price. Sold what I outgrew.",
    attribution: "— student budget, designer taste",
    bg: "bg-soft-blue/20",
  },
];

/** Scroll-reveal hook using IntersectionObserver */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(".scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const Index = () => {
  const pageRef = useScrollReveal();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollCards = (dir: number) => {
    scrollContainerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-background/70 backdrop-blur-md">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground">
          looped
        </Link>
        <Button asChild variant="default" size="sm" className="rounded-lg">
          <Link to="/new">Start Selling</Link>
        </Button>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative flex items-center justify-center min-h-screen px-12">
        <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between gap-8">
          {/* Left: Typography */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-black uppercase leading-[0.9] text-foreground"
              style={{ fontSize: "11vw", letterSpacing: "-0.03em" }}
            >
              MAKE IT<br />COUNT
            </h1>
            <p className="text-xl font-normal text-muted-foreground mt-6 max-w-lg">
              Your stuff changes when your life does. Make it count.
            </p>
            <div className="mt-10">
              <Button
                asChild
                className="rounded-lg px-10 py-4 h-auto text-base font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <Link to="/new">Start Selling</Link>
              </Button>
            </div>
          </div>

          {/* Right: Calendar animation */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <CalendarAnimation />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown
            className="w-5 h-5 text-muted-foreground/40"
            style={{ animation: "slow-bounce 2s ease-in-out infinite" }}
          />
        </div>
      </section>

      {/* ===== SECTION 2: HOW IT WORKS ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="scroll-reveal text-4xl lg:text-5xl font-black tracking-tight text-foreground text-center mb-16">
            Three steps. <span className="wavy-underline">That's it.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div
                key={i}
                className={`scroll-reveal ${step.color} rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Sparkles className={`absolute top-4 right-4 w-4 h-4 ${step.iconColor} opacity-20`} />

                <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center mb-5 shadow-sm">
                  <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PRICING INTELLIGENCE ===== */}
      <section className="py-24 lg:py-32 px-8 bg-mustard/[0.06]">
        <div className="max-w-5xl mx-auto">
          <h2 className="scroll-reveal text-4xl lg:text-5xl font-black tracking-tight text-foreground text-center mb-4">
            We know what your stuff is <span className="wavy-underline">worth</span>
          </h2>
          <p className="scroll-reveal text-base text-muted-foreground max-w-2xl mx-auto text-center mb-16">
            Our pricing engine learns from real sales in your neighborhood. The more people sell, the smarter it gets.
          </p>

          <div className="scroll-reveal relative flex items-center justify-center">
            <div className="hidden lg:block absolute -left-4 top-8 bg-sage/15 text-sage rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-[-3deg]">
              14,000+ prices tracked
            </div>
            <div className="hidden lg:block absolute -right-4 top-16 bg-dusty-rose/15 text-dusty-rose rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-2">
              Updated with every sale
            </div>
            <div className="hidden lg:block absolute -left-8 bottom-8 bg-lavender/15 text-lavender rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-1">
              Postal code accurate
            </div>

            <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full rotate-1 border border-border">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={heroCouch}
                  alt="Couch"
                  className="w-24 h-24 rounded-xl object-contain bg-accent p-2"
                />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    AI Suggested
                  </p>
                  <h3 className="text-lg font-bold text-foreground">
                    Mid-Century Modern Sofa
                  </h3>
                </div>
              </div>

              <p className="text-5xl font-black text-primary mb-4">$340</p>

              <div className="mb-2">
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 rounded-full relative" style={{ width: "100%" }}>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-card shadow-sm"
                      style={{ left: "60%" }}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">$180</span>
                  <span className="text-[10px] text-muted-foreground">$450</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <span className="bg-sage/15 text-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                  92% confidence
                </span>
                <span className="text-xs text-muted-foreground">
                  avg 4 days to sell
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: LIFE TRANSITIONS ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-reveal text-4xl lg:text-5xl font-black tracking-tight text-foreground text-center mb-4">
            For every <span className="wavy-underline">season</span> of your life
          </h2>
          <p className="scroll-reveal text-base text-muted-foreground text-center mb-12">
            Life changes. Your stuff should keep up.
          </p>

          <div className="relative">
            <button
              onClick={() => scrollCards(-1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCards(1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto snap-scroll pb-4 px-2 -mx-2 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {lifeMoments.map((moment, i) => (
                <div
                  key={i}
                  className={`scroll-reveal flex-shrink-0 w-72 ${moment.bg} rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden hover:scale-[1.02] transition-all duration-300`}
                  style={{ aspectRatio: "3/4", transitionDelay: `${i * 80}ms` }}
                >
                  {i % 2 === 0 && <div className="tape-effect" />}

                  <div>
                    <span className="text-4xl block mb-4">{moment.emoji}</span>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                      {moment.title}
                    </h3>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/80 leading-relaxed italic mb-3">
                      "{moment.quote}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {moment.attribution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: FOOTER CTA ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="scroll-reveal text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-3">
            Your stuff is worth more than you think.
          </h2>
          <p className="scroll-reveal text-xl text-muted-foreground italic mb-10">
            Especially that couch.
          </p>
          <div className="scroll-reveal">
            <Button asChild size="lg" className="rounded-xl text-base px-12 h-14 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/new">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <span className="text-sm font-black tracking-tight text-foreground">
            looped
          </span>
          <span className="text-xs text-muted-foreground">
            Made in Toronto 🇨🇦
          </span>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
