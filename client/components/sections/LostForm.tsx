import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LostForm() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    try {
      // ✅ Send request to backend
      const response = await fetch("http://localhost:5000/api/lost", {
        method: "POST",
        body: data, // FormData auto-handles file + text
      });

      if (!response.ok) {
        throw new Error("Failed to submit lost item");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Lost item reported", {
          description: `${data.get("itemName")} lost near ${data.get("locationLost")}`,
        });
        form.reset();
      } else {
        toast.error("Error saving report");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network or server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="lost" className="scroll-mt-28">
      <div className="rounded-xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-[1px]">
        <Card className="border-primary/10 bg-white/70 shadow-lg backdrop-blur dark:bg-background/60">
          <CardHeader>
            <CardTitle className="text-2xl">Report a Lost Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" name="itemName" required placeholder="e.g., Physics Notebook" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationLost">Location Lost</Label>
                <Input id="locationLost" name="locationLost" required placeholder="e.g., Canteen, D-Block" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateLost">Date Lost</Label>
                <Input id="dateLost" name="dateLost" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner’s Name</Label>
                <Input id="ownerName" name="ownerName" required placeholder="Your full name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required placeholder="Brief description and any unique identifiers" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input id="contact" name="contact" required placeholder="Phone or email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo (optional)</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" />
              </div>
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default LostForm;
