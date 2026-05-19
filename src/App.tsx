import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Package, 
  BarChart3, 
  PlusCircle,
  Bell,
  Clock,
  Menu,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Edit,
  Wheat,
  Beaker,
  Droplets,
  Fuel,
  Download,
  FileText,
  Table as TableIcon,
  AlertTriangle,
  MoreVertical,
  Search,
  Filter,
  LogOut,
  Check,
  X,
  XCircle,
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  Settings2,
  Calendar,
  CheckCircle2,
  Sun,
  Moon,
  ChevronDown,
  Truck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';

const formatWithCommas = (val: string | number) => {
  if (val === undefined || val === null || val === "") return "";
  const str = val.toString();
  const num = str.replace(/,/g, "");
  if (isNaN(Number(num))) return str;
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const NumericInput = ({ value, onChange, ...props }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "" || rawValue === "." || !isNaN(Number(rawValue))) {
      onChange(rawValue);
    }
  };

  return (
    <input
      {...props}
      type="text"
      value={formatWithCommas(value)}
      onChange={handleChange}
    />
  );
};
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types ---
type View = 'dashboard' | 'finance' | 'contacts' | 'inventory' | 'reports' | 'categories';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  timestamp?: number;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'available' | 'low' | 'out';
  icon: React.ElementType;
}

// --- Components ---

