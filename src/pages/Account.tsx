import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Heart, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  
  // State for real user data
  const [user, setUser] = useState({ name: "Guest User", email: "demo@looped.app" });
  const [stats, setStats] = useState({ active: 3, sold: 12, totalEarned: 2340 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setLoading(false);
        return; // Stay in Demo Mode for recruiters
      }

      // 1. Set User Details
      setUser({ 
        name: currentUser.user_metadata.full_name || "User", 
        email: currentUser.email || "" 
      });

      // 2. Fetch Real Stats
      const { data: listings, error } = await supabase
        .from("listings")
        .select("status, price")
        .eq("user_id", currentUser.id)
        .is("archived_at", null);

      if (!error && listings) {
        const active = listings.filter(l => l.status === "active").length;
        const sold = listings.filter(l => l.status === "sold").length;
        const earned = listings.filter(l => l.status === "sold").reduce((sum, l) => sum + (l.price || 0), 0);
        
        setStats({ active, sold, totalEarned: earned });
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleFeedback = async (label: string) => {
    setSelectedFeedback(label);
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert({
      rating: label.toLowerCase().replace(" ", "_"),
      user_id: currentUser?.id || null, // Allows anonymous feedback from recruiters
      message: "Submitted via Editorial UI"
    });

    if (!error) {
      toast({
        title: "Feedback received",
        description: "Thanks for helping us make Looped better! 💚",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({ title: "Signed out", description: "See you next time!" });
      navigate("/");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-8">Account</h1>

        {/* Profile Card */}
        <div className="mb-10 bg-accent/30 p-6 rounded-2xl border border-border/50">
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-foreground">{stats.active}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Active</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-foreground">{stats.sold}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Sold</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-primary">${stats.totalEarned.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Earned</p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3 mb-10">
          {/* Archived Items */}
          <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200">
            <button
              onClick={() => setArchivedOpen(!archivedOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-bold text-foreground hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                Archived Items
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${archivedOpen ? "rotate-180" : ""}`} />
            </button>
            {archivedOpen && (
              <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                <p className="text-sm text-muted-foreground italic">No archived items found in your history.</p>
              </div>
            )}
          </div>

          {/* Feedback Utility */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-bold text-foreground hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Feedback
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${feedbackOpen ? "rotate-180" : ""}`} />
            </button>
            {feedbackOpen && (
              <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                <p className="text-sm text-muted-foreground mb-4">How's your experience with the new Looped UI?</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: "😍", label: "Love it" },
                    { emoji: "😐", label: "It's okay" },
                    { emoji: "😤", label: "Needs work" },
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={() => handleFeedback(f.label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        selectedFeedback === f.label
                          ? "border-primary bg-primary/5 scale-[0.98]"
                          : "border-border hover:border-primary/30 hover:bg-accent/30"
                      }`}
                    >
                      <span className="text-3xl">{f.emoji}</span>
                      <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
          <a
            href="mailto:support@looped.app"
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            Contact Support <Heart className="w-3 h-3 text-primary" />
          </a>

          <Button
            variant="ghost"
            className="w-fit rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors p-0 h-auto font-bold text-sm"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Account;