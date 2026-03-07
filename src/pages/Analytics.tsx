import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, History, IndianRupee } from "lucide-react";
import type { Demand } from "@/types/DemandType";

export default function Analytics() {
  const [totalDemands, setTotalDemands] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [latestDemands, setLatestDemands] = useState(0);
  const [historyDemands, setHistoryDemands] = useState(0);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("http://localhost:5000/api/v1/demands", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) return;

      const demands: Demand[] = data.data || [];

      // TOTAL DEMANDS
      const totalDL = demands.length;

      // TOTAL AMOUNT
      let totalAmt = 0;

      demands.forEach((d) => {
        totalAmt += d.amount || 0;
      });

      // FIND PARENT IDS
      const parentIds = new Set(
        demands
          .map((d) => d.parentDemandId)
          .filter((id) => id !== null && id !== undefined),
      );

      // LATEST DLs
      const latest = demands.filter((d) => !parentIds.has(d._id));

      // HISTORY DLs
      const history = demands.filter((d) => parentIds.has(d._id));

      setTotalDemands(totalDL);
      setTotalAmount(totalAmt);
      setLatestDemands(latest.length);
      setHistoryDemands(history.length);
    } catch (error) {
      console.error("Analytics Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="w-full px-6 space-y-6">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Demand Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of demand letters statistics.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL DL */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Demand Letters
              </p>
              <h2 className="text-3xl font-bold mt-2">{totalDemands}</h2>
            </div>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* TOTAL AMOUNT */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Amount Demanded
              </p>
              <h2 className="text-3xl font-bold mt-2">
                ₹{totalAmount.toLocaleString("en-IN")}
              </h2>
            </div>
            <IndianRupee className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* LATEST DL */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Latest Demand Letters
              </p>
              <h2 className="text-3xl font-bold mt-2">{latestDemands}</h2>
            </div>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* HISTORY DL */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                History Demand Letters
              </p>
              <h2 className="text-3xl font-bold mt-2">{historyDemands}</h2>
            </div>
            <History className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
