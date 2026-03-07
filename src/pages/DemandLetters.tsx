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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  Download,
  FileText,
} from "lucide-react";
import type { Demand } from "@/types/DemandType";
import {
  getLatestDemands,
  getDemandHistory,
  deleteDemand,
  createDemand,
} from "@/api/demand";

import { getLatestInvoice } from "@/api/invoice";

export default function Demands() {
  const [search, setSearch] = useState("");
  const [demands, setDemands] = useState<Demand[]>([]);
  const [history, setHistory] = useState<Demand[]>([]);
  //const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const navigate = useNavigate();

  const [newDemandModal, setNewDemandModal] = useState(false);
  const [percentageInput, setPercentageInput] = useState("");
  const [selectedForNewDL, setSelectedForNewDL] = useState<Demand | null>(null);

  const [historyModal, setHistoryModal] = useState(false);

  const openDemandLetter = (demand: Demand) => {
    navigate(`/demand-letter/${demand._id}`, {
      state: { demand },
    });
  };
  const role = localStorage.getItem("role");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const getExecutiveFromToken = () => {
    try {
      const name = localStorage.getItem("userName");

      return name || "Admin";
    } catch (error) {
      console.error("Token decode error:", error);
      return "Admin";
    }
  };
  const fetchDemands = async () => {
    try {
      const executive = getExecutiveFromToken();

      const data = await getLatestDemands(executive);

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
      const data = await getDemandHistory(id);

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

      await deleteDemand(demandId);

      toast.success("Demand deleted successfully");
      fetchDemands();
    } catch (error) {
      console.error("Delete Demand Error:", error);
      toast.error("Failed to delete demand");
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
        toast.error("Percentage must be between 1 and 100");
        return;
      }

      if (demandPercentage <= selectedForNewDL.demandPercentage) {
        toast.error(
          `New demand percentage must be greater than the previous (${selectedForNewDL.demandPercentage}%)`,
        );
        return;
      }

      const invoiceData = await getLatestInvoice(selectedForNewDL.invoiceId);

      if (!invoiceData.success) {
        toast.error("Failed to fetch latest invoice");
        return;
      }

      const latestInvoice = invoiceData.data;

      const latestInvoiceId = latestInvoice?._id || null;

      if (latestInvoiceId === selectedForNewDL.invoiceId) {
        toast.error("Create a new Invoice first");
        return;
      }

      let parentDemandId = selectedForNewDL._id;

      if (selectedForNewDL.parentDemandId === null) {
        parentDemandId = selectedForNewDL._id;
      }

      const chainRootId = selectedForNewDL.chainRootId || selectedForNewDL._id;

      const minimalInvoiceSnapshot = {
        _id: latestInvoice._id,
        totalAmount: latestInvoice.totalAmount,
        advance: latestInvoice.advance,
        customer: {
          name: latestInvoice.customer?.name,
          phone: latestInvoice.customer?.phone,
          PAN: latestInvoice.customer?.PAN,
        },
      };

      const result = await createDemand({
        invoiceData: minimalInvoiceSnapshot,
        demandPercentage,
        companyName: selectedForNewDL.companyName,
        flatNumber: selectedForNewDL.flatNumber,
        floor: selectedForNewDL.floor,
        project: selectedForNewDL.project,
        block: selectedForNewDL.block,
        tower: selectedForNewDL.tower,
        projectAddress: selectedForNewDL.projectAddress,
        executive: selectedForNewDL.executive,
        bankDetails: selectedForNewDL.bankDetails,
        parentDemandId,
        chainRootId,
      });

      if (!result.success) {
        toast.error("Failed to create demand");
        return;
      }

      setNewDemandModal(false);
      toast.success("New Demand Created Successfully");

      fetchDemands();
    } catch (error) {
      console.error("Create Next Demand Error:", error);
      toast.error("Something went wrong");
    }
  };

  const filteredDemands = demands.filter(
    (d) =>
      d._id.toLowerCase().includes(search.toLowerCase()) ||
      (d.invoiceSnapshot?.customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const DemandCard = ({ d }: { d: Demand }) => {
    const dateObj = new Date(d.createdAt);

    return (
      <Card className="p-4 rounded-xl border">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Demand ID</p>
            <p className="font-semibold text-sm">{d._id}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fetchHistory(d._id)}>
                <History className="mr-2 h-4 w-4" />
                History
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openNewDLModal(d)}>
                <Pencil className="mr-2 h-4 w-4" />
                New DL
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openDemandLetter(d)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>

              {role === "admin" && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteDemand(d._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{d.invoiceSnapshot?.customer?.name}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Invoice</p>
            <p className="font-medium">{d.invoiceSnapshot?._id}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Percentage</p>
            <p className="font-medium">{d.demandPercentage}%</p>
          </div>

          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-semibold text-green-600">
              ₹
              {(
                d.demandAmount - d.invoiceSnapshot?.advance || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-muted-foreground">Date</p>
            <p>{dateObj.toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => openDemandLetter(d)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Demand Letter
          </Button>
        </div>
      </Card>
    );
  };

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
        <CardContent className="p-4 md:p-6">
          {filteredDemands.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 gap-2 py-20">
              <FileText className="h-10 w-10 opacity-40" />
              <p className="text-lg font-medium">No Demand Letters Found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or create a new demand.
              </p>
            </div>
          ) : isMobile ? (
            /* MOBILE VIEW */

            <div className="space-y-4">
              {filteredDemands.map((d) => (
                <DemandCard key={d._id} d={d} />
              ))}
            </div>
          ) : (
            /* DESKTOP TABLE */

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demand ID</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Executive</TableHead>
                  <TableHead>Percentage</TableHead>
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
                      <TableCell className="font-medium">{d._id}</TableCell>
                      <TableCell>{d.invoiceSnapshot?._id}</TableCell>
                      <TableCell>{d.invoiceSnapshot?.customer?.name}</TableCell>
                      <TableCell>{d.executive || "Admin"}</TableCell>
                      <TableCell>{d.demandPercentage}%</TableCell>
                      <TableCell className="font-semibold">
                        ₹
                        {(
                          d.demandAmount - d.invoiceSnapshot?.advance || 0
                        ).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {dateObj.toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDemandLetter(d)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
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
            <Button variant="outline" onClick={() => setNewDemandModal(false)}>
              Cancel
            </Button>

            <Button onClick={handleCreateNextDemand}>Create DL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HISTORY MODAL */}

      <Dialog open={historyModal} onOpenChange={setHistoryModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Demand History</DialogTitle>
          </DialogHeader>

          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No previous demands found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demand ID</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {history.map((h) => {
                  const dateObj = new Date(h.createdAt);

                  return (
                    <TableRow key={h._id}>
                      <TableCell className="font-medium">{h._id}</TableCell>

                      <TableCell>{h.demandPercentage}%</TableCell>

                      <TableCell>
                        ₹{h.demandAmount.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        {dateObj.toLocaleDateString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDemandLetter(h)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
