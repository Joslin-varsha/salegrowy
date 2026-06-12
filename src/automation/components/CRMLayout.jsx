
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export function CRMLayout({ children, title }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
  
        <div className="flex-1 flex flex-col min-w-0">
          {/* <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads..." className="pl-9 w-64 h-9 bg-muted/50" />
              </div>
              <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
              </button>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                SC
              </div>
            </div>
          </header> */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
