import { Type } from "@google/genai";

export enum ExpenseStatus {
  PENDING = "Pendiente",
  APPROVED = "Aprobado",
  REJECTED = "Rechazado",
  OBSERVED = "Observado",
}

export enum ExpenseCategory {
  OFFICE_SUPPLIES = "Papeleria",
  TRANSPORT = "Transporte",
  MAINTENANCE = "Mantenimiento",
  FOOD = "Alimentación",
  OPERATIONS = "Operaciones",
  PROJECTS = "Proyectos",
}

export interface ExpenseAlert {
  type: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: ExpenseStatus;
  category: ExpenseCategory;
  user: string;
  receiptImage?: string;
  code?: string;
  provider?: string;
  area?: string;
  responsibleArea?: string;
  observations?: string;
  alerts?: ExpenseAlert[];
  history?: {
    date: string;
    user: string;
    amount: number;
    status: ExpenseStatus;
    detail?: string;
  }[];
}

export interface DailySummary {
  totalSpent: number;
  limit: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  observedCount: number;
}
