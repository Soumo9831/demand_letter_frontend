import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

import { generateDemandLetter } from "@/utils/generateDemandLetter";

export default function AddDemand() {
  const [invoiceId, setInvoiceId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  const [demandPercentage, setDemandPercentage] = useState<number>(0);
  const [flatNumber, setFlatNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [project, setProject] = useState("");
  const [block, setBlock] = useState("");
  const [tower, setTower] = useState("");
  const [projectAddress, setProjectAddress] = useState("");

  /* Dummy Invoice Data */
  const dummyInvoice = {
    name: "Rahul Sharma",
    phone: "9876543210",
    pan: "ABCDE1234F",
    totalAmount: 120000,
    paid: 50000,
  };

  const remaining = dummyInvoice.totalAmount - dummyInvoice.paid;

  const handleSearch = () => {
    if (invoiceId.trim()) {
      setShowInvoice(true);
    }
  };

  const handleCreateDemand = () => {
    // Validation
    if (
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

    const letter = generateDemandLetter({
      customerName: dummyInvoice.name,
      demandAmount,
      flatNumber,
      floor,
      project,
      block,
      tower,
      projectAddress,
    });

    setGeneratedLetter(letter.trim()); // ✅ trimmed
    setOpenDialog(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      
      {/* ================= SEARCH SECTION ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Search Invoice</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Invoice ID</Label>
              <Input
                placeholder="Enter Invoice ID"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= INVOICE RESULT ================= */}
      {showInvoice && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{dummyInvoice.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-semibold">{dummyInvoice.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">PAN</p>
                <p className="font-semibold">{dummyInvoice.pan}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Amount</span>
                <span className="font-semibold">
                  ₹{dummyInvoice.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Paid</span>
                <span className="font-semibold text-green-600">
                  ₹{dummyInvoice.paid.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Remaining</span>
                <span className="font-semibold text-red-600">
                  ₹{remaining.toLocaleString("en-IN")}
                </span>
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

      {/* ================= DEMAND INPUT DIALOG ================= */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Demand</DialogTitle>
            <DialogDescription>
              Fill in required details to generate the demand letter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Demand Percentage (%)</Label>
              <Input
                type="number"
                value={demandPercentage}
                onChange={(e) =>
                  setDemandPercentage(Number(e.target.value))
                }
              />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                placeholder="Flat Number *"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
              />
              <Input
                placeholder="Floor *"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
              <Input
                placeholder="Project *"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Block (Optional)"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
              <Input
                placeholder="Tower (Optional)"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
              />
            </div>

            <Textarea
              placeholder="Project Address *"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
            />
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
        <Card>
          <CardHeader>
            <CardTitle>Generated Demand Letter</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="bg-white text-black p-12 leading-7 whitespace-pre-line rounded-lg border shadow-sm min-h-[600px]">
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
              Ensure percentage is 0–100 and all required fields are filled.
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