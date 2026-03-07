// src/components/Sidebar.tsx
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import {
  FilePlus,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { setPage } = useGlobal();
  const role = localStorage.getItem("role");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } hidden md:flex flex-col h-full bg-gray-900 text-white p-4 transition-all duration-300`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        {!collapsed && <h1 className="text-xl font-bold">Dashboard</h1>}

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-300 hover:text-white"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* MENU ITEMS */}
      <div className="space-y-3">
        {/* Add Demand */}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 gap-3"
          onClick={() => setPage("adddemand")}
        >
          <FilePlus size={20} />
          {!collapsed && "Add Demand"}
        </Button>

        {/* Manage Demands */}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 gap-3"
          onClick={() => setPage("invoices")}
        >
          <FileText size={20} />
          {!collapsed && "Manage Demands"}
        </Button>

        {/* Admin Only */}
        {role === "admin" && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 gap-3"
            onClick={() => setPage("manage")}
          >
            <Users size={20} />
            {!collapsed && "Manage Users"}
          </Button>
        )}
      </div>
    </div>
  );
}
