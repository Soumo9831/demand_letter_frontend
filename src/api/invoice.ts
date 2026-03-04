import api from "./axios";
import type { IGetLatestInvoiceResponse } from "@/types/invoiceType";

/**
 * ==========================================
 * 📄 Get Latest Invoice By Any ID
 * ==========================================
 * POST /api/v1/invoices/latest
 */
export const getLatestInvoice = async (invoiceId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<IGetLatestInvoiceResponse>(
    "/invoices/latest",
    { invoiceId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};