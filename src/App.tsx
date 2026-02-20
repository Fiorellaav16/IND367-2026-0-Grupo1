/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  FileText, 
  Plus, 
  BarChart3, 
  User, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Camera,
  Search,
  Filter,
  ArrowRight,
  Download,
  MoreVertical,
  Calendar,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { Expense, ExpenseStatus, ExpenseCategory } from './types';
import { MOCK_EXPENSES } from './constants';

type View = 'login' | 'dashboard' | 'expenses' | 'new' | 'reports' | 'profile' | 'detail' | 'review' | 'review_detail' | 'close' | 'success' | 'reject' | 'export' | 'generating_close';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'jefe' | 'user'>('admin');

  useEffect(() => {
    const saved = localStorage.getItem('cajachica_expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    } else {
      setExpenses(MOCK_EXPENSES);
    }
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('cajachica_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleApprove = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: ExpenseStatus.APPROVED } : e));
    setView('success');
  };

  const handleReject = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: ExpenseStatus.REJECTED } : e));
    setView('reject');
  };

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense = { ...newExpense, id: Math.random().toString(36).substr(2, 9) };
    setExpenses(prev => [expense, ...prev]);
    setView('dashboard');
  };

  const renderView = () => {
    switch (view) {
      case 'login': return <LoginView onLogin={() => setView('dashboard')} />;
      case 'dashboard': return <DashboardView role={userRole} onRoleChange={setUserRole} expenses={expenses} onNavigate={setView} onSelectExpense={(e) => { setSelectedExpense(e); setView('detail'); }} />;
      case 'expenses': return <ExpensesListView expenses={expenses} onNavigate={setView} onSelectExpense={(e) => { setSelectedExpense(e); setView('detail'); }} />;
      case 'new': return <NewExpenseView onAdd={addExpense} onBack={() => setView('dashboard')} />;
      case 'reports': return <ReportsView expenses={expenses} />;
      case 'profile': return <ProfileView role={userRole} onLogout={() => setView('login')} />;
      case 'detail': return selectedExpense ? <ExpenseDetailView role={userRole} expense={selectedExpense} onBack={() => setView('expenses')} onApprove={() => handleApprove(selectedExpense.id)} onReject={() => handleReject(selectedExpense.id)} /> : null;
      case 'review': return <ReviewListView expenses={expenses} onBack={() => setView('dashboard')} onApprove={handleApprove} onReject={handleReject} onSelectExpense={(e) => { setSelectedExpense(e); setView('review_detail'); }} />;
      case 'review_detail': return selectedExpense ? <ExpenseDetailView role={userRole} expense={selectedExpense} onBack={() => setView('review')} onApprove={() => handleApprove(selectedExpense.id)} onReject={() => handleReject(selectedExpense.id)} showActions /> : null;
      case 'close': return <DailyCloseView expenses={expenses} onBack={() => setView('dashboard')} onGenerate={() => setView('generating_close')} />;
      case 'generating_close': return <GeneratingCloseView onComplete={() => setView('export')} />;
      case 'export': return <ExportView onBack={() => setView('dashboard')} onContinue={() => setView('dashboard')} />;
      case 'success': return <StatusScreen type="success" onContinue={() => setView('dashboard')} />;
      case 'reject': return <StatusScreen type="reject" onContinue={() => setView('dashboard')} />;
      default: return <DashboardView role={userRole} onRoleChange={setUserRole} expenses={expenses} onNavigate={setView} onSelectExpense={(e) => { setSelectedExpense(e); setView('detail'); }} />;
    }
  };

  return (
    <div className="mobile-container">
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {view !== 'login' && view !== 'success' && view !== 'reject' && view !== 'generating_close' && view !== 'export' && (
        <nav className="bg-zinc-900 text-zinc-400 px-6 py-3 pb-8 flex justify-between items-center rounded-t-[32px] shadow-2xl z-50">
          <NavItem icon={<Home size={24} />} label="Inicio" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<FileText size={24} />} label="Gastos" active={view === 'expenses' || view === 'review'} onClick={() => setView('expenses')} />
          
          <button 
            onClick={() => setView('new')}
            className="bg-blue-600 text-white p-4 rounded-full -mt-12 shadow-xl shadow-blue-600/40 active:scale-90 transition-transform border-4 border-zinc-900"
          >
            <Plus size={28} />
          </button>

          <NavItem icon={<BarChart3 size={24} />} label="Reportes" active={view === 'reports'} onClick={() => setView('reports')} />
          <NavItem icon={<User size={24} />} label="Perfil" active={view === 'profile'} onClick={() => setView('profile')} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-500' : 'text-zinc-500'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// --- Views ---

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="h-full bg-gradient-to-b from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-8 text-white relative">
      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-12 backdrop-blur-sm border border-white/30 overflow-hidden">
        <User size={64} />
      </div>
      
      <div className="w-full space-y-4 mb-8">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Username" className="w-full bg-white/10 border border-white/30 rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/60" />
        </div>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="password" placeholder="••••••••••••" className="w-full bg-white/10 border border-white/30 rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/60" />
        </div>
        <button className="text-sm text-center w-full opacity-80">¿Olvidaste tu contraseña?</button>
      </div>

      <div className="flex gap-6 mb-12">
        <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt="Google" />
        </button>
        <button className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6 brightness-0 invert" alt="Facebook" />
        </button>
      </div>

      <button onClick={onLogin} className="w-full bg-blue-800 text-white py-4 rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform">
        Inicio de sesion
      </button>
    </div>
  );
}

