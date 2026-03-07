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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  History,
} from "lucide-react";

interface Demand {
  _id: string;
  invoiceId: string;
  demandPercentage: number;
  demandAmount: number;
  executive: string;
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
  //const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  const [newDemandModal, setNewDemandModal] = useState(false);
  const [percentageInput, setPercentageInput] = useState("");
  const [selectedForNewDL, setSelectedForNewDL] = useState<Demand | null>(null);

  const [alertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [historyModal, setHistoryModal] = useState(false);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setAlertModal(true);
  };

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
        setHistoryModal(true);
      }
    } catch (error) {
      console.error("Fetch History Error:", error);
    }
  };

  const handleDeleteDemand = async (demandId: string) => {
    try {
      const confirmDelete = confirm("Delete this Demand Letter?");
      if (!confirmDelete) return;

      await fetch(`http://localhost:5000/api/v1/demands/${demandId}`, {
        method: "DELETE",
      });

      showAlert("Demand deleted successfully");

      fetchDemands();
    } catch (error) {
      console.error("Delete Demand Error:", error);
      showAlert("Failed to delete demand");
    }
  };

  const openNewDLModal = (demand: Demand) => {
    setSelectedForNewDL(demand);
    setPercentageInput("");
    setNewDemandModal(true);
  };

  const handleCreateNextDemand = async () => {
    try {
      if (!selectedForNewDL) return;

      const demandPercentage = Number(percentageInput);

      if (demandPercentage <= 0 || demandPercentage > 100) {
        showAlert("Percentage must be between 1 and 100");
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
            invoiceId: selectedForNewDL.invoiceId,
          }),
        }
      );

      const invoiceData = await invoiceRes.json();

      if (!invoiceData.success) {
        showAlert("Failed to fetch latest invoice");
        return;
      }

      const latestInvoice = invoiceData.data;

      const latestInvoiceId =
        latestInvoice?._id ||
        latestInvoice?.invoiceId ||
        latestInvoice?.id ||
        null;

      if (latestInvoiceId === selectedForNewDL.invoiceId) {
        showAlert("Create a new Invoice first");
        return;
      }

      let parentDemandId = selectedForNewDL._id;

      if (selectedForNewDL.parentDemandId === null) {
        parentDemandId = selectedForNewDL._id;
      }

      const chainRootId =
        selectedForNewDL.chainRootId || selectedForNewDL._id;

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
            companyName: selectedForNewDL.companyName,
            flatNumber: selectedForNewDL.flatNumber,
            floor: selectedForNewDL.floor,
            project: selectedForNewDL.project,
            block: selectedForNewDL.block,
            tower: selectedForNewDL.tower,
            projectAddress: selectedForNewDL.projectAddress,
            parentDemandId,
            chainRootId,
          }),
        }
      );

      const result = await createRes.json();

      if (!result.success) {
        showAlert("Failed to create demand");
        return;
      }

      setNewDemandModal(false);
      showAlert("New Demand Created Successfully");

      fetchDemands();
    } catch (error) {
      console.error("Create Next Demand Error:", error);
      showAlert("Something went wrong");
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
    <div className="w-full px-6 space-y-6">

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

      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6">
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Demand ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Executive</TableHead>
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
                  <TableRow key={d._id}>

                    <TableCell className="font-medium">
                      {d._id}
                    </TableCell>

                    <TableCell>
                      {d.invoiceSnapshot?.customer?.name}
                    </TableCell>

                    <TableCell>
                      {d.executive || "Admin"}
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
                            onClick={() => fetchHistory(d._id)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            History
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => openNewDLModal(d)}
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
        </CardContent>
      </Card>

      {/* NEW DL MODAL */}

      <Dialog open={newDemandModal} onOpenChange={setNewDemandModal}>
        <DialogContent className="max-w-md">

          <DialogHeader>
            <DialogTitle>Create New Demand Letter</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

            <Input
              placeholder="Enter Demand Percentage"
              value={percentageInput}
              onChange={(e) => setPercentageInput(e.target.value)}
            />

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setNewDemandModal(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleCreateNextDemand}>
              Create DL
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* ALERT MODAL */}

      <Dialog open={alertModal} onOpenChange={setAlertModal}>
        <DialogContent className="max-w-sm">

          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>

          <div className="py-4 text-sm text-muted-foreground">
            {alertMessage}
          </div>

          <DialogFooter>
            <Button onClick={() => setAlertModal(false)}>
              OK
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* HISTORY MODAL */}

      <Dialog open={historyModal} onOpenChange={setHistoryModal}>
        <DialogContent className="max-w-lg">

          <DialogHeader>
            <DialogTitle>Demand History</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">

            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No previous demands
              </p>
            ) : (
              history.map((h) => {
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
              })
            )}

          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}