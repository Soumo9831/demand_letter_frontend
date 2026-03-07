// src/components/MobileSidebar.tsx
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, FilePlus, FileText, Users } from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";

export default function MobileSidebar() {
  const { setPage } = useGlobal();
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  const handleSelect = (page: string) => {
    setPage(page);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Mobile Menu Button */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      {/* Drawer */}
      <SheetContent side="left" className="p-4">
        <h1 className="text-xl font-semibold mb-6">Menu</h1>

        <div className="space-y-3">
          {/* Add Demand */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => handleSelect("adddemand")}
          >
            <FilePlus size={18} />
            Add Demand
          </Button>

          {/* Manage Demands */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => handleSelect("invoices")}
          >
            <FileText size={18} />
            Manage Demands
          </Button>

          {/* Admin Only */}
          {role === "admin" && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => handleSelect("manage")}
            >
              <Users size={18} />
              Manage Users
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
