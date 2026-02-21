import { Expense, ExpenseStatus, ExpenseCategory, BlacklistedProvider } from "./types";

export const BLACKLISTED_PROVIDERS: BlacklistedProvider[] = [
  { id: "1", name: "Servicios Fantasmas SAC", reason: "Facturación de servicios no realizados detectada en auditoría." },
  { id: "2", name: "Insumos Pro", reason: "Calidad de productos por debajo de los estándares requeridos." },
  { id: "3", name: "Transportes Veloz", reason: "Múltiples reportes de retrasos críticos y falta de comprobantes válidos." },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "1",
    description: "Compra de papelería",
    amount: 125.50,
    currency: "S/.",
    date: "2026-02-13",
    status: ExpenseStatus.PENDING,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    user: "Carlos Bazan",
    receiptImage: "/assets/receipt.svg",
    code: "B001-00123456",
    provider: "Papelería El Sol",
    area: "Administración",
    observations: "Pendiente de validación física",
    history: [
      { date: "13 Feb", user: "Carlos Bazan", amount: 125.50, status: ExpenseStatus.PENDING }
    ]
  },
  {
    id: "2",
    description: "Arreglo de máquinas",
    amount: 850,
    currency: "S/.",
    date: "2026-02-13",
    status: ExpenseStatus.PENDING,
    category: ExpenseCategory.MAINTENANCE,
    user: "Carlos Ruiz",
    receiptImage: "/assets/receipt.svg",
    provider: "Taxi Express SAC",
    area: "Ventas",
    observations: "Mantenimiento preventivo de impresora industrial",
    history: [
      { date: "13 Feb", user: "Carlos Ruiz", amount: 850, status: ExpenseStatus.PENDING }
    ]
  },
  {
    id: "3",
    description: "Suministro de herramientas",
    amount: 540.20,
    currency: "S/.",
    date: "2026-02-13",
    status: ExpenseStatus.PENDING,
    category: ExpenseCategory.OPERATIONS,
    user: "Maria Lopez",
    receiptImage: "/assets/receipt.svg",
    provider: "Ferretería Central",
    area: "Proyectos",
    observations: "Kit de destornilladores y taladro",
    history: [
      { date: "13 Feb", user: "Maria Lopez", amount: 540.20, status: ExpenseStatus.PENDING }
    ]
  },
  {
    id: "4",
    description: "Mantenimiento de equipos",
    amount: 450,
    currency: "S/.",
    date: "2026-02-10",
    status: ExpenseStatus.REJECTED,
    category: ExpenseCategory.MAINTENANCE,
    user: "Jorge Sanchez",
    receiptImage: "/assets/receipt.svg",
    provider: "Clima Tech",
    area: "Operaciones",
    observations: "Monto excede el presupuesto mensual del área",
    history: [
      { date: "10 Feb", user: "Jorge Sanchez", amount: 450, status: ExpenseStatus.PENDING },
      { date: "11 Feb", user: "Admin User", amount: 450, status: ExpenseStatus.REJECTED, detail: "Monto excede presupuesto" }
    ]
  },
  {
    id: "5",
    description: "Compra de insumos",
    amount: 320.80,
    currency: "S/.",
    date: "2026-02-14",
    status: ExpenseStatus.PENDING,
    category: ExpenseCategory.OPERATIONS,
    user: "Ana Patricia Torres",
    receiptImage: "/assets/receipt.svg",
    provider: "Insumos Pro",
    area: "Operaciones",
    observations: "Insumos de limpieza para planta",
    history: [
      { date: "14 Feb", user: "Ana Patricia Torres", amount: 320.80, status: ExpenseStatus.PENDING }
    ]
  }
];
