import { Button } from "@/components/ui/button";

interface CompletionStepProps {
  itemCount: number;
  onListAnother: () => void;
}

const CompletionStep = ({ itemCount, onListAnother }: CompletionStepProps) => {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">You're live!</h2>
      <p className="text-muted-foreground mb-8">
        {itemCount} item{itemCount !== 1 ? "s" : ""} posted and making money while you sleep.
      </p>
      <div className="flex gap-4 justify-center">
        <Button variant="outline" className="rounded-full" onClick={onListAnother}>
          List More Items
        </Button>
        <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold" style={{ fontFamily: "'Gaegu', cursive" }}>
          <a href="/items">View My Items</a>
        </Button>
      </div>
    </div>
  );
};

export default CompletionStep;
