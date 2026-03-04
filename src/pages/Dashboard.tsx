// src/pages/Dashboard.tsx

import { useGlobal } from "@/context/GlobalContext";
import Analytics from "./Analytics";
import DemandLetters from "./DemandLetters"; // ✅ Corrected
import Manage from "./Manage";
import AddDemand from "./AddDemand";

export default function Dashboard() {
  const { page } = useGlobal();
  const role = localStorage.getItem("role");

  return (
    <div className="p-4">
      {page === "analytics" && role === "admin" && <Analytics />}
      {page === "invoices" && <DemandLetters />} {/* ✅ Updated component */}
      {page === "manage" && role === "admin" && <Manage />}
      {page === "adddemand" && <AddDemand />}
    </div>
  );
}