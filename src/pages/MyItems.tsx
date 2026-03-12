import { useState } from "react";
import AppLayout from "@/components/AppLayout";

interface Item {
  id: string;
  title: string;
  price: number;
  status: "active" | "sold";
  daysToSell?: number;
  datePosted: string;
  image: string;
}

// TODO: connect to Supabase
const mockItems: Item[] = [
  { id: "1", title: "Mid-Century Modern Sofa", price: 480, status: "active", datePosted: "Mar 10, 2026", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" },
  { id: "2", title: "Mechanical Keyboard", price: 120, status: "sold", daysToSell: 1, datePosted: "Mar 8, 2026", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop" },
  { id: "3", title: "Vintage Desk Lamp", price: 45, status: "active", datePosted: "Mar 9, 2026", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" },
  { id: "4", title: "Nike Air Max 90", price: 95, status: "sold", daysToSell: 2, datePosted: "Mar 5, 2026", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" },
  { id: "5", title: "Dining Table Set", price: 350, status: "active", datePosted: "Mar 7, 2026", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop" },
  { id: "6", title: "Record Player", price: 160, status: "sold", daysToSell: 3, datePosted: "Mar 3, 2026", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
];

const MyItems = () => {
  const [tab, setTab] = useState<"active" | "all">("active");
  const [items, setItems] = useState(mockItems);

  const filtered = tab === "active" ? items.filter((i) => i.status === "active") : items;

  const markSold = (id: string) => {
    // TODO: connect to Supabase
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "sold" as const, daysToSell: 2 } : item))
    );
  };

  const removeItem = (id: string) => {
    // TODO: connect to Supabase
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-8">My Items</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {(["active", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                tab === t
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "active" ? "Active" : "All"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md hover:scale-[1.02] transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="text-primary font-bold text-lg">${item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${
                      item.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {item.status === "active" ? "Active" : "Sold"}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.datePosted}</span>
                </div>
                {item.status === "active" && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => markSold(item.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Mark as Sold
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {item.status === "sold" && item.daysToSell && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Sold in {item.daysToSell} day{item.daysToSell > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No items yet. Time to start selling!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyItems;
