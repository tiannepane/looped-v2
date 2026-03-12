import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase"; // Make sure this path is correct in your new project
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  title: string;
  price: number;
  status: "active" | "sold";
  daysToSell?: number;
  datePosted: string;
  image: string;
}

const MyItems = () => {
  const [tab, setTab] = useState<"active" | "all">("active");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRealItems();
  }, []);

  const fetchRealItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null) // Keep archived items hidden as per your logic
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load your items", variant: "destructive" });
    } else {
      // Map Supabase columns to your UI Item interface
      const mappedItems: Item[] = data.map((dbItem) => ({
        id: dbItem.id,
        title: dbItem.title,
        price: dbItem.price,
        status: dbItem.status as "active" | "sold",
        daysToSell: dbItem.days_to_sell,
        datePosted: new Date(dbItem.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        // Handle your photos array (pick the first one for the thumbnail)
        image: Array.isArray(dbItem.photos) ? dbItem.photos[0] : dbItem.photos || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
      }));
      setItems(mappedItems);
    }
    setLoading(false);
  };

  const markSold = async (id: string) => {
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold", sold_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      toast({ title: "Congrats!", description: "Item marked as sold." });
      fetchRealItems(); // Refresh the list
    }
  };

  const removeItem = async (id: string) => {
    // We use your "Archive" logic instead of hard delete to keep the data safe
    const { error } = await supabase
      .from("listings")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      toast({ title: "Removed", description: "Item archived successfully." });
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filtered = tab === "active" ? items.filter((i) => i.status === "active") : items;

  if (loading) return <AppLayout><div className="py-20 text-center">Loading your collection...</div></AppLayout>;

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
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "active" ? "Active" : "All"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md hover:scale-[1.02] transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight">{item.title}</h3>
                <p className="text-primary font-bold text-lg">${item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${
                    item.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.datePosted}</span>
                </div>
                {item.status === "active" && (
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => markSold(item.id)} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                      Mark as Sold
                    </button>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground italic">No items found in this category.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyItems;