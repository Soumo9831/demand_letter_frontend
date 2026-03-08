import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getLatestInvoice } from "@/api/invoice";
import { createDemand } from "@/api/demand";

interface InvoiceData {
  _id: string;
  totalAmount: number;
  advance: number;
  customer?: {
    name?: string;
    phone?: string;
    PAN?: string;
  };
}

export default function AddDemand() {
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const [companyName, setCompanyName] = useState<
    "Unique Realcon" | "Airde Real Estate" | "Airde Developer" | "Sora Realtor"
  >("Unique Realcon");

  const [demandPercentage, setDemandPercentage] = useState<number>(0);
  const [flatNumber, setFlatNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [project, setProject] = useState("");
  const [block, setBlock] = useState("");
  const [tower, setTower] = useState("");
  const [projectAddress, setProjectAddress] = useState("");

  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const remaining = invoiceData
    ? invoiceData.totalAmount - invoiceData.advance
    : 0;

  /* ================= EXECUTIVE FROM TOKEN ================= */

  const getExecutive = () => {
    const name = localStorage.getItem("userName");

    try {
      return name ? name : "Admin";
    } catch {
      return "Admin";
    }
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setDemandPercentage(0);
    setFlatNumber("");
    setFloor("");
    setProject("");
    setBlock("");
    setTower("");
    setProjectAddress("");

    setAccountHolder("");
    setBankName("");
    setBankAddress("");
    setAccountNumber("");
    setIfscCode("");

    setShowDemandForm(false);
  };

  /* ================= FETCH INVOICE ================= */

  const handleSearch = async () => {
    setSearching(true);
    try {
      if (!invoiceId.trim()) {
        toast.error("Please enter an Invoice ID");
        return;
      }

      const data = await getLatestInvoice(invoiceId);

      if (!data.success) {
        toast.error("Invoice not found");
        return;
      }

      setInvoiceData(data.data);
      setShowInvoice(true);

      toast.success("Invoice loaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch invoice");
    } finally {
      setSearching(false);
    }
  };
  /* ================= CREATE DEMAND ================= */

  const handleCreateDemand = async () => {
    setCreating(true);
    try {
      if (
        !invoiceData ||
        demandPercentage <= 0 ||
        demandPercentage > 100 ||
        !flatNumber ||
        !floor ||
        !project ||
        !projectAddress ||
        !accountHolder ||
        !bankName ||
        !bankAddress ||
        !accountNumber ||
        !ifscCode
      ) {
        setErrorDialog(true);
        return;
      }

      const minimalInvoiceSnapshot = {
        _id: invoiceData._id,
        totalAmount: invoiceData.totalAmount,
        advance: invoiceData.advance,
        customer: {
          name: invoiceData.customer?.name,
          phone: invoiceData.customer?.phone,
          PAN: invoiceData.customer?.PAN,
        },
      };

      const data = await createDemand({
        invoiceData: minimalInvoiceSnapshot,
        demandPercentage,
        companyName,
        flatNumber,
        floor,
        project,
        block,
        tower,
        projectAddress,
        executive: getExecutive(),
        bankDetails: {
          accountHolder,
          bankName,
          bankAddress,
          accountNumber,
          ifscCode,
        },
      });

      if (!data.success) {
        toast.error(data.message || "Failed to create demand");
        return;
      }

      toast.success("Demand letter created successfully");

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while creating demand");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Generate Demand Letter
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search invoice and create professional demand letters.
        </p>
      </div>

      {/* SEARCH CARD */}

      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">Search Invoice</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 items-end">
          <div>
            <label className="text-sm font-medium">Invoice ID</label>
            <Input
              placeholder="Enter Invoice ID"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSearch} className="h-10" disabled={searching}>
            <Search className="mr-2 h-4 w-4" />
            {searching ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {/* INVOICE SUMMARY */}

      {showInvoice && invoiceData && (
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Invoice ID</span>
              <span className="px-3 py-1 text-sm font-semibold bg-muted rounded-md">
                {invoiceData._id}
              </span>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{invoiceData.customer?.name}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-semibold">
                  ₹{invoiceData.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Advance Paid</p>
                <p className="font-semibold">
                  ₹{invoiceData.advance.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Remaining Amount</p>
                <p className="font-semibold text-red-600">
                  ₹{remaining.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={() => setShowDemandForm(true)} disabled={creating}>
                {creating ? "Creating..." : "Create Demand"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DEMAND FORM */}

      {showDemandForm && (
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Create Demand Letter</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PROJECT DETAILS */}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company</label>
                <select
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value as any)}
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="Unique Realcon">Unique Realcon</option>
                  <option value="Airde Real Estate">Airde Real Estate</option>
                  <option value="Airde Developer">Airde Developer</option>
                  <option value="Sora Realtor">Sora Realtor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Demand Percentage (%)
                </label>
                <Input
                  type="number"
                  value={demandPercentage}
                  onChange={(e) => setDemandPercentage(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Flat Number *</label>
                <Input
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Floor *</label>
                <Input
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Project *</label>
                <Input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Block</label>
                <Input
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tower</label>
                <Input
                  value={tower}
                  onChange={(e) => setTower(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Project Address *</label>
              <Textarea
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
              />
            </div>

            <Separator />

            {/* BANK DETAILS */}

            <div>
              <h3 className="font-semibold text-lg mb-4">
                Bank Account Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Name of A/c Holder *
                  </label>
                  <Input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bank Name *</label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bank Branch *</label>
                  <Input
                    value={bankAddress}
                    onChange={(e) => setBankAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Account Number *
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">IFSC Code *</label>
                  <Input
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm} disabled={creating}>
                Cancel
              </Button>

              <Button onClick={handleCreateDemand} disabled={creating}>
                {creating ? "Creating..." : "Create Demand Letter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ERROR DIALOG */}

      <Dialog open={errorDialog} onOpenChange={setErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Invalid Input</DialogTitle>

            <DialogDescription>
              Ensure percentage is between 1-100 and all required fields
              including bank details are filled.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
