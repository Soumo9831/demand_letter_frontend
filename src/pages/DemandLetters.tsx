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
  DialogDescription,
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
  const [deletingDemandId, setDeletingDemandId] = useState<string | null>(null);
  const [creatingNewDemand, setCreatingNewDemand] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [demandToDelete, setDemandToDelete] = useState<string | null>(null);
  const formatTime = (iso: string) => iso.split("T")[1].slice(0, 5);

  const openDemandLetter = (demand: Demand) => {
    navigate(`/demand-letter/${demand._id}`, {
      state: { demand },
    });
  };
  const role = localStorage.getItem("role");

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

  const openDeleteModal = (demandId: string) => {
    setDemandToDelete(demandId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!demandToDelete) return;
    setDeletingDemandId(demandToDelete);
    try {
      await deleteDemand(demandToDelete);

      toast.success("Demand deleted successfully");
      fetchDemands();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete Demand Error:", error);
      toast.error("Failed to delete demand");
    } finally {
      setDeletingDemandId(null);
    }
  };

  const handleDeleteDemand = (demandId: string) => {
    openDeleteModal(demandId);
  };

  const openNewDLModal = (demand: Demand) => {
    setSelectedForNewDL(demand);
    setPercentageInput("");
    setNewDemandModal(true);
  };
  const formatDate = (iso: string) => {
    const [year, month, day] = iso.split("T")[0].split("-");
    return `${parseInt(day)}-${month}-${year}`;
  };

  const handleCreateNextDemand = async () => {
    setCreatingNewDemand(true);
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
    } finally {
      setCreatingNewDemand(false);
    }
  };

  const filteredDemands = demands.filter(
    (d) =>
      d._id.toLowerCase().includes(search.toLowerCase()) ||
      (d.invoiceSnapshot?.customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Executive</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            {filteredDemands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                    <FileText className="h-10 w-10 opacity-40" />
                    <p className="text-lg font-medium">
                      No Demand Letters Found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or create a new demand.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableBody>
                {filteredDemands.map((d) => {
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

                      <TableCell>{formatDate(d.createdAt)}</TableCell>
                      <TableCell>{formatTime(d.createdAt)}</TableCell>

                      <TableCell className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDemandLetter(d)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
                              disabled={creatingNewDemand}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {creatingNewDemand ? "Creating..." : "New DL"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openDemandLetter(d)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>

                            {role === "admin" && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteDemand(d._id)}
                                disabled={
                                  deletingDemandId === d._id || showDeleteModal
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
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
            <Button variant="outline" onClick={() => setNewDemandModal(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleCreateNextDemand}
              disabled={creatingNewDemand}
            >
              {creatingNewDemand ? "Creating..." : "Create DL"}
            </Button>
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

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Demand Letter
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this demand letter? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingDemandId === demandToDelete}
            >
              {deletingDemandId === demandToDelete ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
