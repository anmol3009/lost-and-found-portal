import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="group inline-flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md border shadow-sm">
  <img 
    src="/logo.png" 
    alt="Logo" 
    className="h-9 w-9 object-contain" 
  />
</div>



          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide">DJ Sanghvi</span>
            <span className="text-xs text-muted-foreground">Lost & Found Portal</span>
          </div>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="/#found" className="text-sm text-muted-foreground hover:text-foreground">Found</a>
          <a href="/#lost" className="text-sm text-muted-foreground hover:text-foreground">Lost</a>
          <a href="/#gallery" className="text-sm text-muted-foreground hover:text-foreground">Items</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden md:inline-flex">
            <a href="/#found">Report Item</a>
          </Button>
          <Button asChild variant="outline" className="md:hidden">
            <a href="/#found">Report</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
