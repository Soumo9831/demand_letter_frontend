export interface Demand {
  _id: string;
  invoiceId: string;

  parentDemandId: string | null;
  chainRootId: string;

  invoiceSnapshot: InvoiceSnapshot;

  demandPercentage: number;
  demandAmount: number;

  flatNumber?: string;
  floor?: string;
  project?: string;
  block?: string | null;
  tower?: string | null;
  projectAddress?: string;

  companyName?: string;
  executive: string;

  status: "pending" | "paid" | "cancelled";
  bankDetails?: BankDetails;
  amount: number;

  createdAt: string;
}
export interface InvoiceSnapshot {
  _id: string;
  totalAmount: number;
  advance: number;

  customer?: Customer;
}
export interface Customer {
  name?: string;
  phone?: string;
  PAN?: string;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  ifscCode: string;
}
