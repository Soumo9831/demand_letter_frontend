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
import { Search, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { generateDemandLetter } from "@/utils/generateDemandLetter";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState<
    "Unique Realcon" | "Airde Real Estate" | "Airde Developers" | "Sora"
  >("Unique Realcon");

  const [demandPercentage, setDemandPercentage] = useState<number>(0);
  const [flatNumber, setFlatNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [project, setProject] = useState("");
  const [block, setBlock] = useState("");
  const [tower, setTower] = useState("");
  const [projectAddress, setProjectAddress] = useState("");

  const remaining =
    invoiceData ? invoiceData.totalAmount - invoiceData.advance : 0;

  /* ================= FETCH INVOICE ================= */

  const handleSearch = async () => {
    if (!invoiceId.trim()) return;

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/v1/invoices/latest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invoiceId }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Invoice not found");
        return;
      }

      setInvoiceData(data.data);
      setShowInvoice(true);
    } catch (error) {
      console.error("Fetch Invoice Error:", error);
      alert("Failed to fetch invoice");
    }
  };

  /* ================= CREATE DEMAND ================= */

  /* ================= CREATE DEMAND ================= */

  /* ================= CREATE DEMAND ================= */

const token = localStorage.getItem("authToken");

let executive = "Admin"; // default if admin login

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.name) {
      executive = payload.name;
    }
  } catch (err) {
    console.error("JWT decode error:", err);
  }
}

const handleCreateDemand = async () => {
  if (
    !invoiceData ||
    demandPercentage > 100 ||
    demandPercentage < 0 ||
    !flatNumber ||
    !floor ||
    !project ||
    !projectAddress
  ) {
    setErrorDialog(true);
    return;
  }

  const demandAmount = Math.round(
    (remaining * demandPercentage) / 100
  );

  try {
    const token = localStorage.getItem("authToken");

    await fetch("http://localhost:5000/api/v1/demands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invoiceData,   // ✅ FIXED — send full invoice object
        demandPercentage,
        companyName,
        flatNumber,
        floor,
        project,
        block,
        tower,
        projectAddress,
        executive,    // Include executive name from token
      }),
    });

  } catch (error) {
    console.error("Create Demand Error:", error);
    alert("Failed to create demand");
    return;
  }

  // ⬇️ ORIGINAL LOGIC — UNCHANGED
  const letter = generateDemandLetter({
    companyName,
    customerName: invoiceData.customer?.name || "Customer",
    demandAmount,
    flatNumber,
    floor,
    project,
    block,
    tower,
    projectAddress,
  });

  setGeneratedLetter(letter.trim());
  setOpenDialog(false);
};

  /* ================= PDF DOWNLOAD ================= */

  const handleDownloadPDF = () => {
    if (!generatedLetter || !invoiceData) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const marginLeft = 20;
    const marginTop = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - 40;

    doc.setFont("Times", "Normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(generatedLetter, pageWidth);

    doc.text(lines, marginLeft, marginTop);

    doc.save(
      `Demand_Letter_${invoiceData.customer?.name || "Customer"}.pdf`
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">

      {/* ================= PAGE HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Generate Demand Letter
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search invoice and create professional demand letters.
        </p>
      </div>

      {/* ================= SEARCH SECTION ================= */}
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

          <Button onClick={handleSearch} className="h-10">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      {/* ================= INVOICE DETAILS ================= */}
      {showInvoice && invoiceData && (
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Invoice ID Badge */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Invoice ID
              </span>
              <span className="px-3 py-1 text-sm font-semibold bg-muted rounded-md">
                {invoiceData._id}
              </span>
            </div>

            <Separator />

            {/* Financial Grid */}
            <div className="grid sm:grid-cols-2 gap-6 text-sm">

              <div className="space-y-1">
                <p className="text-muted-foreground">Customer Name</p>
                <p className="font-semibold">
                  {invoiceData.customer?.name}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-semibold">
                  ₹{invoiceData.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Advance Paid</p>
                <p className="font-semibold">
                  ₹{invoiceData.advance.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Remaining Amount</p>
                <p className="font-semibold text-red-600">
                  ₹{remaining.toLocaleString("en-IN")}
                </p>
              </div>

            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={() => setOpenDialog(true)}>
                Create Demand
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

      {/* ================= DEMAND DIALOG ================= */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Demand</DialogTitle>
            <DialogDescription>
              Fill details to generate demand letter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">

            <div>
              <label className="text-sm font-medium">Company</label>
              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value as any)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="Unique Realcon">Unique Realcon</option>
                <option value="Airde Real Estate">Airde Real Estate</option>
                <option value="Airde Developers">Airde Developers</option>
                <option value="Sora">Sora</option>
              </select>
            </div>

            <Input
              type="number"
              placeholder="Demand Percentage (%)"
              value={demandPercentage}
              onChange={(e) => setDemandPercentage(Number(e.target.value))}
            />

            <Input placeholder="Flat Number *" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} />
            <Input placeholder="Floor *" value={floor} onChange={(e) => setFloor(e.target.value)} />
            <Input placeholder="Project *" value={project} onChange={(e) => setProject(e.target.value)} />
            <Input placeholder="Block (Optional)" value={block} onChange={(e) => setBlock(e.target.value)} />
            <Input placeholder="Tower (Optional)" value={tower} onChange={(e) => setTower(e.target.value)} />
            <Textarea placeholder="Project Address *" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDemand}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= GENERATED LETTER ================= */}
      {generatedLetter && (
        <Card className="shadow-sm border">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Generated Demand Letter</CardTitle>
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardHeader>

          <CardContent>
            <div
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                padding: "60px",
                lineHeight: "1.8",
                fontFamily: "Times New Roman, serif",
                whiteSpace: "pre-line",
                minHeight: "800px",
              }}
            >
              {generatedLetter}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= ERROR DIALOG ================= */}
      <Dialog open={errorDialog} onOpenChange={setErrorDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Invalid Input
            </DialogTitle>
            <DialogDescription>
              Ensure percentage is 0–100 and required fields are filled.
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