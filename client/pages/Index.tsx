import { FoundForm } from "@/components/sections/FoundForm";
import { LostForm } from "@/components/sections/LostForm";
import { ItemsGallery } from "@/components/sections/ItemsGallery";

export default function Index() {
  return (
    <main id="top" className="relative min-h-screen">
      {/* Subtle, professional layered background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.primary/25),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.accent/25),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,theme(colors.background),transparent)] [mask-image:radial-gradient(1200px_600px_at_center,black,transparent)]" />
      </div>

      <section className="relative border-b/0">
        <div className="container mx-auto grid gap-6 px-4 py-10 md:py-14">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">DJ Sanghvi Lost & Found Portal</h1>
            <p className="mt-3 text-muted-foreground">
              Report found or lost items and browse recently submitted belongings. Help the DJS community reconnect with their things.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <a href="#found" className="group rounded-xl border bg-white/60 p-6 shadow-sm backdrop-blur transition hover:border-primary/50 hover:shadow-md dark:bg-background/60">
              <div className="text-sm font-medium text-primary">Report</div>
              <div className="mt-2 text-xl font-semibold">Found an item?</div>
              <p className="mt-2 text-sm text-muted-foreground">Submit details so we can reach the owner quickly.</p>
            </a>
            <a href="#lost" className="group rounded-xl border bg-white/60 p-6 shadow-sm backdrop-blur transition hover:border-primary/50 hover:shadow-md dark:bg-background/60">
              <div className="text-sm font-medium text-primary">Report</div>
              <div className="mt-2 text-xl font-semibold">Lost something?</div>
              <p className="mt-2 text-sm text-muted-foreground">Share what you lost to alert others on campus.</p>
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-12 px-4 py-12 md:gap-16 md:py-16">
        <FoundForm />
        <LostForm />
        <ItemsGallery />
      </div>
    </main>
  );
}
