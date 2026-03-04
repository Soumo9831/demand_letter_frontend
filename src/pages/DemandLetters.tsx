import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Pencil,
  Search,
  X,
  Trash2,
  History,
} from "lucide-react";

interface Demand {
  _id: string;
  invoiceId: string;
  demandPercentage: number;
  demandAmount: number;
  executiveName: string;
  createdAt: string;

  parentDemandId?: string | null;
  chainRootId?: string | null;

  flatNumber?: string;
  floor?: string;
  project?: string;
  block?: string;
  tower?: string;
  projectAddress?: string;
  companyName?: string;

  invoiceSnapshot: {
    customer?: {
      name?: string;
    };
  };
}

export default function Demands() {
  const [search, setSearch] = useState("");
  const [demands, setDemands] = useState<Demand[]>([]);
  const [history, setHistory] = useState<Demand[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  const fetchDemands = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/v1/demands/latest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setDemands(data.data);
      }
    } catch (error) {
      console.error("Fetch Demands Error:", error);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchHistory = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `http://localhost:5000/api/v1/demands/history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Fetch History Error:", error);
    }
  };

  const handleSelectDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    fetchHistory(demand._id);
  };

  const handleDeleteDemand = async (demandId: string) => {
    try {
      const confirmDelete = confirm("Delete this Demand Letter?");

      if (!confirmDelete) return;

      await fetch(`http://localhost:5000/api/v1/demands/${demandId}`, {
        method: "DELETE",
      });

      alert("Demand deleted successfully");

      fetchDemands();

      if (selectedDemand?._id === demandId) {
        setSelectedDemand(null);
        setHistory([]);
      }
    } catch (error) {
      console.error("Delete Demand Error:", error);
      alert("Failed to delete demand");
    }
  };

  const handleCreateNextDemand = async (demand: Demand) => {
    try {
      const percentageInput = prompt("Enter new demand percentage");

      if (!percentageInput) return;

      const demandPercentage = Number(percentageInput);

      if (demandPercentage <= 0 || demandPercentage > 100) {
        alert("Percentage must be between 1 and 100");
        return;
      }

      const token = localStorage.getItem("authToken");

      const invoiceRes = await fetch(
        "http://localhost:5000/api/v1/invoices/latest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceId: demand.invoiceId,
          }),
        }
      );

      const invoiceData = await invoiceRes.json();

      if (!invoiceData.success) {
        alert("Failed to fetch latest invoice");
        return;
      }

      const latestInvoice = invoiceData.data;

      const latestInvoiceId =
        latestInvoice?._id ||
        latestInvoice?.invoiceId ||
        latestInvoice?.id ||
        null;

      if (latestInvoiceId === demand.invoiceId) {
        alert("Create a new Invoice first");
        return;
      }

      let parentDemandId = demand._id;

      if (demand.parentDemandId === null) {
        parentDemandId = demand._id;
      }

      const chainRootId = demand.chainRootId || demand._id;

      const createRes = await fetch(
        "http://localhost:5000/api/v1/demands",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceData: latestInvoice,
            demandPercentage,
            companyName: demand.companyName,
            flatNumber: demand.flatNumber,
            floor: demand.floor,
            project: demand.project,
            block: demand.block,
            tower: demand.tower,
            projectAddress: demand.projectAddress,
            parentDemandId,
            chainRootId,
          }),
        }
      );

      const result = await createRes.json();

      if (!result.success) {
        alert("Failed to create demand");
        return;
      }

      alert("New Demand Created Successfully");

      fetchDemands();
    } catch (error) {
      console.error("Create Next Demand Error:", error);
      alert("Something went wrong");
    }
  };

  const filteredDemands = demands.filter(
    (d) =>
      d._id.toLowerCase().includes(search.toLowerCase()) ||
      (d.invoiceSnapshot?.customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2 space-y-6">

        <div className="sticky top-0 bg-gray-100 pt-2 pb-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search demand / customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demand ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredDemands.map((d) => {
                const dateObj = new Date(d.createdAt);

                return (
                  <TableRow
                    key={d._id}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <TableCell className="font-medium">
                      {d._id}
                    </TableCell>

                    <TableCell>
                      {d.invoiceSnapshot?.customer?.name}
                    </TableCell>

                    <TableCell>{d.demandPercentage}%</TableCell>

                    <TableCell className="font-semibold">
                      ₹{d.demandAmount?.toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {dateObj.toLocaleDateString("en-IN")}
                    </TableCell>

                    <TableCell className="flex justify-end">

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                          <DropdownMenuItem
                            onClick={() => handleSelectDemand(d)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            History
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleCreateNextDemand(d)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            New DL
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteDemand(d._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>

                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedDemand && (
        <Card className="h-fit sticky top-6">
          <CardContent className="p-6 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                Demand History
              </h2>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedDemand(null);
                  setHistory([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Current Demand: <strong>{selectedDemand._id}</strong>
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No previous demands
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => {
                  const dateObj = new Date(h.createdAt);

                  return (
                    <div
                      key={h._id}
                      className="border rounded-lg p-3 text-sm"
                    >
                      <div className="font-medium">{h._id}</div>
                      <div>{h.demandPercentage}%</div>
                      <div>
                        ₹{h.demandAmount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateObj.toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}