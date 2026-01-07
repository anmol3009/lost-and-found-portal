import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Item = {
  id: number;
  itemName: string;
  locationFound: string;
  description: string;
  photoPath?: string;
  dateFound?: string;
  uploaderName?: string;
  contact?: string;
};

function ClaimItemDialog({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  setSubmitting(true);

  try {
    // 👇 Send data to backend
    const res = await fetch("http://localhost:5000/api/claims", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    console.log("Claim response:", result);

    if (result.success) {
      toast.success("Claim submitted successfully!", {
        description: `Your claim for "${item.itemName}" has been recorded.`,
      });
      form.reset();
      setOpen(false);
    } else {
      toast.error("Failed to submit claim", {
        description: result.error || "Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error submitting claim:", error);
    toast.error("Error while submitting claim. Check console for details.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Claim Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim "{item.itemName}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Your full name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Info</Label>
            <Input id="contact" name="contact" required placeholder="Phone or email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proof">Proof of Ownership</Label>
            <Textarea id="proof" name="proof" required placeholder="Describe unique identifiers" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Claim"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ItemsGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/found/approved") // ✅ fixed endpoint
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("❌ Error fetching items:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="gallery" className="scroll-mt-28">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Lost & Found Items</h2>
      </div>

      {loading ? (
        <p>Loading items...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No approved items yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border shadow-md transition hover:shadow-lg">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={`http://localhost:5000${item.photoPath}` || "/placeholder.jpg"}
                  alt={item.itemName}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="grid gap-3 p-4">
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{item.itemName}</h3>
                  <p className="text-sm text-muted-foreground">{item.locationFound}</p>
                </div>
                <p className="text-sm max-h-12 overflow-hidden text-ellipsis">{item.description}</p>
                <ClaimItemDialog item={item} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default ItemsGallery;
