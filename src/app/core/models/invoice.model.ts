import { Money } from './product.model';

export interface InvoiceStatus {
  code: string;
  label: string;
}

export interface InvoiceAmounts {
  exclTax: Money;
  taxRate: number;
  tax: Money;
  inclTax: Money;
}

export interface InvoiceDates {
  dueDate: string;
  paidAt: string | null;
  isOverdue: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  clientId: string;
  status: InvoiceStatus;
  amounts: InvoiceAmounts;
  dates: InvoiceDates;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateInvoiceDto {
  taxRate: number;
}