function DashboardView({ role, onRoleChange, expenses, onNavigate, onSelectExpense }: { role: string, onRoleChange: (r: any) => void, expenses: Expense[], onNavigate: (v: View) => void, onSelectExpense: (e: Expense) => void }) {
  const pending = expenses.filter(e => e.status === ExpenseStatus.PENDING);
  const approved = expenses.filter(e => e.status === ExpenseStatus.APPROVED);
  const rejected = expenses.filter(e => e.status === ExpenseStatus.REJECTED);
  const totalToday = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const limit = 2000;
  const balance = limit - totalToday;
  const progress = (totalToday / limit) * 100;

  return (
    <div className="min-h-full bg-white p-6 pb-12 space-y-6 text-slate-900">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Hola, {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-200">{role}</span>
          </div>
          <p className="text-slate-400 text-sm">Vie 13 Feb 2026</p>
        </div>
        <button className="p-2 bg-slate-100 rounded-xl border border-slate-200"><MoreVertical size={20} /></button>
      </header>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex gap-1">
        <button 
          onClick={() => onRoleChange('admin')}
          className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          Admin
        </button>
        <button 
          onClick={() => onRoleChange('jefe')}
          className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${role === 'jefe' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          Jefe
        </button>
        <button 
          onClick={() => onRoleChange('user')}
          className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${role === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          User
        </button>
      </div>

      <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm opacity-90 font-medium">Estado de caja</p>
          <p className="text-xs opacity-75 mb-1">Saldo disponible</p>
          <h2 className="text-3xl font-bold mb-4">S/. {balance.toLocaleString()}</h2>
          
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span>Progreso diario</span>
            <span>{Math.round(progress)} %</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold opacity-90">
            <div>
              <p className="opacity-75">Límite diario</p>
              <p className="text-sm">S/. {limit.toLocaleString()}</p>
            </div>
            <div>
              <p className="opacity-75">Usado hoy</p>
              <p className="text-sm">S/. {totalToday.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <section className="space-y-3">
        <h3 className="font-bold text-lg">Alertas Urgentes</h3>
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start">
          <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm border border-red-100"><AlertCircle size={18} /></div>
          <div>
            <p className="text-red-900 text-sm font-bold">{pending.length} gastos pendientes requieren atención inmediata</p>
            <p className="text-red-500 text-xs">Hace 15 min</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
          <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm border border-amber-100"><Clock size={18} /></div>
          <div>
            <p className="text-amber-900 text-sm font-bold">Límite diario al {Math.round(progress)}% (S/. {totalToday.toLocaleString()} de S/. {limit.toLocaleString()})</p>
            <p className="text-amber-500 text-xs">Hace 1 hora</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Resumen de hoy</h3>
          <button onClick={() => onNavigate('expenses')} className="text-blue-600 text-sm font-bold flex items-center gap-1">Ver todos <ArrowRight size={14} /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard icon={<Wallet size={20} />} label="Gastos del día" value={`S/. ${totalToday.toLocaleString()}`} subValue={`De S/. ${limit.toLocaleString()} límite`} color="blue" />
          <SummaryCard icon={<Clock size={20} />} label="Pendientes" value={pending.length.toString()} subValue={`${pending.length} por revisar`} color="amber" />
          <SummaryCard icon={<CheckCircle2 size={20} />} label="Aprobados" value={approved.length.toString()} subValue="Hoy" color="emerald" />
          <SummaryCard icon={<XCircle size={20} />} label="Rechazados" value={rejected.length.toString()} subValue="Requieren seguimiento" color="red" />
        </div>
      </section>

      <button onClick={() => onNavigate('close')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-transform">
        Cierre de hoy
      </button>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Gastos Pendientes</h3>
          <button onClick={() => onNavigate('review')} className="text-blue-600 text-sm font-bold flex items-center gap-1">Revisar todos <ArrowRight size={14} /></button>
        </div>
        <div className="space-y-3">
          {pending.length > 0 ? (
            pending.slice(0, 3).map(expense => (
              <ExpenseCard key={expense.id} expense={expense} onClick={() => onSelectExpense(expense)} />
            ))
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center">
              <p className="text-slate-400 text-sm font-medium">No hay gastos pendientes</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Gastos Recientes</h3>
        <div className="space-y-3">
          {expenses.slice(0, 3).map(expense => (
            <ExpenseCard key={expense.id} expense={expense} onClick={() => onSelectExpense(expense)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value, subValue, color }: { icon: ReactNode, label: string, value: string, subValue: string, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    white: 'bg-white/20 text-white border border-white/30'
  };

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium">{subValue}</p>
    </div>
  );
}

const ExpenseCard: React.FC<{ expense: Expense, onClick: () => void }> = ({ expense, onClick }) => {
  const statusColors = {
    [ExpenseStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [ExpenseStatus.APPROVED]: 'bg-emerald-100 text-emerald-700',
    [ExpenseStatus.REJECTED]: 'bg-red-100 text-red-700',
    [ExpenseStatus.OBSERVED]: 'bg-purple-100 text-purple-700',
  };

  const statusBorder = {
    [ExpenseStatus.PENDING]: 'bg-amber-400',
    [ExpenseStatus.APPROVED]: 'bg-emerald-400',
    [ExpenseStatus.REJECTED]: 'bg-red-400',
    [ExpenseStatus.OBSERVED]: 'bg-purple-400',
  };

  return (
    <div onClick={onClick} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm active:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusBorder[expense.status]}`}></div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-slate-900 truncate text-sm">{expense.description}</h4>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${statusColors[expense.status]}`}>
            {expense.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-2">
          <User size={10} />
          <span className="truncate">{expense.user}</span>
          <span>•</span>
          <Calendar size={10} />
          <span>{expense.date}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-lg font-bold text-slate-900">{expense.currency} {expense.amount.toLocaleString()}</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{expense.category}</p>
          </div>
          <button className="p-2 text-slate-300"><ArrowRight size={18} /></button>
        </div>
      </div>
      {expense.observations && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-red-500 text-[10px] font-medium">
          <AlertCircle size={12} />
          <span>Obs: {expense.observations}</span>
        </div>
      )}
    </div>
  );
}

function ReviewListView({ expenses, onBack, onApprove, onReject, onSelectExpense }: { expenses: Expense[], onBack: () => void, onApprove: (id: string) => void, onReject: (id: string) => void, onSelectExpense: (e: Expense) => void }) {
  const [filter, setFilter] = useState<'Riesgo' | 'Pendientes' | 'Aprobados'>('Pendientes');

  return (
    <div className="flex flex-col min-h-full bg-white pb-32">
      <header className="bg-zinc-950 text-white p-6 pt-12 rounded-b-[32px] flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold uppercase tracking-widest">Para Revisar</h2>
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <p className="text-slate-500 font-bold text-sm">Filtro activos</p>
          <div className="flex gap-3">
            <FilterChip label="Riesgo" active={filter === 'Riesgo'} color="red" onClick={() => setFilter('Riesgo')} />
            <FilterChip label="Pendientes" active={filter === 'Pendientes'} color="amber" onClick={() => setFilter('Pendientes')} />
            <FilterChip label="Aprobados" active={filter === 'Aprobados'} color="emerald" onClick={() => setFilter('Aprobados')} />
          </div>
        </div>

        <div className="space-y-4">
          {expenses.filter(e => {
            if (filter === 'Pendientes') return e.status === ExpenseStatus.PENDING;
            if (filter === 'Aprobados') return e.status === ExpenseStatus.APPROVED;
            return true;
          }).map(expense => (
            <div key={expense.id} className="space-y-3">
              <ExpenseCard expense={expense} onClick={() => onSelectExpense(expense)} />
              {expense.status === ExpenseStatus.PENDING && (
                <div className="flex gap-3">
                  <button onClick={() => onApprove(expense.id)} className="flex-1 py-2 border border-emerald-500 text-emerald-600 rounded-xl font-bold text-sm active:bg-emerald-50">Aprobar</button>
                  <button onClick={() => onReject(expense.id)} className="flex-1 py-2 border border-red-500 text-red-600 rounded-xl font-bold text-sm active:bg-red-50">Rechazar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, color, onClick }: { label: string, active: boolean, color: string, onClick: () => void }) {
  const colors: Record<string, string> = {
    red: active ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600',
    amber: active ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600',
    emerald: active ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
  };

  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${colors[color]}`}>
      {label}
    </button>
  );
}

function NewExpenseView({ onAdd, onBack }: { onAdd: (e: Omit<Expense, 'id'>) => void, onBack: () => void }) {
  const [formData, setFormData] = useState({
    description: '',
    code: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    category: ExpenseCategory.OFFICE_SUPPLIES,
    responsibleArea: ''
  });
  const [showOptional, setShowOptional] = useState(false);

  return (
    <div className="p-6 pb-32 space-y-6 bg-white min-h-full">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <div>
          <h2 className="text-xl font-bold uppercase">Registrar Gasto</h2>
          <p className="text-slate-400 text-xs">Complete los datos del comprobante</p>
        </div>
      </header>

      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 text-emerald-700">
          <Camera size={24} />
          <div>
            <p className="font-bold">Comprobante</p>
            <p className="text-[10px] opacity-80">Adjunta una fotografía clara y legible del recibo o boleta</p>
          </div>
        </div>
        <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-white/50">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><Plus size={24} /></div>
          <p className="text-sm font-bold text-slate-700">Seleccionar archivo</p>
          <p className="text-[10px] text-slate-400">JPG, PNG o PDF Máx. 5MB</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <CheckCircle2 size={20} className="text-red-500" />
          <h3>Datos requeridos</h3>
        </div>
        
        <div className="space-y-4">
          <FormField label="Descripción del gasto" required>
            <input type="text" placeholder="Ejemplo: Compra de útiles de oficina" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </FormField>
          <FormField label="Código o serie del comprobante" required>
            <input type="text" placeholder="Ejemplo: B001-00123456" className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monto total (S/)" required>
              <input type="number" placeholder="0.00" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </FormField>
            <FormField label="Fecha del gasto" required>
              <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </FormField>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <button 
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center justify-between w-full text-slate-900 font-bold"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-emerald-500" />
            <h3>Información adicional</h3>
            <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
          </div>
          <motion.div animate={{ rotate: showOptional ? 180 : 0 }}>
            <ChevronLeft size={20} className="-rotate-90" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showOptional && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <FormField label="Nombre del proveedor">
                <input type="text" placeholder="Nombre o razón social del proveedor" className="input-field" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
              </FormField>
              <FormField label="Categoría del gasto">
                <select className="input-field appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}>
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Área responsable">
                <input type="text" placeholder="Seleccionar área" className="input-field" value={formData.responsibleArea} onChange={e => setFormData({...formData, responsibleArea: e.target.value})} />
              </FormField>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <button 
        disabled={!formData.description || !formData.amount || parseFloat(formData.amount) <= 0}
        onClick={() => onAdd({
          ...formData,
          amount: parseFloat(formData.amount),
          currency: 'S/.',
          status: ExpenseStatus.PENDING,
          user: 'Admin User',
          receiptImage: "/assets/receipt.svg"
        })}
        className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
      >
        Registrar Gasto
      </button>
    </div>
  );
}

function FormField({ label, children, required }: { label: string, children: ReactNode, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

function ExpenseDetailView({ role, expense, onBack, onApprove, onReject, showActions }: { role: string, expense: Expense, onBack: () => void, onApprove: () => void, onReject: () => void, showActions?: boolean }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const statusColors = {
    [ExpenseStatus.PENDING]: 'bg-amber-500 text-white',
    [ExpenseStatus.APPROVED]: 'bg-emerald-500 text-white',
    [ExpenseStatus.REJECTED]: 'bg-red-500 text-white',
    [ExpenseStatus.OBSERVED]: 'bg-cyan-500 text-white',
  };

  const canApprove = (role === 'admin' || role === 'jefe') && showActions;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      <header className="bg-emerald-400 p-6 pt-12 flex justify-between items-center text-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h2 className="text-2xl font-bold uppercase tracking-widest">Detalle de Gasto</h2>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircle size={24} /></button>
      </header>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-12">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Estado:</span>
            <span className={`${statusColors[expense.status]} px-3 py-1 rounded-full`}>{expense.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Descripción:</span>
            <span className="bg-cyan-500 text-white px-3 py-1 rounded-full">Mantenimiento</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-bold text-slate-900">{expense.currency} {expense.amount}</h3>
          <p className="text-slate-400 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="text-slate-900" />
            Mantenimiento
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold">
          <span>Comprobante :</span>
          <FileText size={20} className="text-slate-900" />
        </div>

        <div 
          onClick={() => setIsZoomed(true)}
          className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 group shadow-sm cursor-zoom-in"
        >
          <img 
            src={expense.receiptImage || "/assets/receipt.svg"} 
            alt="Comprobante Escaneado" 
            className="w-full h-auto block" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-700 shadow-sm flex items-center gap-1 text-[10px] font-bold"><Search size={14} /> Zoom</button>
            <button className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-700 shadow-sm flex items-center gap-1 text-[10px] font-bold"><Download size={14} /> Rotar</button>
            <button className="p-2 bg-white/80 backdrop-blur rounded-lg text-slate-700 shadow-sm flex items-center gap-1 text-[10px] font-bold"><User size={14} /> Ver original</button>
          </div>
        </div>

        <AnimatePresence>
          {isZoomed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={expense.receiptImage || "/assets/receipt.svg"} 
                className="max-w-full max-h-full object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button className="absolute top-8 right-8 text-white p-2 bg-white/10 rounded-full"><XCircle size={32} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {expense.alerts && (
          <div className="space-y-3">
            <div className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-bold inline-block uppercase tracking-widest">Alto</div>
            <div className="space-y-2">
              {expense.alerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  {alert.type === 'HIGH' ? <AlertCircle size={18} className="text-red-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
            <button className="text-blue-600 text-xs font-bold flex items-center gap-1">Ver todas las alertas <ChevronLeft size={14} className="rotate-180" /></button>
          </div>
        )}

        <section className="space-y-4">
          <h4 className="font-bold text-lg uppercase border-b border-slate-200 pb-2">Datos del gasto</h4>
          <div className="space-y-2 text-sm">
            <DataRow label="Solicitante" value={expense.user} />
            <DataRow label="Área" value={expense.area || 'Mantenimiento'} />
            <DataRow label="Categoría" value="Repuestos/Wi-Fi" />
            <DataRow label="Categoría" value="Repuestos/Wi-Fi" />
            <DataRow label="Método" value="Compra de conectores RJ45 + canaleta" />
            <DataRow label="Monto registrado" value={`${expense.currency}${expense.amount}`} />
            <DataRow label="Monto del comprobante" value={`${expense.currency}${expense.amount}`} verified />
          </div>
        </section>

        <section className="space-y-4 pb-12">
          <h4 className="font-bold text-lg uppercase border-b border-slate-200 pb-2">Historial</h4>
          <div className="space-y-3">
            {expense.history?.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{h.date}</span>
                  <ArrowRight size={12} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{h.user}</span>
                  <span className="text-slate-900 font-bold">• {expense.currency}{h.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  {h.status === ExpenseStatus.OBSERVED && <AlertCircle size={14} className="text-amber-500" />}
                  <span className={`${h.status === ExpenseStatus.APPROVED ? 'text-emerald-500' : h.status === ExpenseStatus.OBSERVED ? 'bg-amber-400 text-slate-900 px-2 rounded' : 'text-slate-500'} font-bold`}>{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {canApprove && expense.status === ExpenseStatus.PENDING && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4 shrink-0">
          <button onClick={onApprove} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">Aprobar</button>
          <button onClick={onReject} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform">Rechazar</button>
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value, verified }: { label: string, value: string, verified?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-500 font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900">{value}</span>
        {verified && <CheckCircle2 size={16} className="text-emerald-500" />}
      </div>
    </div>
  );
}

function ReportsView({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const observedCount = expenses.filter(e => e.status === ExpenseStatus.OBSERVED).length;
  const observedPercent = expenses.length > 0 ? ((observedCount / expenses.length) * 100).toFixed(1) : "0";
  
  const chartData = [
    { name: 'Manten.', value: expenses.filter(e => e.category === ExpenseCategory.MAINTENANCE).reduce((a,c)=>a+c.amount,0) || 500 },
    { name: 'Operac.', value: expenses.filter(e => e.category === ExpenseCategory.TRANSPORT).reduce((a,c)=>a+c.amount,0) || 300 },
    { name: 'Oficina', value: expenses.filter(e => e.category === ExpenseCategory.OFFICE_SUPPLIES).reduce((a,c)=>a+c.amount,0) || 200 },
    { name: 'Comida', value: expenses.filter(e => e.category === ExpenseCategory.FOOD).reduce((a,c)=>a+c.amount,0) || 150 },
    { name: 'Otros', value: 100 },
  ];

  return (
    <div className="p-6 pb-32 space-y-8 bg-white min-h-full">
      <header>
        <h2 className="text-3xl font-bold">INDICADORES</h2>
        <p className="text-slate-400 text-sm">Control y patrones de caja chica</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <TabChip label="Semana" />
        <TabChip label="Mes" active />
        <TabChip label="3 meses" />
        <TabChip label="Año" />
      </div>

      <div className="flex gap-2">
        <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">Área: Todas <ChevronLeft size={14} className="-rotate-90" /></button>
        <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">Persona: Todos <ChevronLeft size={14} className="-rotate-90" /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total gastado" value={`S/. ${total.toLocaleString()}`} />
        <StatCard label="N° de gastos" value={expenses.length.toString()} />
        <StatCard label="Promedio" value={`S/. ${expenses.length > 0 ? Math.round(total / expenses.length).toLocaleString() : '0'}`} />
        <StatCard label="Observados" value={observedCount.toString()} sub={`${observedPercent}%`} />
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Gasto por Área</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-slate-100 -mx-6 p-6 space-y-4">
        <h3 className="font-bold text-lg">Artículos más repetidos</h3>
        <div className="bg-white rounded-3xl p-4 space-y-4 shadow-sm">
          <RepeatedItem label="Martillo" count={9} area="Mantenimiento" />
          <RepeatedItem label="Taxi" count={8} area="Ventas" />
          <RepeatedItem label="Tornillos" count={7} area="Mantenimiento" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Alertas de Patron</h3>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Martillo: 3 compras en 30 días (Mantenimiento)</span>
            <button className="text-red-500 font-bold">Revisar</button>
          </div>
          <div className="h-px bg-red-100 w-full"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Taxi: 8 registros esta semana (Ventas)</span>
            <button className="text-red-500 font-bold">Revisar</button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-bold text-sm">Por área</button>
          <button className="px-4 py-2 text-slate-500 font-bold text-sm">Por persona</button>
        </div>
        <div className="space-y-4">
          <AreaRankItem rank={1} name="Administración" amount={`S/. ${expenses.filter(e => e.area === 'Administración').reduce((a,c)=>a+c.amount,0).toLocaleString()}`} count={expenses.filter(e => e.area === 'Administración').length} percent="-" />
          <AreaRankItem rank={2} name="Ventas" amount={`S/. ${expenses.filter(e => e.area === 'Ventas').reduce((a,c)=>a+c.amount,0).toLocaleString()}`} count={expenses.filter(e => e.area === 'Ventas').length} percent="-" />
          <AreaRankItem rank={3} name="Proyectos" amount={`S/. ${expenses.filter(e => e.area === 'Proyectos').reduce((a,c)=>a+c.amount,0).toLocaleString()}`} count={expenses.filter(e => e.area === 'Proyectos').length} percent="-" />
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Proveedores</h3>
        <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-sm">
          <ProviderItem name="Ferretería El Progreso" ruc="20139302903" amount="S/ 2840" count={24} />
          <ProviderItem name="Taxi Express SAC" ruc="20346785920" amount="S/ 1680" count={18} />
          <ProviderItem name="Tech solutions" ruc="20240903100" amount="S/ 1420" count={12} />
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <button className="w-full bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">
          Exportar
        </button>
        <div className="flex gap-2">
          <button className="flex-1 bg-cyan-100 text-cyan-700 py-2 rounded-xl font-bold text-xs">Excel</button>
          <button className="flex-1 bg-cyan-100 text-cyan-700 py-2 rounded-xl font-bold text-xs">PDF</button>
          <button className="flex-1 bg-cyan-100 text-cyan-700 py-2 rounded-xl font-bold text-xs">Observados</button>
        </div>
      </div>
    </div>
  );
}

function AreaRankItem({ rank, name, amount, count, percent }: { rank: number, name: string, amount: string, count: number, percent: string }) {
  return (
    <div className="bg-cyan-50 p-4 rounded-2xl flex items-center gap-4">
      <div className="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold">{rank}</div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-[10px] font-bold text-slate-900">{count}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-slate-500">{amount} - {count} gastos</p>
          <p className="text-[10px] text-slate-500">{percent}</p>
        </div>
      </div>
    </div>
  );
}

function ProviderItem({ name, ruc, amount, count }: { name: string, ruc: string, amount: string, count: number }) {
  return (
    <div className="space-y-1 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
      <p className="font-bold text-slate-900 text-sm">{name}</p>
      <p className="text-[10px] text-slate-400 font-medium">{ruc} - {amount} - {count}x</p>
    </div>
  );
}

function TabChip({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
      {label}
    </button>
  );
}

function StatCard({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-bold text-slate-900">{value}</p>
        {sub && <span className="text-[10px] text-slate-400 font-bold">{sub}</span>}
      </div>
    </div>
  );
}

function Bar({ height, label }: { height: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full bg-slate-200 rounded-t-lg transition-all duration-500" style={{ height }}></div>
      <span className="text-[10px] text-slate-400 font-bold">{label}</span>
    </div>
  );
}

function RepeatedItem({ label, count, area }: { label: string, count: number, area: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <div>
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium">{count} veces - {area}</p>
      </div>
      <button className="text-slate-300"><ArrowRight size={16} /></button>
    </div>
  );
}

function ProfileView({ role, onLogout }: { role: string, onLogout: () => void }) {
  return (
    <div className="min-h-full bg-emerald-500 flex flex-col p-8 pb-32 text-white overflow-y-auto">
      <div className="flex flex-col items-center mt-12 mb-12">
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden mb-6 shadow-2xl">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300" alt="Empresaria" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-3 flex items-center gap-3">
          <User size={24} />
          <span className="text-xl font-bold capitalize">Administrador</span>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <ProfileButton label="Usuarios" />
        <ProfileButton label="Politicas" />
        <ProfileButton label="Lista negra de proveedores" />
        <ProfileButton label="Configuración de cuenta" />
        <ProfileButton label="Notificaciones" />
        <ProfileButton label="Ayuda y soporte" />
      </div>

      <div className="mt-auto pb-8">
        <button onClick={onLogout} className="w-full bg-red-500/20 border border-red-500/30 text-white py-4 rounded-2xl font-bold active:bg-red-500/40 transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

function ProfileButton({ label }: { label: string }) {
  return (
    <button className="w-full bg-emerald-400/30 border border-white/20 text-white py-4 rounded-2xl font-bold text-lg active:bg-emerald-400/50 transition-colors shadow-lg">
      {label}
    </button>
  );
}

function ExpensesListView({ expenses, onNavigate, onSelectExpense }: { expenses: Expense[], onNavigate: (v: View) => void, onSelectExpense: (e: Expense) => void }) {
  return (
    <div className="p-6 pb-32 space-y-6 bg-white min-h-full">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Gastos</h2>
        <button onClick={() => onNavigate('review')} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold">Revisar Pendientes</button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Buscar gastos..." className="w-full bg-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="space-y-4">
        {expenses.map(expense => (
          <ExpenseCard key={expense.id} expense={expense} onClick={() => onSelectExpense(expense)} />
        ))}
      </div>
    </div>
  );
}

function DailyCloseView({ expenses, onBack, onGenerate }: { expenses: Expense[], onBack: () => void, onGenerate: () => void }) {
  const approved = expenses.filter(e => e.status === ExpenseStatus.APPROVED);
  const pending = expenses.filter(e => e.status === ExpenseStatus.PENDING);
  const observed = expenses.filter(e => e.status === ExpenseStatus.OBSERVED);
  const totalApproved = approved.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = pending.reduce((acc, curr) => acc + curr.amount, 0);
  const totalObserved = observed.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 pb-32 space-y-8 bg-white min-h-full">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-xl"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <h2 className="text-xl font-bold">Cierre diario</h2>
          <p className="text-slate-400 text-xs">viernes 13 de febrero, 2026</p>
        </div>
        <button className="p-2 bg-slate-100 rounded-xl"><ArrowRight size={20} className="rotate-180" /></button>
      </header>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900">Resumen del día</h3>
        <div className="grid grid-cols-2 gap-4">
          <CloseStatCard icon={<CheckCircle2 size={20} />} label="Aprobados" value={approved.length.toString()} amount={`S/. ${totalApproved.toLocaleString()}`} color="emerald" />
          <CloseStatCard icon={<Wallet size={20} />} label="Total Hoy" value={expenses.length.toString()} amount={`S/. ${expenses.reduce((a,c)=>a+c.amount,0).toLocaleString()}`} color="blue" />
          <CloseStatCard icon={<AlertCircle size={20} />} label="Observados" value={observed.length.toString()} amount={`S/. ${totalObserved.toLocaleString()}`} color="amber" />
          <CloseStatCard icon={<Clock size={20} />} label="Pendientes" value={pending.length.toString()} amount={`S/. ${totalPending.toLocaleString()}`} color="slate" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Detalle por estado</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Últimos movimientos</span>
        </div>
        <div className="space-y-3">
          {expenses.slice(0, 5).map(expense => (
            <CloseDetailItem 
              key={expense.id}
              label={expense.description} 
              amount={`${expense.currency} ${expense.amount.toLocaleString()}`} 
              category={expense.category} 
              status={expense.status} 
              time="14:30" 
            />
          ))}
        </div>
      </section>

      <button onClick={onGenerate} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-transform">
        Generar Cierre
      </button>
    </div>
  );
}

function CloseStatCard({ icon, label, value, amount, color }: { icon: ReactNode, label: string, value: string, amount: string, color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-blue-50 text-blue-500',
    amber: 'bg-amber-50 text-amber-500',
    slate: 'bg-slate-50 text-slate-500'
  };

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-slate-400 text-[10px] font-bold mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-bold">{amount}</p>
    </div>
  );
}

function CloseDetailItem({ label, amount, category, status, time }: { label: string, amount: string, category: string, status: string, time: string, key?: string }) {
  const statusColors: Record<string, string> = {
    [ExpenseStatus.APPROVED]: 'bg-emerald-50 text-emerald-600',
    [ExpenseStatus.OBSERVED]: 'bg-amber-50 text-amber-600',
    [ExpenseStatus.PENDING]: 'bg-slate-50 text-slate-600',
    [ExpenseStatus.REJECTED]: 'bg-red-50 text-red-600',
    'Pagado': 'bg-blue-50 text-blue-600'
  };

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex justify-between items-start">
      <div className="space-y-2">
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <div className="flex gap-2">
          <span className="bg-slate-100 text-slate-500 px-3 py-0.5 rounded-full text-[10px] font-bold">{category}</span>
          <span className={`${statusColors[status] || 'bg-slate-50 text-slate-600'} px-3 py-0.5 rounded-full text-[10px] font-bold`}>{status}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-slate-900">{amount}</p>
        <p className="text-[10px] text-slate-400 font-bold">{time}</p>
      </div>
    </div>
  );
}

function GeneratingCloseView({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full bg-emerald-600 flex flex-col items-center justify-center p-8 text-white text-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="bg-blue-800 px-12 py-6 rounded-3xl text-2xl font-bold shadow-2xl"
      >
        Generando Cierre
      </motion.div>
    </div>
  );
}

function ExportView({ onBack, onContinue }: { onBack: () => void, onContinue: () => void }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reporte CajaChicaPRO',
          text: 'Adjunto reporte de cierre diario.',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Funcionalidad de compartir no disponible en este navegador. El archivo Excel se ha "descargado".');
    }
  };

  return (
    <div className="h-full bg-emerald-600 flex flex-col items-center justify-center p-8 text-white text-center">
      <div className="space-y-6 w-full max-w-xs">
        <button 
          onClick={handleShare}
          className="w-full bg-blue-800 text-white py-5 rounded-3xl font-bold text-xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <Download size={24} />
          Descargar EXCEL
        </button>
        <button 
          onClick={onContinue}
          className="w-full bg-blue-800 text-white py-5 rounded-3xl font-bold text-xl shadow-2xl active:scale-95 transition-transform"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function StatusScreen({ type, onContinue }: { type: 'success' | 'reject', onContinue: () => void }) {
  return (
    <div className="h-full bg-emerald-600 flex flex-col items-center justify-center p-8 text-white text-center">
      <div className="mb-12 space-y-4">
        <div className={`bg-zinc-900/40 backdrop-blur-md px-8 py-4 rounded-full text-xl font-bold shadow-2xl border border-white/10`}>
          {type === 'success' ? 'Se aprobo el gasto' : 'Se rechazo el gasto'}
        </div>
        {type === 'reject' && <p className="text-red-200 text-3xl font-bold opacity-80">Pasa a revisión</p>}
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[40px] w-full max-w-xs mb-12 shadow-2xl">
        <h3 className="text-xl font-bold mb-1">Suministros de oficina</h3>
        <p className="text-white/70 text-sm mb-4">Carlos Bazan</p>
        <p className="text-4xl font-bold mb-4">1,280 $</p>
        <p className="text-white/70 text-xs">Papeleria 13/02/2026</p>
      </div>

      <button onClick={onContinue} className="w-full max-w-xs bg-blue-800 text-white py-5 rounded-3xl font-bold text-xl shadow-2xl active:scale-95 transition-transform">
        Continuar
      </button>
    </div>
  );
}
