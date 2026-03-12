import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroCouch from "@/assets/hero-couch.png";

// Calendar animation data — 8 life events
const CALENDAR_MOMENTS = [
  { month: "MARCH", color: "hsl(350, 40%, 70%)", circleDay: 14, label: "Moving Day" },
  { month: "MAY", color: "hsl(150, 25%, 55%)", circleDay: 22, label: "Graduation" },
  { month: "JULY", color: "hsl(45, 70%, 60%)", circleDay: 1, label: "First Apartment" },
  { month: "APRIL", color: "hsl(260, 30%, 75%)", circleDay: 8, label: "Spring Cleaning" },
  { month: "OCTOBER", color: "hsl(210, 40%, 80%)", circleDay: 17, label: "The Breakup" },
  { month: "AUGUST", color: "hsl(35, 80%, 55%)", circleDay: 12, label: "New Job New City" },
  { month: "JUNE", color: "hsl(155, 40%, 45%)", circleDay: 21, label: "Wedding" },
  { month: "SEPTEMBER", color: "hsl(215, 15%, 55%)", circleDay: 3, label: "Back to School" },
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
      className="w-[28rem] lg:w-[32rem] bg-card rounded-2xl shadow-xl overflow-hidden select-none"
      style={{
        transform: "rotate(2deg)",
        animation: "calendar-float 4s ease-in-out infinite",
      }}
    >
      <div
        className={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <div className="h-12 rounded-t-2xl" style={{ background: moment.color }} />

        <div className="px-8 pt-5 pb-8">
          <p
            className="text-sm uppercase tracking-[0.2em] font-medium text-center mb-4"
            style={{ color: moment.color }}
          >
            {moment.month}
          </p>

          <div className="grid grid-cols-7 gap-y-2.5 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-xs text-muted-foreground/50 text-center font-medium">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2.5">
            {CALENDAR_DAYS.flat().map((day, i) => {
              const isCircled = day === moment.circleDay;
              return (
                <div key={i} className="relative flex items-center justify-center h-8">
                  <span className={`text-sm ${day ? "text-foreground/30" : ""} text-center`}>
                    {day ?? ""}
                  </span>
                  {isCircled && phase !== "circle" && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="9" fill="none" stroke={moment.color} strokeWidth="1.5" strokeDasharray="60" strokeDashoffset="0" strokeLinecap="round" style={{ animation: "draw-circle 0.8s ease-out forwards" }} transform="rotate(-10 12 12)" />
                    </svg>
                  )}
                  {isCircled && phase === "circle" && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="9" fill="none" stroke={moment.color} strokeWidth="1.5" strokeDasharray="60" strokeDashoffset="60" strokeLinecap="round" style={{ animation: "draw-circle 0.8s ease-out forwards" }} transform="rotate(-10 12 12)" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 h-12 flex items-center justify-center">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ color: moment.color, fontFamily: "'Gaegu', cursive" }}
            >
              {moment.label.slice(0, typedChars)}
              {phase === "type" && (
                <span className="inline-block w-[2px] h-5 ml-0.5 align-middle" style={{ background: moment.color, animation: "blink-cursor 0.6s step-end infinite" }} />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checklist items
const checklistItems = [
  { title: "Drop your photos", subtitle: "Dump everything. Our AI sorts it out." },
  { title: "AI does the heavy lifting", subtitle: "Titles. Descriptions. Prices. All generated in seconds." },
  { title: "Post everywhere", subtitle: "Facebook Marketplace. Kijiji. Karrot. One click each." },
];

// Life event cards for wave section
const lifeEvents = [
  { emoji: "📦", title: "The Big Move", quote: "Sold $2,400 of furniture in 3 days before moving to my new place.", attribution: "— every Toronto renter, eventually", above: true },
  { emoji: "🎓", title: "Graduation", quote: "Finally upgrading from the dorm furniture era. Made $600 off stuff I bought freshman year.", attribution: "— time to adult", above: false },
  { emoji: "🏠", title: "First Apartment", quote: "Bought secondhand, sold secondhand. The circle of Toronto renting.", attribution: "— your first IKEA trip hits different", above: true },
  { emoji: "🌱", title: "Spring Cleaning", quote: "Cleared out 5 years of stuff I forgot I owned. Made $800.", attribution: "— your future self will thank you", above: false },
  { emoji: "💔", title: "The Breakup", quote: "Turned memories into next month's rent. No regrets.", attribution: "— closure has never been this productive", above: true },
  { emoji: "💼", title: "New Job, New City", quote: "Sold everything in Toronto. Starting fresh in Vancouver with cash in hand.", attribution: "— plot twist: you can't take the couch on the plane", above: false },
  { emoji: "💍", title: "Wedding", quote: "Replaced everything from the bachelor pad. Funded half the new furniture.", attribution: "— adulting, but make it profitable", above: true },
  { emoji: "🎒", title: "Back to School", quote: "Furnished my place for half price. Sold what I outgrew.", attribution: "— student budget, designer taste", above: false },
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

/** Checklist animation hook */
function useChecklistAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Sequential check animations
            setTimeout(() => setChecked(p => { const n = [...p]; n[0] = true; return n; }), 500);
            setTimeout(() => setChecked(p => { const n = [...p]; n[1] = true; return n; }), 1500);
            setTimeout(() => setChecked(p => { const n = [...p]; n[2] = true; return n; }), 2500);
            setTimeout(() => setAllDone(true), 3200);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, checked, allDone };
}

/** Wave section visibility hook */
function useWaveAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const Index = () => {
  const pageRef = useScrollReveal();
  const checklist = useChecklistAnimation();
  const wave = useWaveAnimation();
  const [sliderValue, setSliderValue] = useState(60); // 0-100 range mapped to $180-$450

  const price = Math.round(180 + (sliderValue / 100) * 270);
  const zone = sliderValue < 33 ? "quick" : sliderValue < 66 ? "average" : "patient";

  const zoneComments: Record<string, string> = {
    quick: "Priced to go fast. Expect messages within hours.",
    average: "Right in the sweet spot. Should sell within a week.",
    patient: "Top dollar. Might take a few weeks, but worth the wait.",
  };

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-background/70 backdrop-blur-md">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground">
          looped
        </Link>
        <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full font-bold" style={{ fontFamily: "'Gaegu', cursive" }}>
          <Link to="/new">Start Selling</Link>
        </Button>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center min-h-screen px-12">
        <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 min-w-0">
            <h1
              className="font-black uppercase leading-[0.9] text-foreground"
              style={{ fontSize: "8vw", letterSpacing: "-0.03em" }}
            >
              MAKE IT<br />COUNT
            </h1>
            <p className="text-muted-foreground mt-6 max-w-lg font-bold" style={{ fontFamily: "'Gaegu', cursive", fontSize: "2.4rem", lineHeight: 1.2 }}>
              Your stuff changes when your life does.
            </p>
            <div className="mt-10">
              <Button
                asChild
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 py-4 h-auto text-lg font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                style={{ fontFamily: "'Gaegu', cursive" }}
              >
                <Link to="/new">List Your First Item</Link>
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <CalendarAnimation />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown
            className="w-5 h-5 text-muted-foreground/40"
            style={{ animation: "slow-bounce 2s ease-in-out infinite" }}
          />
        </div>
      </section>

      {/* ===== SECTION 1: HOW IT WORKS — ANIMATED CHECKLIST ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="scroll-reveal text-4xl font-bold tracking-tight text-foreground text-center mb-16">
            Three steps. That's it.
          </h2>

          <div ref={checklist.ref} className="max-w-2xl mx-auto relative" style={{ transform: "rotate(-0.5deg)" }}>
            {/* Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-mustard/40 rounded-sm z-10" style={{ transform: "rotate(-2deg)" }} />

            <div className="bg-card rounded-xl shadow-xl p-10 space-y-8">
              {checklistItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="w-6 h-6 border-2 border-muted-foreground/40 rounded-sm flex-shrink-0 mt-0.5 relative">
                    {checklist.checked[i] && (
                      <svg className="absolute inset-0 w-full h-full p-0.5" viewBox="0 0 16 16">
                        <path
                          d="M3 8 L6.5 11.5 L13 4"
                          fill="none"
                          stroke="hsl(18, 60%, 50%)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="checklist-check-draw"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="relative inline-block">
                      <p className="text-xl font-semibold text-foreground">{item.title}</p>
                      {checklist.checked[i] && (
                        <div className="checklist-strike" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
                  </div>
                </div>
              ))}

              {/* "That's it" note */}
              <div
                className="transition-opacity duration-500 pt-2"
                style={{ opacity: checklist.allDone ? 1 : 0 }}
              >
                <p className="text-sm italic text-muted-foreground">That's it. You're done.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: PRICING INTELLIGENCE ===== */}
      <section className="py-24 lg:py-32 px-8 bg-mustard/[0.06]">
        <div className="max-w-5xl mx-auto">
          <h2 className="scroll-reveal text-4xl font-bold tracking-tight text-foreground text-center mb-4">
            We know what your stuff is worth
          </h2>
          <p className="scroll-reveal text-2xl text-muted-foreground max-w-2xl mx-auto text-center mb-16" style={{ fontFamily: "'Gaegu', cursive" }}>
            Our pricing engine learns from real sales in your neighborhood. The more people sell, the smarter it gets.
          </p>

          <div className="scroll-reveal relative flex items-center justify-center">
            {/* Scattered sticky notes */}
            <div className="hidden lg:block absolute -left-8 top-4 w-48 h-32 bg-dusty-rose/20 rounded-lg shadow-md p-4 flex items-center justify-center" style={{ transform: "rotate(-2deg)" }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mustard/50 rounded-sm" style={{ transform: "rotate(3deg)" }} />
              <p className="text-lg font-bold text-foreground text-center mt-2">14,000+<br /><span className="text-sm font-normal text-muted-foreground">prices tracked</span></p>
            </div>

            <div className="hidden lg:block absolute -right-4 top-12 w-48 h-32 bg-sage/20 rounded-lg shadow-md p-4 flex items-center justify-center" style={{ transform: "rotate(1deg)" }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mustard/50 rounded-sm" style={{ transform: "rotate(-2deg)" }} />
              <p className="text-lg font-bold text-foreground text-center mt-2">Updated<br /><span className="text-sm font-normal text-muted-foreground">with every sale</span></p>
            </div>

            <div className="hidden lg:block absolute -left-4 bottom-4 w-48 h-32 bg-mustard/20 rounded-lg shadow-md p-4 flex items-center justify-center" style={{ transform: "rotate(-1.5deg)" }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mustard/50 rounded-sm" style={{ transform: "rotate(1deg)" }} />
              <p className="text-lg font-bold text-foreground text-center mt-2">Postal code<br /><span className="text-sm font-normal text-muted-foreground">accurate</span></p>
            </div>

            {/* Center pricing card */}
            <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border relative z-10" style={{ transform: "rotate(1deg)" }}>
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

              <p className="text-5xl font-black text-primary mb-6">${price}</p>

              {/* Interactive slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="pricing-slider w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Quick Sale<br /><span className="font-semibold">$180</span></span>
                  <span className="text-xs text-muted-foreground text-center">Market Average<br /><span className="font-semibold">$315</span></span>
                  <span className="text-xs text-muted-foreground text-right">Patient<br /><span className="font-semibold">$450</span></span>
                </div>
              </div>

              {/* Zone comment with crossfade */}
              <div className="h-10 flex items-center">
                <p key={zone} className="text-sm italic text-muted-foreground animate-fade-in">
                  {zoneComments[zone]}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                92% confidence · Based on 10 sold items in Toronto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: LIFE TRANSITIONS — STICKY NOTES ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-reveal text-4xl font-bold tracking-tight text-foreground text-center mb-4">
            For every season of your life
          </h2>
          <p className="scroll-reveal text-2xl text-muted-foreground text-center mb-16" style={{ fontFamily: "'Gaegu', cursive" }}>
            Life changes. Your stuff should keep up.
          </p>

          <div ref={wave.ref} className="relative flex flex-wrap justify-center gap-x-6 gap-y-10 max-w-5xl mx-auto">
            {lifeEvents.map((event, i) => {
              const rotations = [-3, 2.5, -1.5, 3, -2, 1.5, -2.5, 2];
              const offsets = ["mt-0", "mt-8", "mt-2", "mt-10", "mt-4", "mt-6", "mt-1", "mt-9"];
              return (
                <div
                  key={i}
                  className={`relative w-56 bg-card rounded-xl shadow-md p-5 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ${offsets[i]}`}
                  style={{
                    transform: `rotate(${rotations[i]}deg)`,
                    opacity: wave.isVisible ? 1 : 0,
                    transition: `opacity 0.5s ease-out ${i * 0.1}s, transform 0.5s ease-out ${i * 0.1}s, box-shadow 0.3s ease`,
                  }}
                >
                  {/* Tape */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mustard/40 rounded-sm z-10"
                    style={{ transform: `rotate(${i % 2 === 0 ? -3 : 4}deg)` }}
                  />
                  <span className="text-2xl block mb-2">{event.emoji}</span>
                  <h3 className="text-base font-bold tracking-tight text-foreground mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground italic leading-relaxed mb-2">"{event.quote}"</p>
                  <p className="text-xs text-muted-foreground">{event.attribution}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: FOOTER CTA ===== */}
      <section className="py-24 lg:py-32 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="scroll-reveal text-4xl font-bold tracking-tight text-foreground mb-3">
            Your stuff is worth more than you think.
          </h2>
          <p className="scroll-reveal text-2xl text-muted-foreground italic mb-10" style={{ fontFamily: "'Gaegu', cursive" }}>
            Especially that couch.
          </p>
          <div className="scroll-reveal">
            <Button
              asChild
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 py-4 h-auto text-lg font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              <Link to="/new">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <span className="text-sm font-black tracking-tight text-foreground">looped</span>
          <span className="text-xs text-muted-foreground">Looped · Made in Toronto 🇨🇦</span>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#" className="hover:text-foreground transition-colors">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
