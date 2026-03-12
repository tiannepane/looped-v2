import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, DollarSign, Share2, ArrowDown } from "lucide-react";
import heroCouch from "@/assets/hero-couch.png";
import heroLamp from "@/assets/hero-lamp.png";
import heroKeyboard from "@/assets/hero-keyboard.png";
import heroSneakers from "@/assets/hero-sneakers.png";
import heroRecordplayer from "@/assets/hero-recordplayer.png";
import heroTable from "@/assets/hero-table.png";

const floatingItems = [
  { src: heroCouch, alt: "Couch", className: "w-48 top-[12%] left-[8%] animate-float-1" },
  { src: heroLamp, alt: "Lamp", className: "w-32 top-[8%] right-[12%] animate-float-2" },
  { src: heroKeyboard, alt: "Keyboard", className: "w-40 bottom-[18%] left-[15%] animate-float-3" },
  { src: heroSneakers, alt: "Sneakers", className: "w-36 top-[22%] right-[25%] animate-float-4" },
  { src: heroRecordplayer, alt: "Record Player", className: "w-44 bottom-[12%] right-[8%] animate-float-5" },
  { src: heroTable, alt: "Table", className: "w-52 bottom-[25%] left-[40%] animate-float-6" },
];

const steps = [
  { icon: Camera, label: "Upload Photos", desc: "Snap a few pics" },
  { icon: Sparkles, label: "AI Generates Listing", desc: "Title, description, category" },
  { icon: DollarSign, label: "Get Price Recommendation", desc: "Based on local market data" },
  { icon: Share2, label: "Post Everywhere", desc: "FB Marketplace & Karrot" },
];

const soldItems = [
  { name: "IKEA Kallax Shelf", price: 85, days: 2, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=225&fit=crop" },
  { name: "Mechanical Keyboard", price: 120, days: 1, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=225&fit=crop" },
  { name: "Vintage Desk Lamp", price: 45, days: 3, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=225&fit=crop" },
  { name: "Nike Air Max 90", price: 95, days: 1, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=225&fit=crop" },
  { name: "Dining Table Set", price: 350, days: 4, img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&h=225&fit=crop" },
  { name: "Record Player", price: 160, days: 2, img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=225&fit=crop" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-background/80 backdrop-blur-sm">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground">
          looped
        </Link>
        <Button asChild variant="default" size="sm" className="rounded-lg">
          <Link to="/new">Start Selling</Link>
        </Button>
      </nav>

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden px-8">
        {/* Floating product images */}
        {floatingItems.map((item, i) => (
          <img
            key={i}
            src={item.src}
            alt={item.alt}
            className={`absolute pointer-events-none select-none opacity-70 ${item.className}`}
          />
        ))}

        <div className="relative z-10 text-center max-w-5xl">
          <h1 className="text-8xl lg:text-[10rem] font-black tracking-tight leading-[0.85] text-foreground mb-8">
            Cash It<br />Out
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
            AI-powered listings. Smart pricing. Cross-post everywhere.
          </p>
          <Button asChild size="lg" className="rounded-lg text-base px-10 h-14">
            <Link to="/new">Start Selling</Link>
          </Button>
        </div>

        <button
          onClick={() => document.getElementById("section-1")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* Section 1 */}
      <section id="section-1" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 max-w-2xl">
            Your stuff is worth more than you think.
          </h2>
          <p className="text-xl text-muted-foreground mb-16">Especially that couch.</p>

          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border">
              <img
                src={heroCouch}
                alt="A couch for sale"
                className="w-full h-full object-contain bg-card p-8"
              />
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">AI-Generated Listing</span>
              <h3 className="text-2xl font-bold text-foreground mb-1">Mid-Century Modern Sofa</h3>
              <p className="text-3xl font-bold text-primary mb-4">$480</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Beautiful mid-century modern sofa in warm orange. Solid wood legs with tufted back cushion. 
                Clean, no stains or tears. Pet-free, smoke-free home. Perfect for a living room or reading nook. 
                Pickup only — downtown Toronto.
              </p>
              <div className="flex gap-2 mt-6">
                <span className="text-xs uppercase tracking-widest px-3 py-1 bg-accent rounded-md text-accent-foreground">Furniture</span>
                <span className="text-xs uppercase tracking-widest px-3 py-1 bg-accent rounded-md text-accent-foreground">Good Condition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="py-32 px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 max-w-3xl">
            Moving in 2 weeks?
          </h2>
          <p className="text-xl text-muted-foreground mb-20">We'll get your stuff sold in 2 minutes.</p>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center mx-auto mb-6 border border-border">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Step {i + 1}</div>
                <h3 className="font-bold text-foreground mb-1">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 max-w-3xl">
            Spring cleaning, but you actually make money this time.
          </h2>
          <p className="text-xl text-muted-foreground mb-16">Recent sells from Looped users.</p>

          <div className="grid grid-cols-3 gap-6">
            {soldItems.map((item, i) => (
              <div
                key={i}
                className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md hover:scale-[1.02] transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                  <p className="text-primary font-bold text-lg">${item.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sold in {item.days} day{item.days > 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-black tracking-tight text-foreground">looped</span>
          <span className="text-xs text-muted-foreground">© 2026 Looped. Cash it out.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
