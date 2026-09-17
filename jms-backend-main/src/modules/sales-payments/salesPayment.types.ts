import { PaymentMethod, PaymentStatus } from '../../generated/prisma';

export interface CreateSalesPaymentDTO {
  salesInvoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionReference?: string;
  paymentDate?: string;
  remarks?: string;
}

export interface ReverseSalesPaymentDTO {
  reversalReason: string;
}

export interface SalesPaymentQueryDTO {
  page?: number;
  limit?: number;
  salesInvoiceId?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentSummaryByMethod {
  cash: string;
  card: string;
  upi: string;
  bankTransfer: string;
  cheque: string;
}

export interface InvoicePaymentSummaryDTO {
  invoiceId: string;
  invoiceNumber: string;
  grandTotal: string;
  totalPaid: string;
  outstandingAmount: string;
  paymentStatus: string;
  payments: PaymentSummaryByMethod;
}