const Sidebar = ({ activeView, setView, user, theme, toggleTheme }: { activeView: View, setView: (v: View) => void, user: User, theme: 'dark' | 'light', toggleTheme: () => void }) => {
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'finance', label: 'المالية', icon: Wallet },
    { id: 'contacts', label: 'جهات الاتصال', icon: Users },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    { id: 'categories', label: 'إدارة التصنيفات', icon: Settings2 },
  ];

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-[calc(100vh-96px)] w-72 fixed right-0 top-24 border-l p-8 gap-2 z-40 transition-all duration-500 shadow-lux",
      "bg-sidebar border-border-subtle"
    )}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4 flex-row">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-black font-black text-2xl shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-transform hover:rotate-3">
            L
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-on-surface leading-tight">لوكسوريا</h2>
            <p className="text-[9px] text-primary uppercase tracking-[0.3em] font-black opacity-60">Luxury Bakery</p>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl bg-on-surface/5 flex items-center justify-center text-on-surface hover:bg-primary hover:text-black transition-all ring-1 ring-on-surface/5"
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-10 flex-1">
        <div className="space-y-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-muted font-black px-4 flex items-center gap-2">
            <span className="w-4 h-px bg-on-surface-muted/30"></span>
            القائمة الرئيسية
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={cn(
                  "flex items-center justify-start gap-4 px-4 py-3.5 transition-all duration-300 group relative w-full rounded-2xl",
                  activeView === item.id 
                    ? "text-primary bg-primary/5 shadow-[inset_0_0_12px_rgba(212,175,55,0.05)]" 
                    : "text-on-surface-muted hover:text-on-surface hover:bg-on-surface/5"
                )}
              >
                <div className={cn(
                  "transition-all duration-300",
                  activeView === item.id ? "text-primary scale-110" : "text-on-surface-muted group-hover:text-on-surface shadow-primary/10"
                )}>
                  <item.icon size={20} className={activeView === item.id ? "drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : ""} />
                </div>
                <span className={cn(
                  "text-sm font-bold tracking-wide transition-all",
                  activeView === item.id ? "translate-x-[-4px]" : ""
                )}>{item.label}</span>
                {activeView === item.id && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto flex flex-col gap-5">
        <div className="flex items-center gap-4 p-4 bg-on-surface/5 rounded-3xl border border-on-surface/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-10 h-10 rounded-2xl ring-2 ring-primary/20" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black font-black text-lg">
              {user.displayName?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0 z-10">
            <p className="text-sm font-bold text-on-surface truncate">{user.displayName}</p>
            <button 
              onClick={() => signOut(auth)}
              className="text-[10px] text-on-surface-muted hover:text-red-400 font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
            >
              <LogOut size={12} />
              خروج
            </button>
          </div>
        </div>
        <div className="p-5 bg-on-surface/[0.02] rounded-[2rem] border border-on-surface/5 text-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/10 blur-2xl group-hover:scale-150 transition-transform"></div>
          <p className="text-[10px] text-on-surface-muted mb-1 font-medium tracking-tight">الحساب الموثق</p>
          <p className="text-[11px] mb-0 font-bold text-on-surface/80 truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ netValue, theme, toggleTheme }: { netValue: number, theme: 'dark' | 'light', toggleTheme: () => void }) => {
  return (
    <header className="flex justify-between items-center w-full px-6 sm:px-12 py-4 sm:py-6 bg-bakery-surface/80 backdrop-blur-lg sticky top-0 z-50 border-b border-border-subtle lg:pr-72 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="lg:hidden flex items-center gap-3">
           <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tighter drop-shadow-sm">لوكسوريا</h1>
        </div>
        <div className="hidden lg:flex items-center bg-on-surface/[0.03] border border-on-surface/5 rounded-2xl px-6 py-3 gap-4 text-on-surface-muted focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 focus-within:bg-on-surface/5 transition-all">
          <Search size={18} className="text-primary/60" />
          <input type="text" placeholder="ما الذي تبحث عنه..." className="bg-transparent border-none outline-none text-sm w-80 text-right placeholder:text-on-surface-muted/40 text-on-surface font-medium" />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="lg:hidden w-10 h-10 rounded-2xl border border-on-surface/5 bg-on-surface/5 flex items-center justify-center text-on-surface-muted hover:bg-primary hover:text-black transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-7">
          <div className="flex flex-col items-end">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-on-surface-muted font-black mb-1 opacity-70">الميزانية الحالية</p>
            <p className="text-lg sm:text-xl font-black text-primary leading-none tracking-tight">{formatCurrency(netValue)}</p>
          </div>
          
          <div className="h-8 sm:h-10 w-px bg-on-surface/10 scale-y-75 opacity-50"></div>
          
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-on-surface/5 bg-on-surface/5 flex items-center justify-center text-lg hover:border-primary/20 hover:bg-primary/5 transition-all relative group">
            <Bell size={20} className="text-on-surface-muted group-hover:text-primary group-hover:rotate-12 transition-all" />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 sm:h-2.5 sm:w-2.5 h-2 bg-primary rounded-full ring-4 ring-bakery-surface shadow-[0_0_10px_rgba(212,175,55,0.6)]"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

const StatCard = ({ title, value, unit, trend, color, icon: Icon }: any) => {
  return (
    <div className="bg-surface-card rounded-[40px] p-8 shadow-lux border border-border-subtle relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[70px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div className={cn("p-4.5 rounded-[22px] bg-on-surface/[0.04] border border-on-surface/[0.04] text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-sm relative overflow-hidden group/icon")}>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
          <Icon size={24} strokeWidth={2.5} className="relative z-10" />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.1em] border backdrop-blur-xl transition-all shadow-sm",
            trend > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            {trend > 0 ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-on-surface-muted text-[10px] uppercase font-black tracking-[0.25em] mb-4 opacity-60 leading-none">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-on-surface tracking-tighter tabular-nums leading-none drop-shadow-sm">{value}</span>
          {unit && <span className="text-[10px] text-on-surface-muted font-black uppercase tracking-[0.2em] opacity-40">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

const InventoryRow = ({ item }: { item: InventoryItem }) => {
  return (
    <tr className="hover:bg-on-surface/[0.02] transition-colors border-b border-border-subtle group">
      <td className="py-8 px-10 text-right">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-on-surface/[0.03] border border-on-surface/5 flex items-center justify-center text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-black group-hover:rotate-6 shadow-sm relative overflow-hidden group/icon">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
            <item.icon size={28} className="relative z-10" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-black text-on-surface text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{item.name}</span>
            <span className="text-[10px] text-on-surface-muted uppercase tracking-[0.25em] font-black opacity-40">Item #{item.id.slice(-4).toUpperCase()}</span>
          </div>
        </div>
      </td>
      <td className="py-8 px-10 text-right">
        <div className="flex items-center gap-4">
          <span className="font-black text-on-surface text-3xl tabular-nums tracking-tighter">{item.quantity}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-muted font-black px-4 py-2 bg-on-surface/[0.05] rounded-xl border border-on-surface/5">{item.unit}</span>
        </div>
      </td>
      <td className="py-8 px-10 text-right">
        <span className="font-black text-primary text-2xl tabular-nums tracking-tighter drop-shadow-sm">
          {formatCurrency(item.price)}
        </span>
      </td>
      <td className="py-8 px-10 text-right">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-8 px-10 text-center">
        <button className="w-14 h-14 rounded-2xl bg-on-surface/5 border border-on-surface/5 flex items-center justify-center text-on-surface-muted hover:text-primary hover:border-primary/20 hover:bg-primary/[0.02] transition-all shadow-sm">
          <MoreVertical size={22} />
        </button>
      </td>
    </tr>
  );
};

const StatusBadge = ({ status }: { status: InventoryItem['status'] }) => {
  const styles = {
    available: "bg-emerald-500/10 dark:text-emerald-400 text-emerald-600 border-emerald-500/20",
    low: "bg-amber-500/10 dark:text-amber-400 text-amber-600 border-amber-500/20",
    out: "bg-red-500/10 dark:text-red-400 text-red-600 border-red-500/20"
  };

  const labels = {
    available: "متوفر",
    low: "منخفض",
    out: "نفذ"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm",
      styles[status]
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", status === 'available' ? "bg-emerald-500" : status === 'low' ? "bg-amber-500" : "bg-red-500")} />
      {labels[status]}
    </span>
  );
};

// --- Page Content ---

const Dashboard = ({ stats, transactions, inventory }: any) => {
  const lowStock = inventory.filter((i: any) => i.status === 'low' || i.status === 'out');

  return (
    <div className="flex flex-col gap-8 sm:gap-12 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border-subtle pb-6 sm:pb-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tighter mb-2 sm:mb-4">
            نظام <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-primary/80 to-primary/40">لوكسوريا</span> الإداري
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-on-surface-muted text-xs sm:text-sm font-medium">
             <div className="flex items-center gap-2 bg-on-surface/5 px-4 py-1.5 rounded-full border border-on-surface/5">
                <Clock size={14} className="text-primary" />
                <span>آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</span>
             </div>
             <div className="hidden sm:block w-1 h-1 rounded-full bg-on-surface/20"></div>
             <p className="italic opacity-60">تعديل بيانات المخبز في الوقت الفعلي</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <StatCard title="إجمالي الأصول" value={formatCurrency(stats.netValue)} trend={12.4} color="bg-primary" icon={Wallet} />
        <StatCard title="إيرادات اليوم" value={formatCurrency(stats.dailyIncome)} trend={5.2} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard title="المصروفات الجارية" value={formatCurrency(stats.dailyExpense)} trend={-2.1} color="bg-red-500" icon={TrendingDown} />
        <StatCard title="مديونية العملاء" value={formatCurrency(stats.totalDebt)} color="bg-primary" icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
        <div className="xl:col-span-8 bg-surface-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-lux border border-border-subtle flex flex-col justify-between min-h-[350px] sm:h-[420px] relative overflow-hidden group transition-all duration-500 hover:border-primary/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] text-primary font-black uppercase tracking-wider mb-4 sm:mb-8 inline-block shadow-[0_0_15px_rgba(212,175,55,0.1)]">تقدير الكفاءة</span>
              <h2 className="text-5xl sm:text-7xl font-black text-on-surface tracking-tighter tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform origin-right duration-500">+{((stats.dailyIncome / (stats.dailyExpense || 1)) * 10).toFixed(1)}%</h2>
              <p className="text-on-surface-muted text-sm sm:text-lg mt-4 sm:mt-6 font-medium max-w-sm leading-relaxed opacity-80">تحسن ملحوظ في أداء المبيعات مقارنة بتكلفة الإنتاج لليوم</p>
            </div>
            <div className="hidden sm:flex gap-2 items-end h-32 px-4 border-r border-on-surface/5">
              {transactions.slice(0, 10).map((t: any, i: number) => (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(t.amount/800, 100)}%` }}
                  key={i} 
                  className={cn("w-2 rounded-t-lg transition-all duration-500", t.type === 'income' ? 'bg-primary shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-on-surface/10')} 
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-8 sm:gap-16 border-t border-on-surface/5 pt-6 sm:pt-10 relative z-10">
            <div className="group/item cursor-default">
              <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-[0.25em] text-on-surface-muted mb-2 sm:mb-3 opacity-60">سجل العمليات</p>
              <p className="text-xl sm:text-3xl font-black text-on-surface tracking-tight group-hover/item:text-primary transition-colors">{transactions.length} <span className="text-[10px] sm:text-sm font-medium opacity-40">حركة مالية</span></p>
            </div>
            <div className="group/item cursor-default">
              <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-[0.25em] text-on-surface-muted mb-2 sm:mb-3 opacity-60">الربح الصافي</p>
              <p className="text-xl sm:text-3xl font-black text-on-surface tracking-tight group-hover/item:text-emerald-500 transition-colors">{formatCurrency(stats.dailyIncome - stats.dailyExpense)}</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className={cn("rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 flex flex-col justify-between shadow-lux min-h-[300px] sm:h-[420px] transition-all duration-700 relative overflow-hidden group", lowStock.length > 0 ? "bg-red-500 text-white" : "bg-primary text-black")}>
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex justify-between items-start relative z-10">
                <div className="p-4 bg-black/20 rounded-2xl backdrop-blur-xl border border-white/10 shadow-lg">
                   {lowStock.length > 0 ? <AlertTriangle size={24} strokeWidth={2.5} /> : <Package size={24} strokeWidth={2.5} />}
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-black/10 rounded-full border border-black/5">{lowStock.length > 0 ? 'تنبيه عجز' : 'حالة المخزون'}</span>
             </div>
             <div className="relative z-10">
               {lowStock.length > 0 ? (
                 <div className="space-y-6">
                    <p className="text-4xl font-black tracking-tighter leading-tight">يرجى مراجعة التوريدات فوراً</p>
                    <div className="bg-black/10 p-5 rounded-3xl border border-black/5 divide-y divide-black/5">
                      {lowStock.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                          <span className="opacity-70 font-medium">{item.name}</span>
                          <span className="font-bold flex items-center gap-2">
                             {item.quantity} {item.unit}
                             <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse"></div>
                          </span>
                        </div>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <p className="text-3xl font-black tracking-tighter leading-tight">توازن كلي في سلاسل الإمداد</p>
                    <p className="text-sm font-medium opacity-80 leading-relaxed mt-4">جميع المواد الخام والمكونات متوفرة بمستويات آمنة، لا حاجة لطلب توريدات عاجلة.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-bold tracking-[0.2em] text-on-surface-muted uppercase">أحدث التحركات المالية</h3>
          </div>
          <div className="space-y-4">
             {transactions.slice(0, 3).map((t: any, i: number) => (
               <div key={i} className="bg-surface-card p-5 rounded-3xl flex justify-between items-center border border-on-surface/5 hover:border-on-surface/10 transition-all group">
                 <div className="flex items-center gap-5">
                   <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform", t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-on-surface/5 text-on-surface-muted')}>
                     {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-on-surface">{t.description}</p>
                     <p className="text-[10px] text-on-surface-muted italic mt-0.5">{t.date}</p>
                   </div>
                 </div>
                 <span className={cn("text-sm font-bold tracking-tight", t.type === 'income' ? "text-primary" : "text-on-surface-muted")}>
                   {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                 </span>
               </div>
             ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-bold tracking-[0.2em] text-on-surface-muted uppercase">توزيع الأصول الاستراتيجية</h3>
             <span className="text-[10px] text-on-surface-muted font-light italic tracking-wide">إجمالي 4 فئات أساسية</span>
          </div>
          <div className="bg-sidebar border border-on-surface/5 rounded-[40px] p-10 flex-1 flex flex-col justify-center gap-10 backdrop-blur-xl shadow-inner transition-colors">
             {[
               { label: 'الإنتاج', val: 65, color: 'bg-primary' },
               { label: 'المخزون', val: 20, color: 'bg-primary/60' },
               { label: 'الاحتياطي', val: 15, color: 'bg-on-surface/20' }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-6">
                 <div className="flex-1 h-1.5 bg-on-surface/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.val}%` }}
                     transition={{ duration: 1.5, delay: i * 0.2 }}
                     className={cn("h-full rounded-full shadow-[0_0_10px_rgba(197,160,89,0.2)]", item.color)} 
                   />
                 </div>
                 <span className="text-[10px] font-bold tracking-widest text-on-surface-muted w-24 text-left uppercase">{item.label} {item.val}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Finance = ({ stats, transactions, categories, onAdd, onAddCategory, contacts, onPay }: any) => {
  const [tab, setTab] = React.useState<'income' | 'expense'>('income');
  const [paymentType, setPaymentType] = React.useState<'regular' | 'supplier'>('regular');
  const [amount, setAmount] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const [showAddCategory, setShowAddCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const filteredTransactions = transactions.filter((t: any) => t.type === tab);
  const filteredCategories = categories.filter((c: any) => c.type === tab);
  const totalAmount = filteredTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    if (tab === 'expense' && paymentType === 'supplier') {
      if (!selectedSupplierId) return;
      onPay(selectedSupplierId, parseFloat(amount), true);
    } else {
      if (!selectedCategory) return;
      onAdd({
        description: selectedCategory,
        amount: parseFloat(amount),
        type: tab,
        category: tab === 'income' ? 'sales' : 'expense'
      });
    }

    setAmount('');
    setSelectedCategory('');
    setSelectedSupplierId('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    onAddCategory(newCategoryName, tab);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border-subtle pb-6 sm:pb-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tighter mb-2 sm:mb-4">الإدارة <span className="text-primary italic">المالية</span></h1>
          <p className="text-on-surface-muted text-xs sm:text-sm font-medium opacity-60 italic tracking-wide">التحكم والتدقيق المتكامل في كافة التدفقات النقدية</p>
        </div>
        <div className="flex flex-col items-end bg-surface-card border border-border-subtle px-6 sm:px-10 py-5 sm:py-6 rounded-[28px] sm:rounded-[32px] shadow-lux relative overflow-hidden w-full sm:min-w-[320px] sm:w-auto">
          <div className="absolute top-0 right-0 w-1 h-full bg-primary opacity-20"></div>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.25em] font-black text-on-surface-muted mb-2 sm:mb-3 opacity-60">صافي التدفق المالي</span>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className={cn("text-2xl sm:text-4xl font-black tabular-nums tracking-tighter", stats.dailyIncome - stats.dailyExpense >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(stats.dailyIncome - stats.dailyExpense)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
          <div className="flex bg-on-surface/[0.03] p-1.5 rounded-2xl border border-on-surface/5 backdrop-blur-md">
            <button 
              onClick={() => { setTab('income'); setSelectedCategory(''); setPaymentType('regular'); }} 
              className={cn(
                "flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-[14px] transition-all duration-300", 
                tab === 'income' ? "bg-primary text-black shadow-lg" : "text-on-surface-muted hover:text-on-surface"
              )}
            >
              الإيرادات
            </button>
            <button 
              onClick={() => { setTab('expense'); setSelectedCategory(''); setPaymentType('regular'); }} 
              className={cn(
                "flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-[14px] transition-all duration-300", 
                tab === 'expense' ? "bg-red-500 text-white shadow-lg" : "text-on-surface-muted hover:text-on-surface"
              )}
            >
              المصروفات
            </button>
          </div>
          {tab === 'expense' && (
            <div className="flex bg-on-surface/[0.02] p-1 rounded-xl border border-on-surface/5 mx-2">
              <button 
                type="button"
                onClick={() => setPaymentType('regular')} 
                className={cn("flex-1 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300", paymentType === 'regular' ? "bg-on-surface/10 text-on-surface shadow-sm" : "text-on-surface-muted hover:text-on-surface")}
              >
                مصروفات عامة
              </button>
              <button 
                type="button"
                onClick={() => setPaymentType('supplier')} 
                className={cn("flex-1 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300", paymentType === 'supplier' ? "bg-on-surface/10 text-on-surface shadow-sm" : "text-on-surface-muted hover:text-on-surface")}
              >
                سداد مورد
              </button>
            </div>
          )}
          <div className="bg-surface-card p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-border-subtle shadow-lux flex flex-col gap-6 sm:gap-10 relative overflow-hidden group">
            <div className={cn("absolute top-0 left-0 w-full h-1", tab === 'income' ? 'bg-primary' : 'bg-red-500')}></div>
            <h3 className="text-xs sm:text-sm font-black tracking-[0.25em] text-on-surface uppercase flex items-center gap-4 border-b border-on-surface/5 pb-6 sm:pb-8">
              <div className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:rotate-6", tab === 'income' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500")}>
                {tab === 'income' ? <PlusCircle size={20} className="sm:w-6 sm:h-6" /> : <TrendingDown size={20} className="sm:w-6 sm:h-6" />}
              </div>
              <span className="line-clamp-1">{tab === 'expense' && paymentType === 'supplier' ? 'سداد حساب مورد' : `تسجيل ${tab === 'income' ? 'إيراد' : 'مصروف'} جديد`}</span>
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
               <div className="space-y-6">
                {tab === 'expense' && paymentType === 'supplier' ? (
                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-widest font-black text-on-surface-muted px-2">اختر المورد المستهدف</label>
                    <div className="relative group">
                       <select 
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full bg-on-surface/[0.03] border border-on-surface/5 rounded-3xl px-8 py-5 outline-none font-black text-on-surface transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary/40 appearance-none shadow-sm"
                      >
                        <option value="" className="bg-sidebar">اختر المورد من القائمة...</option>
                        {contacts.filter((c: any) => c.type === 'supplier').map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-sidebar">{s.name} (المستحق: {formatCurrency(s.balance)})</option>
                        ))}
                      </select>
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-on-surface-muted px-2">نوع التصنيف المالي</label>
                    {!selectedCategory ? (
                      <button 
                        type="button"
                        onClick={() => setShowCategoryPicker(true)}
                        className="w-full bg-on-surface/[0.02] border-2 border-dashed border-on-surface/10 rounded-[32px] px-6 py-12 flex flex-col items-center gap-5 text-on-surface-muted hover:text-primary hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-on-surface/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <LayoutGrid size={24} strokeWidth={1.5} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-[0.2em]">تحديد صنف القيد</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-5 p-6 bg-on-surface/[0.03] rounded-[32px] border border-on-surface/10 shadow-sm transition-all hover:border-primary/20 group">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6", tab === 'income' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500")}>
                          <LayoutGrid size={28} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-on-surface-muted font-black uppercase tracking-widest opacity-60">تم اختيار</p>
                          <h4 className="font-black text-on-surface text-2xl tracking-tight leading-none mt-1">{selectedCategory}</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedCategory('')}
                          className="w-12 h-12 rounded-2xl bg-on-surface/5 flex items-center justify-center text-on-surface-muted hover:text-red-500 hover:bg-red-500/10 transition-all shadow-sm"
                        >
                          <XCircle size={22} />
                        </button>
                      </div>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors px-4 py-2 bg-primary/5 rounded-full w-fit mx-auto border border-primary/10 shadow-sm"
                    >
                      <Plus size={16} strokeWidth={3} />
                      إضافة تصنيف جديد
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-black text-on-surface-muted px-2">القيمة الإجمالية</label>
                <div className="relative group">
                  <NumericInput 
                    value={amount}
                    onChange={(val: string) => setAmount(val)}
                    className="w-full bg-on-surface/[0.03] border border-on-surface/5 rounded-[32px] pr-8 pl-24 py-6 outline-none font-black text-on-surface transition-all text-right text-3xl focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:opacity-10" 
                    placeholder="00.00" 
                  />
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-black tracking-[0.2em] text-primary uppercase bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-sm">SAR</span>
                </div>
              </div>
              <button 
                type="submit" 
                className={cn(
                  "w-full rounded-[32px] py-7 font-black uppercase tracking-[0.3em] text-sm shadow-lux transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-4", 
                  tab === 'income' ? "bg-primary text-black shadow-primary/20 hover:bg-primary/95" : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
                )}
              >
                {tab === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                تأكيد العملية المالية
              </button>
            </form>
          </div>
        </div>

        {/* Categories Picker Modal */}
        <AnimatePresence>
          {showCategoryPicker && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-sidebar w-full max-w-2xl rounded-[40px] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl maxHeight-[80vh]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">اختر صنف {tab === 'income' ? 'الإيراد' : 'المصروف'}</h3>
                    <p className="text-white/30 text-sm italic">حدد الصنف لتسجيل العملية المالية</p>
                  </div>
                  <button onClick={() => setShowCategoryPicker(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setShowCategoryPicker(false);
                      }}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 text-right hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h4>
                      <p className="text-[10px] text-white/20 mt-1 uppercase font-black uppercase tracking-tighter">تصنيف معتمد</p>
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setShowCategoryPicker(false);
                      setShowAddCategory(true);
                    }}
                    className="p-6 rounded-3xl border border-dashed border-on-surface/20 flex items-center justify-center gap-3 text-on-surface-muted/30 hover:text-primary hover:border-primary/40 transition-all"
                  >
                    <Plus size={20} />
                    <span className="font-bold">إضافة صنف جديد</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Category Modal */}
        <AnimatePresence>
          {showAddCategory && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-sidebar w-full max-w-sm rounded-[40px] border border-border-subtle p-10 flex flex-col gap-8 shadow-2xl"
              >
                <div className="flex flex-col gap-2 text-center">
                  <h3 className="text-xl font-bold text-on-surface">إضافة صنف جديد</h3>
                  <p className="text-on-surface-muted/30 text-xs italic">سيتم حفظ الصنف بشكل دائم في قاعدة البيانات</p>
                </div>
                
                <form onSubmit={handleAddCategory} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-black text-on-surface-muted/30 px-2 text-right">اسم الصنف</label>
                    <input 
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-on-surface/5 border border-border-subtle rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-on-surface text-right"
                      placeholder="مثلاً: صيانة المولد"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddCategory(false)}
                      className="py-4 bg-on-surface/5 text-on-surface font-bold rounded-2xl hover:bg-on-surface/10 transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      className="py-4 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all"
                    >
                      حفظ الصنف
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-sidebar border border-border-subtle rounded-[40px] shadow-2xl overflow-hidden flex-1 flex flex-col">
            <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-on-surface/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black tracking-[0.2em] text-on-surface/80 uppercase leading-none">
                  {tab === 'income' ? 'سجل الإيرادات الحالية' : 'سجل المصروفات الحالية'}
                </h3>
                <p className="text-[10px] text-on-surface-muted/40 italic font-medium">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right border-collapse">
                <thead className="bg-on-surface/5 text-on-surface-muted text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-6 px-10">التفاصيل</th>
                    <th className="py-6 px-10 text-left">المبلغ المالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface/5">
                  {transactions.filter((t: any) => t.type === tab).slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-on-surface/[0.02] transition-colors group">
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-1.5 h-1.5 rounded-full", row.type === 'income' ? "bg-primary" : "bg-red-500")} />
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{row.description}</span>
                        </div>
                      </td>
                      <td className={cn("py-6 px-10 text-left font-black tracking-tight", row.type === 'income' ? "text-primary" : "text-on-surface-muted")}>
                        {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 border-t border-border-subtle bg-on-surface/[0.02] flex justify-between items-center mt-auto">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-muted">
                إجمالي {tab === 'income' ? 'الإيرادات' : 'المصروفات'}
              </span>
              <span className={cn("text-2xl font-black tracking-tight", tab === 'income' ? "text-primary" : "text-red-500")}>
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryManager = ({ categories, onUpdate, onDelete, contacts, onUpdateContact, onDeleteContact }: any) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editingType, setEditingType] = React.useState<'category' | 'contact'>('category');

  const handleStartEdit = (item: any, type: 'category' | 'contact') => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditingType(type);
  };

  const handleSave = async (id: string) => {
    if (!editName) return;
    if (editingType === 'category') {
      await onUpdate(id, editName);
    } else {
      await onUpdateContact(id, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 animate-in slide-in-from-right-8 duration-1000">
      <div className="flex flex-col gap-3 border-b border-border-subtle pb-6 sm:pb-10">
        <h2 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tighter">إدارة <span className="text-primary italic">الهياكل</span></h2>
        <p className="text-on-surface-muted text-xs sm:text-sm font-medium opacity-60 italic tracking-wide">تحرير وحذف التصنيفات، العملاء والموردين بشكل آمن</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Income Categories */}
        <div className="bg-surface-card border border-border-subtle rounded-[32px] sm:rounded-[44px] shadow-lux overflow-hidden flex flex-col group">
          <div className="p-6 sm:p-8 border-b border-border-subtle bg-primary/[0.03] flex justify-between items-center group-hover:bg-primary/[0.08] transition-colors">
            <h3 className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] text-primary uppercase">أصناف الإيرادات</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
              <TrendingUp size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
            {categories.filter((c: any) => c.type === 'income').map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-4 p-4 sm:p-5 rounded-[22px] sm:rounded-[28px] bg-on-surface/[0.02] border border-on-surface/5 group/item hover:bg-on-surface/[0.04] transition-all">
                <div className="flex-1">
                  {editingId === cat.id && editingType === 'category' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(cat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(cat.id)}
                      className="bg-on-surface/10 border border-primary/30 rounded-xl px-4 py-2 text-on-surface text-right w-full outline-none focus:ring-1 focus:ring-primary font-bold text-sm"
                    />
                  ) : (
                    <h4 className="font-bold text-on-surface text-right tracking-tight text-sm sm:text-base">{cat.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-item-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(cat, 'category')} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-surface-card border border-border-subtle rounded-[44px] shadow-lux overflow-hidden flex flex-col group">
          <div className="p-8 border-b border-border-subtle bg-red-500/[0.03] flex justify-between items-center group-hover:bg-red-500/[0.08] transition-colors">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-red-500 uppercase">أصناف المصروفات</h3>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:-rotate-12 transition-transform">
              <TrendingDown size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {categories.filter((c: any) => c.type === 'expense').map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-4 p-5 rounded-[28px] bg-on-surface/[0.02] border border-on-surface/5 group/item hover:bg-on-surface/[0.04] transition-all">
                <div className="flex-1">
                  {editingId === cat.id && editingType === 'category' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(cat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(cat.id)}
                      className="bg-on-surface/10 border border-red-500/30 rounded-xl px-4 py-2 text-on-surface text-right w-full outline-none focus:ring-1 focus:ring-red-500 font-bold"
                    />
                  ) : (
                    <h4 className="font-bold text-on-surface text-right tracking-tight">{cat.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-item-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(cat, 'category')} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-surface-card border border-border-subtle rounded-[44px] shadow-lux overflow-hidden flex flex-col group">
          <div className="p-8 border-b border-border-subtle bg-emerald-500/[0.03] flex justify-between items-center group-hover:bg-emerald-500/[0.08] transition-colors">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-emerald-500 uppercase">قائمة العملاء</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Users size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {contacts.filter((c: any) => c.type === 'customer').map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-4 p-5 rounded-[28px] bg-on-surface/[0.02] border border-on-surface/5 group/item hover:bg-on-surface/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs shadow-sm">
                  {contact.initial || contact.name[0]}
                </div>
                <div className="flex-1">
                  {editingId === contact.id && editingType === 'contact' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(contact.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(contact.id)}
                      className="bg-on-surface/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-on-surface text-right w-full outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  ) : (
                    <h4 className="font-bold text-on-surface text-right tracking-tight">{contact.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-item-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(contact, 'contact')} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteContact(contact.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers */}
        <div className="bg-surface-card border border-border-subtle rounded-[44px] shadow-lux overflow-hidden flex flex-col group">
          <div className="p-8 border-b border-border-subtle bg-blue-500/[0.03] flex justify-between items-center group-hover:bg-blue-500/[0.08] transition-colors">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">قائمة الموردين</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:-translate-y-1 transition-transform">
              <Truck size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {contacts.filter((c: any) => c.type === 'supplier').map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-4 p-5 rounded-[28px] bg-on-surface/[0.02] border border-on-surface/5 group/item hover:bg-on-surface/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs shadow-sm">
                  {contact.name[0]}
                </div>
                <div className="flex-1">
                  {editingId === contact.id && editingType === 'contact' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(contact.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(contact.id)}
                      className="bg-on-surface/10 border border-blue-500/30 rounded-xl px-4 py-2 text-on-surface text-right w-full outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  ) : (
                    <h4 className="font-bold text-on-surface text-right tracking-tight">{contact.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-item-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(contact, 'contact')} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteContact(contact.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Contacts = ({ contacts, onPay, onAdd, onDelete }: { 
  contacts: any[], 
  onPay: (id: string, amount: number, isSupplier: boolean, isDebtIncrease?: boolean) => void,
  onAdd: (contact: any) => void,
  onDelete: (id: string) => void
}) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [historyId, setHistoryId] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [paymentMode, setPaymentMode] = React.useState<'pay' | 'debt'>('pay');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newContact, setNewContact] = React.useState({ name: '', type: 'customer', debt: 0, balance: 0 });

  const handlePay = () => {
    if (!selectedId || !amount) return;
    const contact = contacts.find(c => c.id === selectedId);
    onPay(selectedId, parseFloat(amount), contact.type === 'supplier', paymentMode === 'debt');
    setSelectedId(null);
    setAmount('');
    setPaymentMode('pay');
  };

  const handleAdd = () => {
    if (!newContact.name) return;
    const initial = newContact.name[0];
    const colors = ['bg-primary', 'bg-emerald-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    onAdd({
      ...newContact,
      initial,
      color,
      date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
      debt: parseFloat(newContact.debt.toString()) || 0,
       balance: parseFloat(newContact.balance.toString()) || 0
    });
    
    setShowAddModal(false);
    setNewContact({ name: '', type: 'customer', debt: 0, balance: 0 });
  };

  const selectedForHistory = contacts.find(c => c.id === historyId);

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-left-8 duration-700">
      <AnimatePresence mode="wait">
        {!historyId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-light text-on-surface mb-1">إدارة <span className="font-medium text-primary">العلاقات الاستراتيجية</span></h1>
                <p className="text-on-surface-muted text-sm font-light italic">متابعة الأرصدة المتبادلة مع العملاء والموردين المعتمدين</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/10"
              >
                <PlusCircle size={18} />
                إضافة جهة اتصال
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-card rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-all"></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <span className="bg-red-500/10 dark:text-red-400 text-red-600 font-black text-[10px] px-5 py-2 rounded-full flex items-center gap-2 border border-red-500/20 uppercase tracking-widest">
                    <TrendingDown size={14} />
                    ديون مستحقة التحصيل
                  </span>
                  <div className="p-4 bg-on-surface/5 rounded-2xl text-primary/60 border border-border-subtle">
                    <Wallet size={26} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-on-surface-muted/40 text-[10px] uppercase tracking-widest font-black mb-2">إجمالي مستحقات السوق</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-on-surface tracking-tight">
                      {formatCurrency(contacts.filter(c => c.type === 'customer').reduce((acc, c) => acc + (c.debt || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all"></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <span className="bg-primary/10 text-primary font-black text-[10px] px-5 py-2 rounded-full flex items-center gap-2 border border-primary/20 uppercase tracking-widest">
                    <TrendingUp size={14} />
                    مديونيات الموردين
                  </span>
                  <div className="p-4 bg-on-surface/5 rounded-2xl text-primary border border-border-subtle">
                    <Fuel size={26} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-on-surface-muted/40 text-[10px] uppercase tracking-widest font-black mb-2">إجمالي الالتزامات المالية</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary tracking-tight">
                      {formatCurrency(contacts.filter(c => c.type === 'supplier').reduce((acc, c) => acc + (c.balance || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-sidebar border border-border-subtle rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-on-surface/[0.02]">
                  <h2 className="text-sm font-black tracking-[0.2em] text-on-surface/80 uppercase flex items-center gap-3 leading-none">
                    <Users size={20} className="text-primary" />
                    سجل أرصدة العملاء
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-on-surface/5 text-on-surface-muted text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="py-6 px-10">هوية العميل</th>
                        <th className="py-6 px-10">إجمالي الدين</th>
                        <th className="py-6 px-10 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-on-surface/5">
                      {contacts.filter(c => c.type === 'customer').map((c, i) => (
                        <tr key={i} className="hover:bg-on-surface/[0.02] transition-colors group">
                          <td className="py-6 px-10">
                            <button 
                              onClick={() => setHistoryId(c.id)}
                              className="flex items-center gap-4 text-right hover:text-primary transition-colors"
                            >
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm uppercase shadow-lg", c.color)}>
                                {c.initial}
                              </div>
                              <div className="flex flex-col">
                              <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{c.name}</span>
                              <span className="text-[9px] text-on-surface-muted uppercase tracking-widest font-black">عرض السجل</span>
                              </div>
                            </button>
                          </td>
                          <td className="py-6 px-10 font-black dark:text-red-400 text-red-600 tracking-tight">{formatCurrency(c.debt)}</td>
                          <td className="py-6 px-10 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {deleteConfirmId === c.id ? (
                                <div className="flex items-center gap-1 bg-red-500/10 rounded-xl p-1 border border-red-500/20">
                                  <button onClick={() => { onDelete(c.id); setDeleteConfirmId(null); }} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="تأكيد الحذف"><Check size={14} /></button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-on-surface/40 hover:text-on-surface rounded-lg transition-all" title="إلغاء"><X size={14} /></button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => { setSelectedId(c.id); setPaymentMode('pay'); }} className="p-3 text-on-surface/20 hover:text-emerald-500 transition-all rounded-xl hover:bg-on-surface/5" title="تحصيل مبلغ"><TrendingUp size={18} /></button>
                                  <button onClick={() => { setSelectedId(c.id); setPaymentMode('debt'); }} className="p-3 text-on-surface/20 hover:text-red-500 transition-all rounded-xl hover:bg-on-surface/5" title="تسجيل مديونية جديدة"><PlusCircle size={18} /></button>
                                  <button onClick={() => setDeleteConfirmId(c.id)} className="p-3 text-on-surface/20 hover:text-red-500 transition-all rounded-xl hover:bg-on-surface/5" title="حذف">
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-sidebar border border-border-subtle rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-on-surface/[0.02]">
                  <h2 className="text-sm font-black tracking-[0.2em] text-on-surface/80 uppercase flex items-center gap-3 leading-none">
                    <Beaker size={20} className="text-primary" />
                    حسابات كبار الموردين
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-on-surface/5 text-on-surface-muted text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="py-6 px-10">المؤسسة</th>
                        <th className="py-6 px-10">الرصيد المفتوح</th>
                        <th className="py-6 px-10 text-center">تحديث</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-on-surface/5">
                      {contacts.filter(c => c.type === 'supplier').map((s, i) => (
                        <tr key={i} className="hover:bg-on-surface/[0.02] transition-colors group">
                          <td className="py-6 px-10">
                            <button 
                              onClick={() => setHistoryId(s.id)}
                              className="flex flex-col text-right hover:text-primary transition-colors"
                            >
                              <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{s.name}</span>
                              <span className="text-[10px] text-on-surface-muted font-medium mt-1 uppercase tracking-widest">سجل العمليات ←</span>
                            </button>
                          </td>
                          <td className="py-6 px-10 font-black text-primary tracking-tight">{formatCurrency(s.balance || 0)}</td>
                          <td className="py-6 px-10 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {deleteConfirmId === s.id ? (
                                <div className="flex items-center gap-1 bg-red-500/10 rounded-xl p-1 border border-red-500/20">
                                  <button onClick={() => { onDelete(s.id); setDeleteConfirmId(null); }} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="تأكيد"><Check size={14} /></button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-on-surface/40 hover:text-on-surface rounded-lg transition-all" title="إلغاء"><X size={14} /></button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => { setSelectedId(s.id); setPaymentMode('pay'); }} className="bg-on-surface/5 text-on-surface/60 border border-border-subtle hover:bg-emerald-500 hover:text-black hover:border-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    تسجيل سداد
                                  </button>
                                  <button onClick={() => { setSelectedId(s.id); setPaymentMode('debt'); }} className="bg-on-surface/5 text-on-surface/60 border border-border-subtle hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    مديونية جديدة
                                  </button>
                                  <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 text-on-surface/20 hover:text-red-500 transition-all rounded-xl hover:bg-on-surface/5"><Trash2 size={16} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-10"
          >
            {(() => {
              const history = selectedForHistory?.history || [];
              const totalPaid = history.filter((h: any) => h.amount > 0).reduce((acc: number, h: any) => acc + h.amount, 0);
              const totalBorrowed = history.filter((h: any) => h.amount < 0).reduce((acc: number, h: any) => acc + Math.abs(h.amount), 0);
              
              if (!selectedForHistory) return null;

              return (
                <div className="bg-sidebar w-full rounded-[48px] border border-border-subtle overflow-hidden flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="p-10 border-b border-border-subtle bg-on-surface/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 text-right">
                       <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className={cn("w-24 h-24 rounded-[32px] flex items-center justify-center text-black font-black text-3xl shadow-2xl rotate-3 shrink-0", selectedForHistory.color || "bg-primary")}>
                             {selectedForHistory.initial || selectedForHistory.name[0]}
                          </div>
                          <div className="flex flex-col gap-2 min-w-0">
                             <div className="flex items-center gap-4">
                                <h3 className="text-4xl font-black text-on-surface tracking-tight uppercase truncate">{selectedForHistory.name}</h3>
                                <button 
                                  onClick={() => setHistoryId(null)} 
                                  className="px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 border border-border-subtle rounded-xl text-[10px] font-black text-on-surface uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                  <X size={14} />
                                  الرجوع للقائمة
                                </button>
                             </div>
                             <div className="flex flex-wrap items-center gap-6">
                                <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", selectedForHistory.type === 'customer' ? "bg-red-500/20 dark:text-red-400 text-red-600" : "bg-emerald-500/20 dark:text-emerald-400 text-emerald-600")}>
                                  {selectedForHistory.type === 'customer' ? 'عميل نشط' : 'مورد معتمد'}
                                </span>
                                <span className="text-[10px] text-on-surface-muted/40 font-black flex items-center gap-2">
                                  <Calendar size={12} />
                                  منذ: {selectedForHistory.date || 'غير متوفر'}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto p-6 md:p-0 bg-on-surface/5 md:bg-transparent rounded-3xl border border-border-subtle md:border-none">
                          <div className="flex flex-col md:items-end">
                            <span className="text-[10px] text-on-surface-muted/40 uppercase font-black tracking-widest">الرصيد النهائي (الصافي)</span>
                            <span className={cn("text-3xl md:text-5xl font-black tracking-tighter leading-none mt-1", selectedForHistory.type === 'customer' ? "dark:text-red-400 text-red-600" : "text-primary")}>
                               {formatCurrency(selectedForHistory.type === 'customer' ? selectedForHistory.debt : selectedForHistory.balance)}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-muted/30 italic md:mt-3">آخر تحديث: {history.length > 0 ? history[0].date : 'لا يوجد'}</span>
                       </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-8 bg-black/20 border-b border-white/5">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-2 text-right">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">إجمالي المبالغ المسددة</span>
                      <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-2 text-right">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">إجمالي الديون المسجلة</span>
                      <span className="text-2xl font-black text-red-400">{formatCurrency(totalBorrowed)}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-2 text-right">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">عدد العمليات الكلي</span>
                      <span className="text-2xl font-black text-white">{history.length}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-2 text-right">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">متوسط قيمة المعاملة</span>
                      <span className="text-2xl font-black text-primary truncate">{formatCurrency(history.length > 0 ? (totalPaid + totalBorrowed) / history.length : 0)}</span>
                    </div>
                  </div>

                  {/* History Timeline */}
                  <div className="p-10 space-y-8 text-right bg-white/[0.01]">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/40">سجل المعاملات التفصيلي الزمني</h4>
                      <div className="h-px flex-1 mx-8 bg-white/5"></div>
                    </div>

                    {history.length === 0 ? (
                      <div className="h-60 flex flex-col items-center justify-center text-white/20 gap-6 italic bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
                         <BarChart3 size={48} strokeWidth={1} />
                         <p className="font-medium text-sm">لا توجد سجلات عمليات موثقة لهذا الحساب حتى الآن</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                         {history.map((entry: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-white/[0.08] hover:border-white/10 transition-all relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all"></div>
                               <div className="flex items-center gap-8">
                                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", entry.amount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                     {entry.amount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                     <p className="text-white font-bold text-xl group-hover:text-primary transition-colors leading-tight">{entry.description}</p>
                                     <p className="text-[10px] text-white/30 flex items-center gap-2 font-black uppercase tracking-widest">
                                       <Calendar size={12} />
                                       بتاريخ: {entry.date}
                                     </p>
                                  </div>
                               </div>
                               <div className="flex flex-row-reverse md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-2">
                                  <div className={cn("text-3xl font-black tracking-tighter", entry.amount > 0 ? "text-emerald-400" : "text-red-400")}>
                                     {entry.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}
                                  </div>
                                  <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">الرصيد بعد العملية</span>
                                    <span className="text-xs text-white/60 font-black tracking-tight">{formatCurrency(entry.balance)}</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[80] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-md rounded-[40px] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">إضافة جهة اتصال جديدة</h3>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-muted/40 hover:text-on-surface">✕</button>
              </div>
              
              <div className="space-y-6">
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => setNewContact(prev => ({ ...prev, type: 'customer' }))} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", newContact.type === 'customer' ? "bg-primary text-black" : "text-on-surface-muted/40")}>عميل</button>
                  <button onClick={() => setNewContact(prev => ({ ...prev, type: 'supplier' }))} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", newContact.type === 'supplier' ? "bg-primary text-black" : "text-on-surface-muted/40")}>مورد</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-on-surface-muted/30 px-2 block">الاسم بالكامل</label>
                  <input 
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-on-surface/5 border border-border-subtle rounded-2xl px-6 py-4 text-on-surface text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="اسم الجهة..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-on-surface-muted/30 px-2 block">
                    {newContact.type === 'customer' ? 'رصيد المديونية الابتدائي' : 'المبلغ المستحق للمورد'}
                  </label>
                  <NumericInput 
                    value={newContact.type === 'customer' ? newContact.debt : newContact.balance}
                    onChange={(val: string) => setNewContact(prev => ({ ...prev, [newContact.type === 'customer' ? 'debt' : 'balance']: parseFloat(val) || 0 }))}
                    className="w-full bg-on-surface/5 border border-border-subtle rounded-2xl px-6 py-4 text-on-surface text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={!newContact.name}
                  className="w-full bg-primary text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl disabled:opacity-50"
                >
                  تأكيد الإضافة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {historyId && selectedForHistory && (() => {
          // This block is no longer needed as a modal, but keeping it for reference or cleanup if necessary.
          // The inline view is now handled in the main return.
          return null;
        })()}
      </AnimatePresence>


      {/* Payment Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-sm rounded-[32px] md:rounded-[40px] border border-border-subtle p-6 md:p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-on-surface text-center">
                {paymentMode === 'pay' ? 'تسجيل سداد مالي' : 'تسجيل مديونية جديدة'}
              </h3>
              <p className="text-on-surface-muted/40 text-xs md:text-sm text-center italic px-2">
                {paymentMode === 'pay' 
                  ? (contacts.find(c => c.id === selectedId)?.type === 'customer' ? 'تحصيل مبلغ من: ' : 'دفع مبلغ لـ: ') 
                  : 'زيادة رصيد مديونية: '}
                {contacts.find(c => c.id === selectedId)?.name}
              </p>
              <div className="space-y-4">
                <div className="flex bg-on-surface/5 p-1 rounded-xl border border-border-subtle">
                  <button onClick={() => setPaymentMode('pay')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", paymentMode === 'pay' ? "bg-primary text-black" : "text-on-surface-muted/40")}>سداد</button>
                  <button onClick={() => setPaymentMode('debt')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", paymentMode === 'debt' ? "bg-red-500/20 text-red-500 font-black" : "text-on-surface-muted/40")}>مديونية</button>
                </div>
                <NumericInput 
                  value={amount}
                  onChange={(val: string) => setAmount(val)}
                  className="w-full bg-on-surface/5 border border-border-subtle rounded-2xl px-6 py-4 text-on-surface text-center font-bold text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSelectedId(null)} className="py-4 bg-on-surface/5 text-on-surface font-bold rounded-2xl hover:bg-on-surface/10 border border-border-subtle transition-all">إلغاء</button>
                  <button onClick={handlePay} className="py-4 bg-primary text-black rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lux">تأكيد</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Inventory = ({ inventory, onUpdate, onAdd, onDelete }: any) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'restock' | 'withdraw'>('restock');
  const [amount, setAmount] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ name: '', quantity: 0, price: 0, unit: 'جوال', iconName: 'Package' });

  const handleUpdate = () => {
    if (!selectedId || !amount) return;
    
    if (mode === 'restock') {
      if (!price) return;
      onUpdate(selectedId, parseFloat(amount), parseFloat(price));
    } else {
      onUpdate(selectedId, -parseFloat(amount));
    }
    
    setSelectedId(null);
    setAmount('');
    setPrice('');
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    onAdd({
      ...newItem,
      status: newItem.quantity > 10 ? 'available' : newItem.quantity > 0 ? 'low' : 'out',
      quantity: parseFloat(newItem.quantity.toString()) || 0,
      price: parseFloat(newItem.price.toString()) || 0
    });
    setShowAddModal(false);
    setNewItem({ name: '', quantity: 0, price: 0, unit: 'جوال', iconName: 'Package' });
  };

  const selectedItemForDetails = inventory.find((i: any) => i.id === detailId);

  return (
    <div className="flex flex-col gap-12 animate-in zoom-in-95 duration-1000">
      <AnimatePresence mode="wait">
        {!detailId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-12"
          >
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border-subtle pb-10">
              <div>
                <h1 className="text-5xl font-black text-on-surface tracking-tighter mb-2">إدارة <span className="text-primary italic">المواد</span></h1>
                <p className="text-on-surface-muted text-sm font-medium opacity-60 italic tracking-wide">مراقبة دقيقة لمخزون المواد الخام والسلع الأساسية</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-black px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lux"
              >
                <PlusCircle size={18} strokeWidth={3} />
                إضافة مادة جديدة
              </button>
            </div>

      <div className="bg-surface-card border border-border-subtle rounded-[24px] sm:rounded-[40px] shadow-lux overflow-hidden flex flex-col">
        <div className="p-6 sm:p-10 border-b border-border-subtle flex justify-between items-center bg-on-surface/[0.02]">
          <h2 className="text-xs sm:text-sm font-black tracking-[0.25em] text-on-surface uppercase flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Package size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="line-clamp-1">سجل الجرد والمستودع المركزي</span>
          </h2>
          <div className="hidden sm:flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-on-surface/5 rounded-2xl border border-on-surface/5">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animat-pulse"></div>
                <span className="text-[10px] font-black uppercase text-on-surface-muted">مراقبة حية</span>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-on-surface/5 text-on-surface-muted text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="py-6 sm:py-8 px-6 sm:px-10">المادة الاستراتيجية</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 text-center">حالة التوفر</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10">الكمية المسجلة</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10">سعر الوحدة</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 text-center">الإدارة المالية / الحركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/[0.03]">
              {inventory.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-on-surface/[0.02] transition-colors group">
                  <td className="py-6 sm:py-8 px-6 sm:px-10">
                    <button 
                      onClick={() => setDetailId(item.id)}
                      className="flex items-center gap-4 sm:gap-6 text-right hover:text-primary transition-all group/btn"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[24px] bg-on-surface/5 flex items-center justify-center text-on-surface-muted group-hover:scale-110 group-hover/btn:bg-primary group-hover/btn:text-black transition-all border border-on-surface/5 shadow-sm">
                        <item.icon size={22} className="sm:w-7 sm:h-7" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span className="font-black text-on-surface text-lg sm:text-xl tracking-tight leading-none group-hover/btn:text-primary transition-colors">{item.name}</span>
                        <span className="text-[8px] sm:text-[10px] text-on-surface-muted uppercase font-black tracking-widest opacity-40 group-hover/btn:text-primary/60">تفاصيل الجرد ←</span>
                      </div>
                    </button>
                  </td>
                  <td className="py-6 sm:py-8 px-6 sm:px-10 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-6 sm:py-8 px-6 sm:px-10">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-on-surface text-xl sm:text-2xl tabular-nums tracking-tighter leading-none">{item.quantity}</span>
                      <span className="text-[8px] sm:text-[10px] text-on-surface-muted uppercase font-black tracking-widest opacity-40">{item.unit}</span>
                    </div>
                  </td>
                  <td className="py-6 sm:py-8 px-6 sm:px-10">
                     <span className="font-black text-on-surface-muted text-base sm:text-lg tabular-nums tracking-tight opacity-80">{formatCurrency(item.price)}</span>
                  </td>
                  <td className="py-6 sm:py-8 px-6 sm:px-10 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1 bg-red-500/10 rounded-2xl p-1.5 border border-red-500/20 shadow-sm animate-in zoom-in-95">
                          <button onClick={() => { onDelete(item.id); setDeleteConfirmId(null); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-lg transition-all active:scale-95"><Check size={14} strokeWidth={3} /></button>
                          <button onClick={() => setDeleteConfirmId(null)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-on-surface-muted hover:bg-on-surface/10 rounded-xl transition-all"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => { setSelectedId(item.id); setMode('restock'); }} 
                            className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            وارد
                          </button>
                          <button 
                            onClick={() => { setSelectedId(item.id); setMode('withdraw'); }} 
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            سحب
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)} 
                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-on-surface/5 text-on-surface-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl sm:rounded-2xl transition-all border border-on-surface/5"
                            title="حذف الصنف"
                          >
                            <Trash2 size={14} className="sm:w-4.5 sm:h-4.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 leading-none">
         <div className="bg-surface-card p-10 rounded-[40px] border border-border-subtle shadow-2xl flex flex-col gap-8">
            <h3 className="text-sm font-black tracking-[0.2em] text-on-surface/80 uppercase flex items-center gap-4 border-b border-border-subtle pb-8 mb-2">
              <BarChart3 size={20} className="text-primary" />
              تقرير الكفاءة الاستهلاكية
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-on-surface/5 p-6 rounded-3xl border border-border-subtle">
                <span className="text-on-surface-muted/40 text-xs font-bold leading-none">إجمالي قيمة الأصول المخزنة</span>
                <span className="text-xl font-black text-on-surface">{formatCurrency(inventory.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0))}</span>
              </div>
              <div className="flex justify-between items-center bg-on-surface/5 p-6 rounded-3xl border border-border-subtle">
                <span className="text-on-surface-muted/40 text-xs font-bold leading-none">معدل الدوران الأسبوعي</span>
                <span className="text-xl font-black text-emerald-500">+18.5%</span>
              </div>
            </div>
         </div>

         <div className="bg-primary text-black p-10 rounded-[40px] shadow-2xl flex items-center justify-between group overflow-hidden relative border border-black/5">
            <div className="absolute -left-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform -rotate-12">
              <Fuel size={240} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3 leading-none uppercase tracking-tighter">القدرة الإنتاجية الحالية</h3>
              <p className="text-black/60 text-sm leading-relaxed max-w-[220px] font-medium italic">
                بناءً على كمية الدقيق والوقود المتوفرة، يمكن تشغيل <span className="text-black font-black underline underline-offset-4 decoration-2">{Math.floor((inventory[0]?.quantity || 0) * 20)}</span> وحدة إنتاجية.
              </p>
            </div>
            <div className="bg-black/10 p-6 rounded-3xl backdrop-blur-md relative z-10 border border-black/5 flex flex-col items-center shadow-inner">
               <span className="text-5xl font-black tracking-tighter leading-none">{(inventory.filter((i:any) => i.status === 'available').length / (inventory.length || 1) * 100).toFixed(0)}%</span>
               <p className="text-[10px] uppercase font-black tracking-widest text-black/40 text-center mt-3">جاهزية التوريد</p>
            </div>
         </div>
      </div>

        </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-10"
          >
            {selectedItemForDetails && (
              <div className="bg-sidebar border border-border-subtle rounded-[48px] shadow-2xl overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="p-10 border-b border-border-subtle bg-on-surface/[0.02] relative overflow-hidden text-right">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-black shadow-2xl rotate-3 shrink-0 transition-transform hover:rotate-0">
                        {selectedItemForDetails.icon && <selectedItemForDetails.icon size={48} />}
                      </div>
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-4 justify-end">
                          <button 
                            onClick={() => setDetailId(null)} 
                            className="px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 border border-border-subtle rounded-xl text-[10px] font-black text-on-surface uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <X size={14} />
                            الرجوع للقائمة
                          </button>
                          <h3 className="text-4xl font-black text-on-surface tracking-tight uppercase truncate">{selectedItemForDetails.name}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 justify-end">
                          <span className="text-[10px] text-on-surface/30 font-black flex items-center gap-2 uppercase tracking-widest">
                            مادة خام استراتيجية
                            <Package size={12} />
                          </span>
                          <StatusBadge status={selectedItemForDetails.status} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-on-surface/30 uppercase font-black tracking-widest leading-none">القيمة الإجمالية للمخزون</span>
                      <span className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none mt-1">
                        {formatCurrency(selectedItemForDetails.quantity * selectedItemForDetails.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
                  <div className="flex flex-col gap-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="bg-on-surface/[0.02] border border-border-subtle p-8 rounded-[40px] flex flex-col gap-2 text-right">
                           <span className="text-[10px] text-on-surface/20 uppercase font-black tracking-widest">الرصيد المتوفر حالياً</span>
                           <div className="flex items-baseline justify-end gap-2">
                              <span className="text-xs text-on-surface/40 font-bold uppercase">{selectedItemForDetails.unit}</span>
                              <span className="text-4xl font-black text-on-surface leading-none">{selectedItemForDetails.quantity}</span>
                           </div>
                        </div>
                        <div className="bg-on-surface/[0.02] border border-border-subtle p-8 rounded-[40px] flex flex-col gap-2 text-right">
                           <span className="text-[10px] text-on-surface/20 uppercase font-black tracking-widest">متوسط تكلفة الوحدة</span>
                           <span className="text-3xl font-black text-primary leading-none tracking-tighter truncate">{formatCurrency(selectedItemForDetails.price)}</span>
                        </div>
                     </div>

                     <div className="bg-on-surface/[0.02] border border-border-subtle p-8 rounded-[40px] flex flex-col gap-6 text-right">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-black text-on-surface/60">{(Math.min(100, (selectedItemForDetails.quantity / 500) * 100)).toFixed(0)}%</span>
                           <span className="text-[10px] text-on-surface/20 uppercase font-black tracking-widest">مؤشر كفاءة المخزون</span>
                        </div>
                        <div className="h-4 w-full bg-on-surface/10 rounded-full overflow-hidden p-1 border border-border-subtle shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min(100, (selectedItemForDetails.quantity / 500) * 100)}%` }}
                             className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,255,255,0.1)]", (selectedItemForDetails.status === 'available' ? 'bg-emerald-500' : selectedItemForDetails.status === 'low' ? 'bg-amber-500' : 'bg-red-500'))} 
                           />
                        </div>
                        <p className="text-[10px] text-on-surface/20 font-bold text-center leading-relaxed italic uppercase tracking-wider">التقدير بناءً على معدلات السحب الشهري وطلبات الإنتاج المؤكدة</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button 
                          onClick={() => { setDetailId(null); setSelectedId(selectedItemForDetails.id); setMode('restock'); }}
                          className="py-6 bg-primary text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lux"
                        >
                           تحديث الوارد
                        </button>
                        <button 
                          onClick={() => { setDetailId(null); setSelectedId(selectedItemForDetails.id); setMode('withdraw'); }}
                          className="py-6 bg-red-500/10 text-red-500 border border-red-500/20 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                           سحب استهلاك
                        </button>
                     </div>
                  </div>

                  <div className="flex flex-col gap-6 text-right">
                    <div className="flex justify-between items-center px-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-on-surface/40 italic">سجل العمليات الأخير والموثق</h4>
                       <div className="h-px flex-1 mx-8 bg-on-surface/5"></div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto px-2 space-y-4 custom-scrollbar">
                       {selectedItemForDetails.history && selectedItemForDetails.history.length > 0 ? (
                         [...selectedItemForDetails.history].reverse().map((h: any, idx: number) => (
                           <div key={idx} className="bg-on-surface/[0.02] border border-border-subtle p-6 rounded-[32px] flex flex-row-reverse justify-between items-center hover:bg-on-surface/[0.04] transition-all group overflow-hidden relative">
                              <div className={cn("absolute right-0 top-0 w-1 h-full opacity-20", h.type === 'addition' ? "bg-emerald-500" : "bg-red-500")}></div>
                              <div className="flex flex-row-reverse items-center gap-6">
                                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg", h.type === 'addition' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                    {h.type === 'addition' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-on-surface font-black text-lg group-hover:text-primary transition-colors leading-none">{h.type === 'addition' ? 'توريد كمية' : 'سحب كمية'}</span>
                                    <span className="text-[10px] text-on-surface/30 font-black uppercase tracking-widest">{h.date}</span>
                                 </div>
                              </div>
                              <div className="text-left flex flex-col items-start gap-1">
                                 <span className={cn("text-2xl font-black tracking-tighter leading-none", h.type === 'addition' ? "text-emerald-500" : "text-red-500")}>
                                    {h.type === 'addition' ? '+' : '-'}{h.amount}
                                 </span>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="h-80 flex flex-col items-center justify-center text-on-surface/20 gap-6 italic bg-on-surface/[0.01] rounded-[48px] border border-dashed border-border-subtle">
                            <History size={48} strokeWidth={1} />
                            <p className="font-medium text-sm">لا توجد سجلات عمليات موثقة لهذا الصنف بعد</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
       <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[80] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-md rounded-[40px] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">إضافة صنف جديد للمخزون</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">اسم الصنف (دقيق، سكر..)</label>
                  <input 
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="مثال: دقيق فاخر..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">الكمية الابتدائية</label>
                    <NumericInput 
                      value={newItem.quantity}
                      onChange={(val: string) => setNewItem(prev => ({ ...prev, quantity: parseFloat(val) || 0 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">الوحدة (جوال، لتر..)</label>
                    <input 
                      value={newItem.unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="جوال"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">متوسط سعر التكلفة للوحدة</label>
                  <NumericInput 
                    value={newItem.price}
                    onChange={(val: string) => setNewItem(prev => ({ ...prev, price: parseFloat(val) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">أيقونة الصنف</label>
                  <select 
                    value={newItem.iconName}
                    onChange={(e) => setNewItem(prev => ({ ...prev, iconName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                  >
                    <option value="Wheat">دقيق / قمح</option>
                    <option value="Droplets">زيت / سائل</option>
                    <option value="Beaker">كيماويات / خميرة</option>
                    <option value="Fuel">طاقة / ديزل</option>
                    <option value="Package">عام / طرد</option>
                  </select>
                </div>

                <button 
                  onClick={handleAddItem}
                  disabled={!newItem.name}
                  className="w-full bg-primary text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl disabled:opacity-50"
                >
                  تأكيد الإضافة للمخزون
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Restock Modal */}
       <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-sm rounded-[40px] border border-white/10 p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center">
                {mode === 'restock' ? 'تحديث كمية التوريد' : 'سحب كمية للاستهلاك'}
              </h3>
              <div className="flex flex-col items-center gap-2">
                 <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2 text-2xl font-bold", mode === 'restock' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500")}>
                    {React.createElement(inventory.find((i: any) => i.id === selectedId)?.icon, { size: 32 })}
                 </div>
                 <p className="text-white/40 text-sm text-center italic leading-tight">
                   {mode === 'restock' ? 'إضافة كمية واردة لمادة:' : 'سحب كمية إنتاجية من مادة:'} 
                   <br/><span className="text-white font-bold text-lg not-italic">{inventory.find((i: any) => i.id === selectedId)?.name}</span>
                 </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">الكمية {mode === 'restock' ? 'المشتراة' : 'المسحوبة'}</label>
                  <NumericInput 
                    value={amount}
                    onChange={(val: string) => setAmount(val)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-black text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                {mode === 'restock' && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">إجمالي قيمة الشراء</label>
                    <div className="relative">
                      <NumericInput 
                        value={price}
                        onChange={(val: string) => setPrice(val)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-black text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="0.00"
                      />
                      <span className="absolute left-6 top-5 text-[10px] font-black text-primary">SDG</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button onClick={() => setSelectedId(null)} className="py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest">إلغاء</button>
                  <button 
                    onClick={handleUpdate} 
                    className={cn("py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest", mode === 'restock' ? "bg-primary text-black hover:bg-primary/90" : "bg-red-500 text-white hover:bg-red-600")}
                  >
                    تأكيد {mode === 'restock' ? 'التوريد' : 'السحب'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Login = () => {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bakery-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/2 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-sidebar/50 backdrop-blur-3xl border border-border-subtle rounded-[48px] p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-black font-black text-4xl mb-8 shadow-2xl shadow-primary/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
            L
          </div>
          <h1 className="text-4xl font-light text-on-surface mb-2 leading-tight">نظام <span className="font-bold text-primary">لوكسوريا</span></h1>
          <p className="text-on-surface-muted/30 text-sm font-light italic tracking-wide">الإدارة الذكية والمستدامة للمخابز الحديثة</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-on-surface text-bakery-surface py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-xl disabled:opacity-50 group overflow-hidden relative"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                دخول عبر حساب جوجل
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4 px-4 py-8">
            <div className="flex-1 h-px bg-on-surface/5"></div>
            <span className="text-[10px] text-on-surface-muted/20 uppercase font-black tracking-[0.2em]">التوثيق السحابي</span>
            <div className="flex-1 h-px bg-on-surface/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-on-surface/[0.02] border border-border-subtle rounded-3xl text-center">
                <p className="text-xl font-bold text-on-surface mb-1">100%</p>
                <p className="text-[8px] text-on-surface-muted/30 uppercase font-black tracking-widest">أمان البيانات</p>
             </div>
             <div className="p-6 bg-on-surface/[0.02] border border-border-subtle rounded-3xl text-center">
                <p className="text-xl font-bold text-on-surface mb-1">Live</p>
                <p className="text-[8px] text-on-surface-muted/30 uppercase font-black tracking-widest">مزامنة فورية</p>
             </div>
          </div>
        </div>
        
        <p className="mt-12 text-[10px] text-on-surface-muted/30 text-center font-light uppercase tracking-widest italic flex items-center justify-center gap-2">
          جميع الحقوق محفوظة © {new Date().getFullYear()} لوكسوريا سيستم
        </p>
      </motion.div>
    </div>
  );
};

export default function App() {

  const [user, setUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [view, setView] = React.useState<View>('dashboard');
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [financeCategories, setFinanceCategories] = React.useState<any[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);
      
      if (!u) {
        setLoadingData(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  React.useEffect(() => {
    if (!user) return;

    setLoadingData(true);
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setLoadingData(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

    const categoriesQuery = query(
      collection(db, 'financeCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      if (snapshot.empty) {
        const defaultCategories = [
          { name: 'مشتريات خامات', type: 'expense', userId: user.uid },
          { name: 'رواتب موظفين', type: 'expense', userId: user.uid },
          { name: 'كهرباء ومياه', type: 'expense', userId: user.uid },
          { name: 'صيانة ومعدات', type: 'expense', userId: user.uid },
          { name: 'مبيعات يومية', type: 'income', userId: user.uid },
        ];
        defaultCategories.forEach(c => addDoc(collection(db, 'financeCategories'), c));
      } else {
        setFinanceCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'financeCategories'));

    const contactsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', user.uid)
    );

    const unsubscribeContacts = onSnapshot(contactsQuery, (snapshot) => {
      if (snapshot.empty) {
        // Seed default contacts if empty
        const defaultContacts = [
          { name: 'أحمد محمد', date: '12 أكتوبر', debt: 15000, initial: 'أ', color: 'bg-primary', type: 'customer', history: [], userId: user.uid },
          { name: 'بقالة النور', date: '10 أكتوبر', debt: 22500, initial: 'ب', color: 'bg-primary/40', type: 'customer', history: [], userId: user.uid },
          { name: 'مطعم الأمل', date: '05 أكتوبر', debt: 7700, initial: 'م', color: 'bg-white/10', type: 'customer', history: [], userId: user.uid },
          { name: 'مطاحن الدقيق الوطنية', cat: 'دقيق ومخبوزات', balance: 85000, date: '01 أكتوبر', type: 'supplier', history: [], userId: user.uid },
          { name: 'شركة الوقود الحديثة', cat: 'غاز الديزل', balance: 32000, date: '28 سبتمبر', type: 'supplier', history: [], userId: user.uid },
        ];
        defaultContacts.forEach(c => addDoc(collection(db, 'contacts'), c));
      } else {
        setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'contacts'));

    const inventoryQuery = query(
      collection(db, 'inventory'),
      where('userId', '==', user.uid)
    );

    const unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
      if (snapshot.empty) {
        // Seed default inventory if empty
        const defaultInventory = [
          { name: 'دقيق ممتاز', quantity: 250, price: 125, unit: 'جوال', status: 'available', iconName: 'Wheat', category: 'raw', userId: user.uid },
          { name: 'خميرة فورية', quantity: 15, price: 450, unit: 'عبوة', status: 'low', iconName: 'Beaker', category: 'raw', userId: user.uid },
          { name: 'زيت طعام', quantity: 45, price: 850, unit: 'لتر', status: 'available', iconName: 'Droplets', category: 'raw', userId: user.uid },
          { name: 'ديزل مولد نماء', quantity: 8, price: 650, unit: 'جالون', status: 'low', iconName: 'Fuel', category: 'energy', userId: user.uid },
        ];
        defaultInventory.forEach(item => addDoc(collection(db, 'inventory'), item));
      } else {
        const iconMap: Record<string, any> = { Wheat, Beaker, Droplets, Fuel };
        setInventory(snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data, 
            icon: iconMap[data.iconName] || Package 
          };
        }));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    return () => {
      unsubscribeTransactions();
      unsubscribeContacts();
      unsubscribeInventory();
      unsubscribeCategories();
    };
  }, [user]);

  const addFinanceCategory = async (name: string, type: 'income' | 'expense') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'financeCategories'), {
        name,
        type,
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'financeCategories');
    }
  };

  const updateFinanceCategory = async (id: string, name: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'financeCategories', id), { name });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'financeCategories');
    }
  };

  const deleteFinanceCategory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'financeCategories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'financeCategories');
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'date' | 'timestamp'>) => {
    if (!user) return;
    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    try {
      await addDoc(collection(db, 'transactions'), {
        ...data,
        date,
        timestamp: Date.now(),
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const updateInventory = async (id: string, amount: number, cost?: number) => {
    if (!user) return;
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + amount);
    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    const historyEntry = {
      date,
      type: amount > 0 ? 'addition' : 'withdrawal',
      amount: Math.abs(amount),
      prevQty: item.quantity,
      newQty: newQty
    };

    const updates: any = {
      quantity: newQty,
      status: newQty > 10 ? 'available' : newQty > 0 ? 'low' : 'out',
      history: [...(item.history || []), historyEntry]
    };

    if (cost && amount > 0) {
      updates.price = cost / amount;
    }

    try {
      await updateDoc(doc(db, 'inventory', id), updates);
      
      if (cost && cost > 0) {
        addTransaction({ 
          description: `توريد مواد: ${item.name}`, 
          amount: cost, 
          type: 'expense', 
          category: 'inventory' 
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${id}`);
    }
  };

  const handlePayment = async (id: string, amount: number, isSupplier: boolean, isDebtIncrease: boolean = false) => {
    if (!user) return;
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    if (isSupplier) {
      const adjustment = isDebtIncrease ? amount : -amount;
      const description = isDebtIncrease ? 'توريد بضاعة بالدين' : 'دفع مبلغ للمورد';
      const newHistory = [...(contact.history || []), { date, description, amount: adjustment, balance: (contact.balance || 0) + adjustment }];
      try {
        await updateDoc(doc(db, 'contacts', id), {
          balance: Math.max(0, (contact.balance || 0) + adjustment),
          history: newHistory
        });
        if (!isDebtIncrease) {
          addTransaction({ description: `سداد مورد: ${contact.name}`, amount, type: 'expense', category: 'payment' });
        } else {
          // If it's a debt increase (receiving supplies without paying), it's conceptually an expense that will be paid later.
          // But usually, we only record cash transactions in the finance section. 
          // However, user specifically asked for "sync with expenses".
          addTransaction({ description: `زيادة مديونية مورد: ${contact.name}`, amount, type: 'expense', category: 'debt' });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
      }
    } else {
      const adjustment = isDebtIncrease ? amount : -amount;
      const description = isDebtIncrease ? 'تسجيل مديونية جديدة' : 'تحصيل مبلغ من العميل';
      const newHistory = [...(contact.history || []), { date, description, amount: adjustment, balance: (contact.debt || 0) + adjustment }];
      try {
        await updateDoc(doc(db, 'contacts', id), {
          debt: Math.max(0, (contact.debt || 0) + adjustment),
          history: newHistory
        });
        if (!isDebtIncrease) {
          addTransaction({ description: `تحصيل دين: ${contact.name}`, amount, type: 'income', category: 'debt' });
        } else {
          // New debt usually means a sale that wasn't paid for.
          addTransaction({ description: `تسجيل مديونية عميل: ${contact.name}`, amount, type: 'income', category: 'sale' });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
      }
    }
  };

  const addContact = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'contacts'), {
        ...data,
        userId: user.uid,
        history: []
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
    }
  };

  const updateContact = async (id: string, name: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'contacts', id), { name, initial: name[0] });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
    }
  };

  const addInventoryItem = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'inventory'), {
        ...data,
        userId: user.uid,
        history: []
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateDoc(doc(db, 'transactions', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  // --- Calculations ---
  const dailyIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const dailyExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalDebt = contacts.filter(c => c.type === 'customer').reduce((acc, c) => acc + (c.debt || 0), 0);
  const netValue = (dailyIncome - dailyExpense) + totalDebt;

  if (!authReady) {
    return (
      <div className="min-h-screen bg-bakery-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-bakery-surface text-right font-sans transition-colors duration-300" dir="rtl">
      <TopBar netValue={netValue} theme={theme} toggleTheme={toggleTheme} />
      <Sidebar activeView={view} setView={setView} user={user} theme={theme} toggleTheme={toggleTheme} />
      
      <div className="lg:pr-72 flex-1 flex flex-col">
        <main className="flex-1 p-6 lg:p-12 pb-24 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-[1600px] mx-auto"
            >
              {loadingData ? (
                <div className="h-[60vh] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                     <p className="text-white/20 text-xs font-black uppercase tracking-widest">جاري مزامنة البيانات السحابية...</p>
                  </div>
                </div>
              ) : (
                <>
                  {view === 'dashboard' && <Dashboard stats={{ netValue, dailyIncome, dailyExpense, totalDebt }} transactions={transactions} inventory={inventory} />}
                  {view === 'finance' && (
                    <Finance 
                      stats={{ dailyIncome, dailyExpense }} 
                      transactions={transactions} 
                      categories={financeCategories}
                      onAdd={addTransaction} 
                      onAddCategory={addFinanceCategory}
                      contacts={contacts}
                      onPay={handlePayment}
                    />
                  )}
                  {view === 'contacts' && <Contacts contacts={contacts} onPay={handlePayment} onAdd={addContact} onDelete={deleteContact} />}
                  {view === 'inventory' && <Inventory inventory={inventory} onUpdate={updateInventory} onAdd={addInventoryItem} onDelete={deleteInventoryItem} />}
                  {view === 'reports' && (
                    <Reports 
                      transactions={transactions} 
                      inventory={inventory} 
                      onEditTransaction={updateTransaction} 
                      onDeleteTransaction={deleteTransaction}
                    />
                  )}
                  {view === 'categories' && (
                    <CategoryManager 
                      categories={financeCategories}
                      onUpdate={updateFinanceCategory}
                      onDelete={deleteFinanceCategory}
                      contacts={contacts}
                      onUpdateContact={updateContact}
                      onDeleteContact={deleteContact}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav 
        className="lg:hidden fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 h-16 sm:h-20 bg-sidebar/90 backdrop-blur-3xl border border-border-subtle rounded-[24px] sm:rounded-[32px] flex items-center justify-around px-2 sm:px-4 z-[45] shadow-2xl safe-area-inset-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'finance', icon: Wallet },
          { id: 'inventory', icon: Package },
          { id: 'contacts', icon: Users },
          { id: 'reports', icon: BarChart3 },
          { id: 'categories', icon: Settings2 },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] sm:rounded-2xl flex items-center justify-center transition-all duration-300",
              view === item.id ? "bg-primary text-black scale-110 shadow-lg shadow-primary/20" : "text-on-surface-muted/40"
            )}
          >
            <item.icon size={18} className="sm:w-5 sm:h-5" />
          </button>
        ))}
      </nav>
    </div>
  );
}

const Reports = ({ transactions, inventory, onEditTransaction, onDeleteTransaction }: any) => {
  const [range, setRange] = React.useState<'day' | 'month' | 'custom' | 'all'>('all');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [editingTransaction, setEditingTransaction] = React.useState<any>(null);
  const [editForm, setEditForm] = React.useState({ description: '', amount: '' });
  
  const handleEditClick = (t: any) => {
    setEditingTransaction(t);
    setEditForm({ description: t.description, amount: t.amount.toString() });
  };

  const handleSaveEdit = async () => {
    if (editingTransaction) {
      await onEditTransaction(editingTransaction.id, {
        description: editForm.description,
        amount: parseFloat(editForm.amount)
      });
      setEditingTransaction(null);
    }
  };

  const filteredTransactions = transactions.filter((t: any) => {
    if (range === 'all') return true;
    
    // Use timestamp for reliable filtering if available
    const txDate = t.timestamp ? new Date(t.timestamp) : new Date();
    const now = new Date();
    
    if (range === 'day') {
      return txDate.toDateString() === now.toDateString();
    }
    
    if (range === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    
    if (range === 'custom') {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return txDate >= start && txDate <= end;
    }
    return true;
  });

  const getPreviousPeriodTotals = () => {
    const now = new Date();
    let prevTransactions = [];
    
    if (range === 'day') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      prevTransactions = transactions.filter((t: any) => {
        const txDate = t.timestamp ? new Date(t.timestamp) : new Date();
        return txDate.toDateString() === yesterday.toDateString();
      });
    } else if (range === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      prevTransactions = transactions.filter((t: any) => {
        const txDate = t.timestamp ? new Date(t.timestamp) : new Date();
        return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
      });
    }
    
    const prevIncome = prevTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
    const prevExpense = prevTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
    
    return { prevIncome, prevExpense };
  };

  const { prevIncome, prevExpense } = getPreviousPeriodTotals();
  const rangeIncome = filteredTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
  const rangeExpense = filteredTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
  
  const incomeChange = prevIncome > 0 ? ((rangeIncome - prevIncome) / prevIncome * 100).toFixed(1) : null;
  const expenseChange = prevExpense > 0 ? ((rangeExpense - prevExpense) / prevExpense * 100).toFixed(1) : null;
  
  const inventoryValue = inventory.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  
  const ranges = [
    { id: 'day', label: 'اليوم' },
    { id: 'month', label: 'الشهر' },
    { id: 'custom', label: 'فترة محددة' },
    { id: 'all', label: 'الكل' },
  ];

  return (
    <div className="flex flex-col gap-8 sm:gap-10 animate-in slide-in-from-right-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-subtle pb-6 sm:pb-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tighter mb-2 sm:mb-4">الذكاء <span className="font-medium text-primary italic">المحاسبي والتحليلي</span></h1>
          <p className="text-on-surface-muted text-xs sm:text-sm font-medium opacity-60 italic tracking-wide">تحليل أداء رأس المال وكفاءة التشغيل للدورة الحالية</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          {range === 'custom' && (
            <div className="flex items-center gap-2 bg-on-surface/5 p-1.5 rounded-2xl border border-border-subtle animate-in fade-in slide-in-from-top-2 w-full md:w-auto justify-center">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] text-on-surface outline-none border-none px-2 appearance-none"
              />
              <span className="text-on-surface-muted text-[10px]">إلى</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] text-on-surface outline-none border-none px-2 appearance-none"
              />
            </div>
          )}
          <div className="flex bg-on-surface/[0.03] p-1 rounded-2xl border border-on-surface/5 backdrop-blur-md w-full md:w-auto">
            {ranges.map((r) => (
              <button 
                key={r.id}
                onClick={() => setRange(r.id as any)}
                className={cn(
                  "flex-1 md:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                  range === r.id ? "bg-primary text-black shadow-lg" : "text-on-surface-muted hover:text-on-surface"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-surface-card p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-border-subtle shadow-lux flex flex-col justify-between group relative overflow-hidden min-h-[160px] sm:min-h-[200px]">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-black text-on-surface-muted/60 mb-4 sm:mb-6 leading-none">إجمالي الإيرادات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight tabular-nums leading-none">{formatCurrency(rangeIncome)}</span>
          </div>
          <div className="flex items-center gap-2 mt-6 text-emerald-500 text-[9px] sm:text-[10px] font-black">
            {incomeChange ? (
              <>
                <TrendingUp size={14} className={parseFloat(incomeChange) < 0 ? "rotate-180 text-red-400" : ""} />
                <span className={cn(parseFloat(incomeChange) < 0 ? "text-red-400" : "")}>{incomeChange}% عن الفترة السابقة</span>
              </>
            ) : (
              <span className="text-on-surface-muted opacity-40">لا توجد بيانات مقارنة</span>
            )}
          </div>
        </div>

        <div className="bg-surface-card p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-border-subtle shadow-lux flex flex-col justify-between group relative overflow-hidden min-h-[160px] sm:min-h-[200px]">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-black text-on-surface-muted/60 mb-4 sm:mb-6 leading-none">إجمالي المصروفات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight tabular-nums leading-none">{formatCurrency(rangeExpense)}</span>
          </div>
          <div className="flex items-center gap-2 mt-6 text-red-500 text-[9px] sm:text-[10px] font-black">
            {expenseChange ? (
              <>
                <TrendingDown size={14} className={parseFloat(expenseChange) < 0 ? "rotate-180 text-emerald-400" : ""} />
                <span className={cn(parseFloat(expenseChange) < 0 ? "text-emerald-400" : "")}>{expenseChange}% عن الفترة السابقة</span>
              </>
            ) : (
              <span className="text-on-surface-muted opacity-40">لا توجد بيانات مقارنة</span>
            )}
          </div>
          <div className="w-full bg-on-surface/5 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${rangeIncome > 0 ? Math.min((rangeExpense/rangeIncome)*100, 100) : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-sidebar p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-primary/20 shadow-lux flex flex-col justify-between group shadow-primary/5 min-h-[160px] sm:min-h-[200px]">
          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-black text-primary/60 mb-4 sm:mb-6 leading-none">صافي الربح / الفائدة</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight tabular-nums leading-none">{formatCurrency(rangeIncome - rangeExpense)}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-on-surface-muted/30 mt-6 italic font-medium">الأرباح التشغيلية المحققة بعد خصم التكاليف</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase">تفاصيل الإيرادات</h3>
            </div>
            <span className="text-xs font-bold text-primary">{formatCurrency(rangeIncome)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 bg-black/10">
                  <th className="py-5 px-8">التاريخ</th>
                  <th className="py-5 px-8 text-left">المبلغ</th>
                  <th className="py-5 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredTransactions.filter((t: any) => t.type === 'income').map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-primary transition-colors text-sm">{t.description}</span>
                        <span className="text-[10px] text-white/20 italic">{t.date}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-left font-black text-primary text-base">+{formatCurrency(t.amount)}</td>
                    <td className="py-5 px-4 text-center">
                       <button 
                        onClick={() => handleEditClick(t)}
                        className="p-2 text-white/20 hover:text-primary transition-colors"
                       >
                         <Edit size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-red-500/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase">تفاصيل المصروفات</h3>
            </div>
            <span className="text-xs font-bold text-red-400">{formatCurrency(rangeExpense)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 bg-black/10">
                  <th className="py-5 px-8">التاريخ</th>
                  <th className="py-5 px-8 text-left">المبلغ</th>
                  <th className="py-5 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredTransactions.filter((t: any) => t.type === 'expense').map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-red-400 transition-colors text-sm">{t.description}</span>
                        <span className="text-[10px] text-white/20 italic">{t.date}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-left font-black text-white/60 text-base">-{formatCurrency(t.amount)}</td>
                    <td className="py-5 px-4 text-center">
                       <button 
                        onClick={() => handleEditClick(t)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                       >
                         <Edit size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex items-center justify-between group">
            <div>
               <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-2">قيمة المواد المخزونة حالياً</p>
               <h3 className="text-3xl font-black text-white tracking-tight">{formatCurrency(inventoryValue)}</h3>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <Package size={32} />
            </div>
         </div>
         <div className="bg-primary p-10 rounded-[40px] shadow-2xl flex items-center justify-between group">
            <div>
               <p className="text-[10px] uppercase tracking-widest font-black text-black/40 mb-2">القيمة الإجمالية للمشروع</p>
               <h3 className="text-3xl font-black text-black tracking-tight">{formatCurrency(inventoryValue + rangeIncome - rangeExpense)}</h3>
            </div>
            <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center text-black group-hover:rotate-12 transition-transform">
               <BarChart3 size={32} />
            </div>
         </div>
      </div>

      <AnimatePresence>
        {editingTransaction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-sm rounded-[40px] border border-white/10 p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center">تعديل قيد مالي</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block text-right">الوصف</label>
                  <input 
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block text-right">المبلغ</label>
                  <NumericInput 
                    value={editForm.amount}
                    onChange={(val: string) => setEditForm(prev => ({ ...prev, amount: val }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button onClick={() => setEditingTransaction(null)} className="py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-sm uppercase tracking-widest">إلغاء</button>
                  <button onClick={handleSaveEdit} className="py-4 bg-primary text-black rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm uppercase tracking-widest">حفظ</button>
                </div>
                <button 
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا القيد؟')) {
                      onDeleteTransaction(editingTransaction.id);
                      setEditingTransaction(null);
                    }
                  }}
                  className="w-full py-3 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                >
                  حذف القيد نهائياً
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
