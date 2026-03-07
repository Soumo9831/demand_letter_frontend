// src/types/invoiceType.ts

export interface IGST {
  amount: number;
  percentage: number;
}

export interface IInvoiceItem {
  description: string;
  areaSqFt: number;
  hashingCode: string;
  projectName: string;
  rate: number;
}

export interface ICharges {
  parking: number;
  amenities: number;
  otherCharges: number;
}

export interface ICompany {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface IPayment {
  mode: string;
  chequeNumber: string | null;
  bankName: string | null;
}

export interface ICustomer {
  name: string;
  GSTIN: string;
  address: string;
  PAN: string;
  phone: string;
}

export interface IInvoice {
  _id: string;
  version: number;
  totalAmount: number;
  subTotal: number;
  itemsTotal: number;
  advance: number;
  remainingAmount: number;
  createdAt: string;
  isOriginal: boolean;
  previousInvoiceId: string | null;
  executiveName: string;

  gst: IGST;
  items: IInvoiceItem[];
  charges: ICharges;
  company: ICompany;
  payment: IPayment;
  customer: ICustomer;
}

/**
 * ==========================================
 * 📄 API Response Type
 * ==========================================
 */
export interface IGetLatestInvoiceResponse {
  success: boolean;
  count: number;
  data: IInvoice[];
}

export interface ISearchInvoiceResponse {
  success: boolean;
  data: IInvoice;
}
