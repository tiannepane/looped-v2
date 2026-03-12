import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const Account = () => {
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  // TODO: connect to Supabase
  const user = { name: "Alex Chen", email: "alex@example.com" };
  const stats = { active: 3, sold: 12, totalEarned: 2340 };

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-8">Account</h1>

        {/* Profile */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-3xl font-black text-foreground">{stats.active}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Active</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-3xl font-black text-foreground">{stats.sold}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Sold</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-3xl font-black text-primary">${stats.totalEarned}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Earned</p>
          </div>
        </div>

        {/* Archived Items */}
        <div className="border border-border rounded-lg mb-4">
          <button
            onClick={() => setArchivedOpen(!archivedOpen)}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground"
          >
            Archived Items
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${archivedOpen ? "rotate-180" : ""}`} />
          </button>
          {archivedOpen && (
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">No archived items yet.</p>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="border border-border rounded-lg mb-10">
          <button
            onClick={() => setFeedbackOpen(!feedbackOpen)}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground"
          >
            Feedback
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${feedbackOpen ? "rotate-180" : ""}`} />
          </button>
          {feedbackOpen && (
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-4">How's your experience with Looped?</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: "😍", label: "Love it" },
                  { emoji: "😐", label: "It's okay" },
                  { emoji: "😤", label: "Needs work" },
                ].map((f) => (
                  <button
                    key={f.label}
                    onClick={() => {
                      setSelectedFeedback(f.label);
                      // TODO: submit feedback to Supabase
                    }}
                    className={`flex flex-col items-center gap-2 p-6 rounded-lg border transition-all duration-200 ${
                      selectedFeedback === f.label
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-3xl">{f.emoji}</span>
                    <span className="text-xs text-muted-foreground font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
              {selectedFeedback && (
                <p className="text-sm text-success mt-4">Thanks for your feedback! 💚</p>
              )}
            </div>
          )}
        </div>

        {/* FAQ & Sign Out */}
        <a
          href="https://example.com/faq"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors block mb-6"
        >
          FAQ →
        </a>

        <Button
          variant="outline"
          className="rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={() => {
            // TODO: sign out with Supabase
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default Account;
