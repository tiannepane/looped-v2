import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Sparkles,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import heroCouch from "@/assets/hero-couch.png";
import heroLamp from "@/assets/hero-lamp.png";
import heroKeyboard from "@/assets/hero-keyboard.png";
import heroSneakers from "@/assets/hero-sneakers.png";
import heroRecordplayer from "@/assets/hero-recordplayer.png";
import heroTable from "@/assets/hero-table.png";

// Floating product photos for hero
const floatingItems = [
  { src: heroCouch, alt: "Couch", className: "w-44 top-[10%] left-[6%] animate-float-1" },
  { src: heroLamp, alt: "Lamp", className: "w-28 top-[6%] right-[10%] animate-float-2" },
  { src: heroKeyboard, alt: "Keyboard", className: "w-36 bottom-[22%] left-[12%] animate-float-3" },
  { src: heroSneakers, alt: "Sneakers", className: "w-32 top-[18%] right-[22%] animate-float-4" },
  { src: heroRecordplayer, alt: "Record Player", className: "w-40 bottom-[14%] right-[6%] animate-float-5" },
  { src: heroTable, alt: "Table", className: "w-48 bottom-[28%] left-[38%] animate-float-6" },
];

// TODO: Replace with 3D illustrated characters from artist/Midjourney
const lifeMomentCards = [
  { emoji: "📦", label: "Moving Day", color: "bg-dusty-rose/20", className: "w-28 top-[30%] left-[3%] rotate-3 animate-float-7" },
  { emoji: "💍", label: "New Chapter", color: "bg-sage/20", className: "w-24 top-[5%] left-[28%] rotate-[-5deg] animate-float-8" },
  { emoji: "🧹", label: "Spring Reset", color: "bg-mustard/20", className: "w-26 bottom-[10%] right-[22%] rotate-[4deg] animate-float-9" },
  { emoji: "💜", label: "Fresh Start", color: "bg-lavender/20", className: "w-24 bottom-[32%] right-[35%] rotate-[-3deg] animate-float-10" },
];

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
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden px-8">
        {/* Floating product photos */}
        {floatingItems.map((item, i) => (
          <img
            key={i}
            src={item.src}
            alt={item.alt}
            className={`absolute pointer-events-none select-none opacity-60 ${item.className}`}
          />
        ))}

        {/* TODO: Replace with 3D illustrated character cards */}
        {lifeMomentCards.map((card, i) => (
          <div
            key={i}
            className={`absolute pointer-events-none select-none ${card.className}`}
          >
            <div className={`${card.color} rounded-2xl px-4 py-5 text-center shadow-sm relative tape-effect`}>
              <span className="text-2xl block mb-1">{card.emoji}</span>
              <span className="text-xs font-semibold text-foreground/70 tracking-tight">
                {card.label}
              </span>
            </div>
          </div>
        ))}

        {/* Decorative sparkles */}
        <Star className="absolute top-[15%] right-[40%] w-4 h-4 text-mustard/40 rotate-12 pointer-events-none" />
        <Star className="absolute bottom-[20%] left-[25%] w-3 h-3 text-dusty-rose/40 rotate-[-20deg] pointer-events-none" />
        <Star className="absolute top-[40%] right-[8%] w-5 h-5 text-lavender/30 rotate-45 pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl">
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tight leading-[0.85] text-foreground mb-6">
            <span className="wavy-underline">Cash</span> It<br />Out
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
            Your stuff changes when your life does. Make it count.
          </p>
          <Button asChild size="lg" className="rounded-xl text-base px-12 h-14 shadow-lg hover:shadow-xl transition-shadow">
            <Link to="/new">Start Selling</Link>
          </Button>
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
                {/* Decorative sparkles in corners */}
                <Sparkles className={`absolute top-4 right-4 w-4 h-4 ${step.iconColor} opacity-20`} />

                <div className={`w-14 h-14 rounded-xl bg-card flex items-center justify-center mb-5 shadow-sm`}>
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
            {/* Stat bubbles */}
            <div className="hidden lg:block absolute -left-4 top-8 bg-sage/15 text-sage rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-[-3deg]">
              14,000+ prices tracked
            </div>
            <div className="hidden lg:block absolute -right-4 top-16 bg-dusty-rose/15 text-dusty-rose rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-2">
              Updated with every sale
            </div>
            <div className="hidden lg:block absolute -left-8 bottom-8 bg-lavender/15 text-lavender rounded-full px-4 py-2 text-xs font-semibold shadow-sm rotate-1">
              Postal code accurate
            </div>

            {/* Pricing mockup card */}
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

              {/* Price range bar */}
              <div className="mb-2">
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/30 rounded-full relative"
                    style={{ width: "100%" }}
                  >
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

          {/* Scroll controls */}
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
                  {/* Tape effect on some cards */}
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
            {/* TODO: Add real links */}
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
