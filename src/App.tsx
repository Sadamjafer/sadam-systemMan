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
  Moon
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
    <aside className="hidden lg:flex flex-col h-screen w-72 fixed right-0 top-0 bg-sidebar border-l border-white/5 p-8 gap-2 z-40 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4 flex-row">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0 shadow-lg shadow-primary/20">
            L
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-on-surface leading-tight">لوكسوريا</h2>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface hover:bg-primary hover:text-black transition-all"
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-muted font-semibold mb-6 px-4">القائمة الرئيسية</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={cn(
                "flex items-center justify-start gap-4 px-4 py-1.5 transition-all duration-200 group relative w-full",
                activeView === item.id 
                  ? "text-primary" 
                  : "text-on-surface-muted hover:text-on-surface"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                activeView === item.id ? "bg-primary scale-125" : "bg-transparent group-hover:bg-on-surface/20"
              )} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-on-surface/5 rounded-2xl border border-on-surface/5 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{user.displayName}</p>
            <button 
              onClick={() => signOut(auth)}
              className="text-[10px] text-on-surface-muted hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <LogOut size={10} />
              تسجيل الخروج
            </button>
          </div>
        </div>
        <div className="p-6 bg-on-surface/5 rounded-3xl border border-on-surface/5 backdrop-blur-sm text-center">
          <p className="text-[10px] text-on-surface-muted mb-1 font-light italic">الحساب المربوط</p>
          <p className="text-[10px] mb-0 font-medium text-on-surface truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ netValue, theme, toggleTheme }: { netValue: number, theme: 'dark' | 'light', toggleTheme: () => void }) => {
  return (
    <header className="flex justify-between items-center w-full px-12 py-6 bg-bakery-surface sticky top-0 z-30 lg:pr-72 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="lg:hidden flex items-center gap-3">
           <h1 className="text-xl font-black text-primary">لوكسوريا</h1>
        </div>
        <div className="hidden lg:flex items-center bg-white/5 border border-white/5 rounded-full px-6 py-2.5 gap-3 text-on-surface-muted focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all backdrop-blur-md">
          <Search size={18} />
          <input type="text" placeholder="بحث عن سجل استثماري..." className="bg-transparent border-none outline-none text-sm w-64 text-right placeholder:text-white/20 text-on-surface" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="lg:hidden w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-on-surface-muted hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="lg:hidden w-12 h-12 rounded-full border border-red-500/10 bg-red-500/5 flex items-center justify-center text-red-500/50 hover:bg-red-500/10 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-muted mb-0.5">صافي القيمة</p>
          <p className="text-lg font-bold text-primary leading-none">{formatCurrency(netValue)}</p>
        </div>
        <div className="h-10 w-px bg-white/10"></div>
        <button className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-colors relative group">
          <Bell size={20} className="text-on-surface-muted group-hover:text-on-surface transition-colors" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-bakery-surface"></span>
        </button>
      </div>
    </header>
  );
};

const StatCard = ({ title, value, unit, trend, color, icon: Icon }: any) => {
  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-2xl border border-on-surface/5 relative overflow-hidden group hover:border-on-surface/10 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-primary group-hover:scale-110 transition-transform")}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
            trend > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-on-surface-muted text-[10px] uppercase tracking-widest font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-on-surface tracking-tight">{value}</span>
        <span className="text-xs text-on-surface-muted font-medium italic">{unit}</span>
      </div>
    </div>
  );
};

const InventoryRow = ({ item }: { item: InventoryItem }) => {
  return (
    <tr className="hover:bg-white/5 transition-colors border-b border-white/[0.03] grow">
      <td className="py-5 px-8 text-right">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary/70">
            <item.icon size={22} />
          </div>
          <span className="font-bold text-white tracking-tight">{item.name}</span>
        </div>
      </td>
      <td className="py-5 px-8 text-right">
        <span className="font-medium text-white/90">{item.quantity}</span>
        <span className="text-[10px] uppercase tracking-widest text-white/30 mr-2 font-bold">{item.unit}</span>
      </td>
      <td className="py-5 px-8 text-right font-black text-primary">
        {formatCurrency(item.price)}
      </td>
      <td className="py-5 px-8 text-right">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-5 px-8 text-center">
        <button className="p-2 text-white/30 hover:text-primary transition-colors">
          <MoreVertical size={20} />
        </button>
      </td>
    </tr>
  );
};

const StatusBadge = ({ status }: { status: InventoryItem['status'] }) => {
  const styles = {
    available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    low: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    out: "bg-red-500/10 text-red-400 border-red-500/20"
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
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-light text-on-surface mb-2">مرحباً، <span className="font-medium text-primary">مدير المخبز</span></h1>
          <p className="text-on-surface-muted text-sm font-light italic">آخر تحديث للبيانات الاستثمارية: {new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي القيمة الحالية" value={formatCurrency(stats.netValue)} trend={12} color="bg-primary" icon={Wallet} />
        <StatCard title="عائدات الجلسة" value={formatCurrency(stats.dailyIncome)} trend={5} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard title="التفقات الجارية" value={formatCurrency(stats.dailyExpense)} trend={-2} color="bg-red-500" icon={TrendingDown} />
        <StatCard title="الالتزامات الخارجية" value={formatCurrency(stats.totalDebt)} color="bg-primary" icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-sidebar rounded-[32px] p-8 shadow-2xl border border-on-surface/5 flex flex-col justify-between h-[380px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-on-surface/5 border border-on-surface/10 rounded-full text-[10px] text-on-surface-muted mb-6 inline-block italic tracking-wider">كفاءة الإنتاج</span>
              <h2 className="text-6xl font-light text-on-surface">+{((stats.dailyIncome / (stats.dailyExpense || 1)) * 10).toFixed(1)}%</h2>
              <p className="text-on-surface-muted text-sm mt-3 font-light">نسبة استرداد التكاليف للدورة الحالية</p>
            </div>
            <div className="flex gap-1.5 items-end h-24">
              {transactions.slice(0, 8).map((t: any, i: number) => (
                <div key={i} className={cn("w-1.5 rounded-full", t.type === 'income' ? 'bg-primary' : 'bg-on-surface/10')} style={{ height: `${Math.min(t.amount/1000, 100)}%` }}></div>
              ))}
            </div>
          </div>
          <div className="flex gap-16 border-t border-on-surface/5 pt-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-muted mb-2">إجمالي تحركات العملة</p>
              <p className="text-2xl font-medium text-on-surface">{transactions.length} قيود</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-muted mb-2">هامش الربح الفوري</p>
              <p className="text-2xl font-medium text-on-surface">{formatCurrency(stats.dailyIncome - stats.dailyExpense)}</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className={cn("rounded-[32px] p-8 flex flex-col justify-between shadow-2xl h-[380px] transition-all duration-500", lowStock.length > 0 ? "bg-red-500 text-white" : "bg-primary text-black")}>
             <div className="flex justify-between items-start">
                <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-md">
                   {lowStock.length > 0 ? <AlertTriangle size={24} /> : <Package size={24} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{lowStock.length > 0 ? 'تنبيه مخزون منخفض' : 'المخزون مستقر'}</span>
             </div>
             {lowStock.length > 0 ? (
               <div className="space-y-4">
                  {lowStock.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-black/10 pb-2">
                       <span className="font-bold">{item.name}</span>
                       <span className="text-xs font-black">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
               </div>
             ) : (
               <div>
                  <p className="opacity-60 text-[10px] mb-1 uppercase font-bold">الحالة العامة</p>
                  <p className="text-2xl font-bold tracking-tight">جميع الموارد ضمن الحدود الآمنة</p>
               </div>
             )}
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold mb-1">المواد المنخفضة</p>
                  <p className="text-4xl font-black">{lowStock.length}</p>
                </div>
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl">LOG</div>
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

const Finance = ({ stats, transactions, categories, onAdd, onAddCategory }: any) => {
  const [tab, setTab] = React.useState<'income' | 'expense'>('income');
  const [amount, setAmount] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const [showAddCategory, setShowAddCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const filteredTransactions = transactions.filter((t: any) => t.type === tab);
  const filteredCategories = categories.filter((c: any) => c.type === tab);
  const totalAmount = filteredTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;
    onAdd({
      description: selectedCategory,
      amount: parseFloat(amount),
      type: tab,
      category: tab === 'income' ? 'sales' : 'expense'
    });
    setAmount('');
    setSelectedCategory('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    onAddCategory(newCategoryName, tab);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-light text-on-surface mb-2">المالية والقيود <span className="font-medium">اليومية</span></h1>
          <p className="text-on-surface-muted text-sm font-light italic">إدارة الإيرادات والمصروفات للدورة الحالية</p>
        </div>
        <div className="flex flex-col items-end bg-primary text-black px-10 py-6 rounded-3xl shadow-2xl relative overflow-hidden min-w-[280px]">
          <span className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-2">صافي الربح الفعلي</span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-5xl font-black">{formatCurrency(stats.dailyIncome - stats.dailyExpense)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex bg-white/5 p-2 rounded-[24px] border border-white/5 backdrop-blur-md">
            <button onClick={() => { setTab('income'); setSelectedCategory(''); }} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all", tab === 'income' ? "bg-primary text-black" : "text-white/40")}>الإيرادات</button>
            <button onClick={() => { setTab('expense'); setSelectedCategory(''); }} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all", tab === 'expense' ? "bg-red-500 text-white" : "text-white/40")}>المصروفات</button>
          </div>
          <div className="bg-surface-card p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col gap-8">
            <h3 className="text-sm font-bold tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 border-b border-white/5 pb-6">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tab === 'income' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500")}>
                {tab === 'income' ? <PlusCircle size={20} /> : <TrendingDown size={20} />}
              </div>
              تسجيل {tab === 'income' ? 'إيراد' : 'مصروف'} جديد
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
               <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">التصنيف / الصنف</label>
                {!selectedCategory ? (
                  <button 
                    type="button"
                    onClick={() => setShowCategoryPicker(true)}
                    className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl px-6 py-5 flex flex-col items-center gap-3 text-white/40 hover:text-primary hover:border-primary/40 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LayoutGrid size={16} />
                    </div>
                    <span className="font-bold">اختر صنف {tab === 'income' ? 'الإيراد' : 'المصروف'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tab === 'income' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500")}>
                      <LayoutGrid size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-white/30 font-black uppercase">الصنف المختار</p>
                      <h4 className="font-bold text-white text-lg leading-tight">{selectedCategory}</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors px-2"
                >
                  <Plus size={14} />
                  إضافة صنف جديد
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">المبلغ المالي</label>
                <div className="relative">
                  <NumericInput 
                    value={amount}
                    onChange={(val: string) => setAmount(val)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-20 pr-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-white transition-all text-left placeholder:text-white/10" 
                    placeholder="00.00" 
                  />
                  <span className="absolute left-6 top-4.5 text-[10px] font-black tracking-widest text-primary uppercase">SDG</span>
                </div>
              </div>
              <button type="submit" className={cn("w-full rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-[0.98] mt-4", tab === 'income' ? "bg-primary text-black shadow-primary/20 hover:bg-primary/90" : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600")}>
                تأكيد القيد التشغيلي
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
                    className="p-6 rounded-3xl border border-dashed border-white/20 flex items-center justify-center gap-3 text-white/30 hover:text-primary hover:border-primary/40 transition-all"
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
                className="bg-sidebar w-full max-w-sm rounded-[40px] border border-white/10 p-10 flex flex-col gap-8 shadow-2xl"
              >
                <div className="flex flex-col gap-2 text-center">
                  <h3 className="text-xl font-bold text-white">إضافة صنف جديد</h3>
                  <p className="text-white/30 text-xs italic">سيتم حفظ الصنف بشكل دائم في قاعدة البيانات</p>
                </div>
                
                <form onSubmit={handleAddCategory} className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2 text-right">اسم الصنف</label>
                    <input 
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-white text-right"
                      placeholder="مثلاً: صيانة المولد"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddCategory(false)}
                      className="py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
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
          <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex-1 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase leading-none">
                  {tab === 'income' ? 'سجل الإيرادات الحالية' : 'سجل المصروفات الحالية'}
                </h3>
                <p className="text-[10px] text-white/20 italic font-medium">
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
                <tbody className="divide-y divide-white/[0.03]">
                  {transactions.filter((t: any) => t.type === tab).slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
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
            <div className="p-8 border-t border-white/5 bg-on-surface/[0.02] flex justify-between items-center mt-auto">
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">إدارة البيانات الأساسية</h2>
        <p className="text-white/40 font-medium italic">تحرير وحذف التصنيفات، العملاء والموردين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Categories */}
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
            <h3 className="text-sm font-black tracking-[0.2em] text-primary uppercase">أصناف الإيرادات</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {categories.filter((c: any) => c.type === 'income').map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1">
                  {editingId === cat.id && editingType === 'category' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(cat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(cat.id)}
                      className="bg-white/10 border border-primary/30 rounded-lg px-3 py-1 text-white text-right w-full outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <h4 className="font-bold text-white text-right">{cat.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEdit(cat, 'category')} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-red-500/5 flex justify-between items-center">
            <h3 className="text-sm font-black tracking-[0.2em] text-red-500 uppercase">أصناف المصروفات</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {categories.filter((c: any) => c.type === 'expense').map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <TrendingDown size={18} />
                </div>
                <div className="flex-1">
                  {editingId === cat.id && editingType === 'category' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(cat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(cat.id)}
                      className="bg-white/10 border border-red-500/30 rounded-lg px-3 py-1 text-white text-right w-full outline-none focus:ring-1 focus:ring-red-500"
                    />
                  ) : (
                    <h4 className="font-bold text-white text-right">{cat.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEdit(cat, 'category')} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-emerald-500/5 flex justify-between items-center">
            <h3 className="text-sm font-black tracking-[0.2em] text-emerald-500 uppercase">العملاء</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {contacts.filter((c: any) => c.type === 'customer').map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                  {contact.initial}
                </div>
                <div className="flex-1">
                  {editingId === contact.id && editingType === 'contact' ? (
                    <input 
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSave(contact.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(contact.id)}
                      className="bg-white/10 border border-emerald-500/30 rounded-lg px-3 py-1 text-white text-right w-full outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : (
                    <h4 className="font-bold text-white text-right">{contact.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEdit(contact, 'contact')} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteContact(contact.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers */}
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-blue-500/5 flex justify-between items-center">
            <h3 className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase">الموردون</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {contacts.filter((c: any) => c.type === 'supplier').map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
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
                      className="bg-white/10 border border-blue-500/30 rounded-lg px-3 py-1 text-white text-right w-full outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <h4 className="font-bold text-white text-right">{contact.name}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEdit(contact, 'contact')} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteContact(contact.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
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
            <span className="bg-red-500/10 text-red-400 font-black text-[10px] px-5 py-2 rounded-full flex items-center gap-2 border border-red-500/20 uppercase tracking-widest">
              <TrendingDown size={14} />
              ديون مستحقة التحصيل
            </span>
            <div className="p-4 bg-white/5 rounded-2xl text-primary/60 border border-white/5">
              <Wallet size={26} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mb-2">إجمالي مستحقات السوق</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight">
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
            <div className="p-4 bg-white/5 rounded-2xl text-primary border border-white/5">
              <Fuel size={26} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mb-2">إجمالي الالتزامات المالية</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary tracking-tight">
                {formatCurrency(contacts.filter(c => c.type === 'supplier').reduce((acc, c) => acc + (c.balance || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 leading-none">
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
              <tbody className="divide-y divide-white/[0.03]">
                {contacts.filter(c => c.type === 'customer').map((c, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
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
                    <td className="py-6 px-10 font-black text-red-400 tracking-tight">{formatCurrency(c.debt)}</td>
                    <td className="py-6 px-10 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {deleteConfirmId === c.id ? (
                          <div className="flex items-center gap-1 bg-red-500/10 rounded-xl p-1 border border-red-500/20">
                            <button onClick={() => { onDelete(c.id); setDeleteConfirmId(null); }} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="تأكيد الحذف"><Check size={14} /></button>
                            <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-white/40 hover:text-white rounded-lg transition-all" title="إلغاء"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setSelectedId(c.id); setPaymentMode('pay'); }} className="p-3 text-white/20 hover:text-emerald-500 transition-all rounded-xl hover:bg-white/5" title="تحصيل مبلغ"><TrendingUp size={18} /></button>
                            <button onClick={() => { setSelectedId(c.id); setPaymentMode('debt'); }} className="p-3 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5" title="تسجيل مديونية جديدة"><PlusCircle size={18} /></button>
                            <button onClick={() => setDeleteConfirmId(c.id)} className="p-3 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5" title="حذف">
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

        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 leading-none">
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
              <tbody className="divide-y divide-white/[0.03]">
                {contacts.filter(c => c.type === 'supplier').map((s, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
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
                            <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-white/40 hover:text-white rounded-lg transition-all" title="إلغاء"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setSelectedId(s.id); setPaymentMode('pay'); }} className="bg-white/5 text-white/60 border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                              تسجيل سداد
                            </button>
                            <button onClick={() => { setSelectedId(s.id); setPaymentMode('debt'); }} className="bg-white/5 text-white/60 border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                              مديونية جديدة
                            </button>
                            <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5"><Trash2 size={16} /></button>
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
                <h3 className="text-xl font-bold text-white">إضافة جهة اتصال جديدة</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-6">
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => setNewContact(prev => ({ ...prev, type: 'customer' }))} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", newContact.type === 'customer' ? "bg-primary text-black" : "text-white/40")}>عميل</button>
                  <button onClick={() => setNewContact(prev => ({ ...prev, type: 'supplier' }))} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", newContact.type === 'supplier' ? "bg-primary text-black" : "text-white/40")}>مورد</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">الاسم بالكامل</label>
                  <input 
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="اسم الجهة..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">
                    {newContact.type === 'customer' ? 'رصيد المديونية الابتدائي' : 'المبلغ المستحق للمورد'}
                  </label>
                  <NumericInput 
                    value={newContact.type === 'customer' ? newContact.debt : newContact.balance}
                    onChange={(val: string) => setNewContact(prev => ({ ...prev, [newContact.type === 'customer' ? 'debt' : 'balance']: parseFloat(val) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
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

      {/* History Modal */}
      <AnimatePresence>
        {historyId && selectedForHistory && (() => {
          const history = selectedForHistory.history || [];
          const totalPaid = history.filter((h: any) => h.amount > 0).reduce((acc: number, h: any) => acc + h.amount, 0);
          const totalBorrowed = history.filter((h: any) => h.amount < 0).reduce((acc: number, h: any) => acc + Math.abs(h.amount), 0);
          
          return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[70] flex items-center justify-center p-2 sm:p-4 md:p-8">
               <motion.div 
                 initial={{ y: 50, opacity: 0, scale: 0.98 }}
                 animate={{ y: 0, opacity: 1, scale: 1 }}
                 exit={{ y: 50, opacity: 0, scale: 0.98 }}
                 className="bg-sidebar w-full max-w-4xl rounded-[32px] md:rounded-[48px] border border-white/10 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
               >
                  {/* Modal Header */}
                  <div className="p-6 md:p-10 border-b border-white/5 bg-white/[0.03] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 text-right">
                       <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                          <div className={cn("w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[32px] flex items-center justify-center text-black font-black text-xl md:text-3xl shadow-2xl rotate-3 shrink-0", selectedForHistory.color || "bg-primary")}>
                             {selectedForHistory.initial || selectedForHistory.name[0]}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                             <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase truncate">{selectedForHistory.name}</h3>
                             <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className={cn("px-2 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase tracking-widest", selectedForHistory.type === 'customer' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                                  {selectedForHistory.type === 'customer' ? 'عميل نشط' : 'مورد معتمد'}
                                </span>
                                <span className="text-[8px] md:text-[10px] text-white/20 font-black flex items-center gap-1">
                                  <Calendar size={10} />
                                  منذ: {selectedForHistory.date || 'غير متوفر'}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto p-4 md:p-0 bg-white/5 md:bg-transparent rounded-2xl border border-white/5 md:border-none">
                          <div className="flex flex-col md:items-end">
                            <span className="text-[9px] md:text-[10px] text-white/30 uppercase font-black tracking-widest hidden md:block">الرصيد النهائي</span>
                            <span className={cn("text-2xl md:text-4xl font-black tracking-tighter leading-none", selectedForHistory.type === 'customer' ? "text-red-400" : "text-primary")}>
                               {formatCurrency(selectedForHistory.type === 'customer' ? selectedForHistory.debt : selectedForHistory.balance)}
                            </span>
                          </div>
                          <span className="text-[8px] md:text-[10px] text-white/20 italic md:mt-2">آخر تحديث: {history.length > 0 ? history[0].date : 'لا يوجد'}</span>
                       </div>
                    </div>

                    <button 
                      onClick={() => setHistoryId(null)} 
                      className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-red-500/20 hover:text-red-500 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-white/40 transition-all group"
                    >
                       <X size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 p-4 md:p-8 bg-black/20 border-b border-white/5">
                    <div className="bg-white/[0.02] border border-white/5 p-3 md:p-5 rounded-2xl md:rounded-3xl flex flex-col gap-1 text-right">
                      <span className="text-[8px] md:text-[9px] text-white/30 uppercase font-black">إجمالي المسدد</span>
                      <span className="text-sm md:text-lg font-black text-emerald-400">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 md:p-5 rounded-2xl md:rounded-3xl flex flex-col gap-1 text-right">
                      <span className="text-[8px] md:text-[9px] text-white/30 uppercase font-black">إجمالي الدين</span>
                      <span className="text-sm md:text-lg font-black text-red-400">{formatCurrency(totalBorrowed)}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 md:p-5 rounded-2xl md:rounded-3xl flex flex-col gap-1 text-right">
                      <span className="text-[8px] md:text-[9px] text-white/30 uppercase font-black">عدد العمليات</span>
                      <span className="text-sm md:text-lg font-black text-white">{history.length}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 md:p-5 rounded-2xl md:rounded-3xl flex flex-col gap-1 text-right">
                      <span className="text-[8px] md:text-[9px] text-white/30 uppercase font-black">متوسط المعاملة</span>
                      <span className="text-sm md:text-lg font-black text-primary truncate">{formatCurrency(history.length > 0 ? (totalPaid + totalBorrowed) / history.length : 0)}</span>
                    </div>
                  </div>

                  {/* History Timeline */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 custom-scrollbar text-right">
                    <div className="flex justify-between items-center mb-2 md:mb-4">
                      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">سجل المعاملات التفصيلي</h4>
                      <div className="h-px flex-1 mx-4 md:mx-6 bg-white/5"></div>
                    </div>

                    {history.length === 0 ? (
                      <div className="h-40 md:h-60 flex flex-col items-center justify-center text-white/20 gap-4 italic bg-white/[0.02] rounded-3xl md:rounded-[40px] border border-dashed border-white/10">
                         <BarChart3 size={32} md:size={48} strokeWidth={1} />
                         <p className="font-medium text-xs md:text-sm">لا توجد سجلات عمليات موثقة لهذا الحساب</p>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                         {history.map((entry: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl md:rounded-[32px] p-5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 group hover:bg-white/[0.08] hover:border-white/10 transition-all relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all"></div>
                               <div className="flex items-center gap-4 md:gap-6">
                                  <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0", entry.amount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                     {entry.amount > 0 ? <TrendingUp size={16} md:size={20} /> : <TrendingDown size={16} md:size={20} />}
                                  </div>
                                  <div className="flex flex-col gap-0.5 md:gap-1">
                                     <p className="text-white font-bold text-sm md:text-lg group-hover:text-primary transition-colors leading-tight">{entry.description}</p>
                                     <p className="text-[8px] md:text-[10px] text-white/30 flex items-center gap-1.5">
                                       <Calendar size={10} />
                                       {entry.date}
                                     </p>
                                  </div>
                               </div>
                               <div className="flex flex-row-reverse md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-1">
                                  <div className={cn("text-lg md:text-2xl font-black tracking-tighter", entry.amount > 0 ? "text-emerald-400" : "text-red-400")}>
                                     {entry.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}
                                  </div>
                                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/5">
                                    <span className="text-[8px] md:text-[9px] text-white/20 font-black uppercase">الرصيد</span>
                                    <span className="text-[9px] md:text-[10px] text-white/60 font-bold tracking-tight">{formatCurrency(entry.balance)}</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 md:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-white/40 italic text-[10px] md:text-sm font-medium">
                      <CheckCircle2 size={14} md:size={16} className="text-emerald-500" />
                      البيانات موثقة ومؤمنة في النظام
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-white uppercase tracking-widest transition-all">تحميل</button>
                      <button onClick={() => setHistoryId(null)} className="flex-[2] sm:flex-none px-6 md:px-10 py-2.5 md:py-3 bg-primary text-black rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">إغلاق</button>
                    </div>
                  </div>
               </motion.div>
            </div>
          );
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
              className="bg-sidebar w-full max-w-sm rounded-[32px] md:rounded-[40px] border border-white/10 p-6 md:p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center">
                {paymentMode === 'pay' ? 'تسجيل سداد مالي' : 'تسجيل مديونية جديدة'}
              </h3>
              <p className="text-white/40 text-xs md:text-sm text-center italic px-2">
                {paymentMode === 'pay' 
                  ? (contacts.find(c => c.id === selectedId)?.type === 'customer' ? 'تحصيل مبلغ من: ' : 'دفع مبلغ لـ: ') 
                  : 'زيادة رصيد مديونية: '}
                {contacts.find(c => c.id === selectedId)?.name}
              </p>
              <div className="space-y-4">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button onClick={() => setPaymentMode('pay')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", paymentMode === 'pay' ? "bg-primary text-black" : "text-white/40")}>سداد</button>
                  <button onClick={() => setPaymentMode('debt')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", paymentMode === 'debt' ? "bg-red-500/20 text-red-500" : "text-white/40")}>مديونية</button>
                </div>
                <NumericInput 
                  value={amount}
                  onChange={(val: string) => setAmount(val)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-bold text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSelectedId(null)} className="py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">إلغاء</button>
                  <button onClick={handlePay} className="py-4 bg-primary text-black rounded-2xl font-bold hover:bg-primary/90 transition-all">تأكيد</button>
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
    <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-light text-on-surface mb-2">إدارة <span className="font-medium text-primary">المواد الخام الاستراتيجية</span></h1>
          <p className="text-on-surface-muted text-sm font-light italic">مراقبة مستويات الوقود والدقيق والسلع الأساسية في الوقت الفعلي</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/10"
        >
          <PlusCircle size={18} />
          إضافة صنف جديد
        </button>
      </div>

      <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 leading-none">
            <Package size={20} className="text-primary" />
            سجل الجرد والمستودعات المركزية
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-on-surface/5 text-on-surface-muted text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-6 px-10">المادة</th>
                <th className="py-6 px-10 text-center">المؤشر</th>
                <th className="py-6 px-10">الكمية المتوفرة</th>
                <th className="py-6 px-10">سعر الوحدة</th>
                <th className="py-6 px-10 text-center">تحديث / إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {inventory.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-6 px-10">
                    <button 
                      onClick={() => setDetailId(item.id)}
                      className="flex items-center gap-5 text-right hover:text-primary transition-all group/btn"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover/btn:bg-primary group-hover/btn:text-black transition-all border border-white/5">
                        <item.icon size={22} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface group-hover/btn:text-primary transition-colors">{item.name}</span>
                        <span className="text-[8px] text-on-surface-muted uppercase font-black group-hover/btn:text-on-surface">عرض البيانات التحليلية</span>
                      </div>
                    </button>
                  </td>
                  <td className="py-6 px-10 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-6 px-10">
                    <div className="flex flex-col">
                      <span className="font-black text-white tracking-tight">{item.quantity}</span>
                      <span className="text-[10px] text-white/20 uppercase font-black">{item.unit}</span>
                    </div>
                  </td>
                  <td className="py-6 px-10 font-bold text-white/60 text-sm italic">{formatCurrency(item.price)}</td>
                  <td className="py-6 px-10 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1 bg-red-500/10 rounded-xl p-1 border border-red-500/20">
                          <button onClick={() => { onDelete(item.id); setDeleteConfirmId(null); }} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Check size={14} /></button>
                          <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-white/40 hover:text-white rounded-lg transition-all"><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setSelectedId(item.id); setMode('restock'); }} 
                            className="bg-white/5 text-white/40 border border-white/10 hover:bg-primary hover:text-black hover:border-primary px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            تحديث الوارد
                          </button>
                          <button 
                            onClick={() => { setSelectedId(item.id); setMode('withdraw'); }} 
                            className="bg-white/5 text-white/40 border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            سحب استهلاك
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)} 
                            className="p-2 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5"
                            title="حذف"
                          >
                            ✕
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 leading-none">
         <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col gap-8">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-4 border-b border-white/5 pb-8 mb-2">
              <BarChart3 size={20} className="text-primary" />
              تقرير الكفاءة الاستهلاكية
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                <span className="text-white/40 text-xs font-bold leading-none">إجمالي قيمة الأصول المخزنة</span>
                <span className="text-xl font-black text-white">{formatCurrency(inventory.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0))}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                <span className="text-white/40 text-xs font-bold leading-none">معدل الدوران الأسبوعي</span>
                <span className="text-xl font-black text-emerald-400">+18.5%</span>
              </div>
            </div>
         </div>

         <div className="bg-primary text-black p-10 rounded-[40px] shadow-2xl flex items-center justify-between group overflow-hidden relative border border-white/10">
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

       {/* Item Details Modal */}
       <AnimatePresence>
         {selectedItemForDetails && (
           <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[80] flex items-center justify-center p-2 sm:p-4 md:p-8">
             <motion.div 
               initial={{ scale: 0.98, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.98, opacity: 0, y: 20 }}
               className="bg-sidebar w-full max-w-xl rounded-[32px] md:rounded-[48px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[95vh] md:max-h-[80vh]"
             >
                <div className="p-6 md:p-12 flex flex-col gap-8 md:gap-10 overflow-y-auto custom-scrollbar text-right">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-black">
                            {selectedItemForDetails.icon && <selectedItemForDetails.icon size={36} />}
                         </div>
                         <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-white leading-tight">{selectedItemForDetails.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                               <StatusBadge status={selectedItemForDetails.status} />
                               <span className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">مادة خام استراتيجية</span>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setDetailId(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all">✕</button>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col gap-2">
                         <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">الرصيد الحالي</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white leading-none">{selectedItemForDetails.quantity}</span>
                            <span className="text-xs text-white/40 font-bold uppercase">{selectedItemForDetails.unit}</span>
                         </div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col gap-2">
                         <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">متوسط التكلفة</span>
                         <span className="text-2xl font-black text-primary leading-none tracking-tighter">{formatCurrency(selectedItemForDetails.price)}</span>
                      </div>
                   </div>

                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">إجمالي قيمة الأصل</span>
                         <span className="text-2xl font-black text-white">{formatCurrency(selectedItemForDetails.quantity * selectedItemForDetails.price)}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${Math.min(100, (selectedItemForDetails.quantity / 500) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-white/20 font-bold text-center leading-none italic uppercase">مؤشر كفاءة المخزون بناءً على متوسط الاستهلاك الشهري</p>
                   </div>

                   <div className="flex flex-col gap-4">
                      <span className="text-[10px] text-white/20 uppercase font-black tracking-widest px-8">سجل العمليات الأخير</span>
                      <div className="max-h-[200px] overflow-y-auto px-4 space-y-3 custom-scrollbar">
                         {selectedItemForDetails.history && selectedItemForDetails.history.length > 0 ? (
                           [...selectedItemForDetails.history].reverse().map((h: any, idx: number) => (
                             <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                   <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", h.type === 'addition' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500")}>
                                      {h.type === 'addition' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[10px] text-on-surface font-bold">{h.type === 'addition' ? 'توريد كمية' : 'سحب كمية'}</span>
                                      <span className="text-[10px] text-on-surface-muted">{h.date}</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <span className={cn("text-xs font-black", h.type === 'addition' ? "text-primary" : "text-red-500")}>
                                      {h.type === 'addition' ? '+' : '-'}{h.amount} {selectedItemForDetails.unit}
                                   </span>
                                </div>
                             </div>
                           ))
                         ) : (
                           <p className="text-[10px] text-white/20 text-center py-8 italic">لا يوجد سجل عمليات لهذا الصنف بعد</p>
                         )}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setDetailId(null); setSelectedId(selectedItemForDetails.id); setMode('restock'); }}
                        className="py-5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                      >
                         تحديث الوارد
                      </button>
                      <button 
                        onClick={() => { setDetailId(null); setSelectedId(selectedItemForDetails.id); setMode('withdraw'); }}
                        className="py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
                      >
                         سحب استهلاك
                      </button>
                   </div>
                </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Add Item Modal */}
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
        className="w-full max-w-md bg-sidebar/50 backdrop-blur-3xl border border-white/5 rounded-[48px] p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-black font-black text-4xl mb-8 shadow-2xl shadow-primary/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
            L
          </div>
          <h1 className="text-4xl font-light text-white mb-2 leading-tight">نظام <span className="font-bold text-primary">لوكسوريا</span></h1>
          <p className="text-white/30 text-sm font-light italic tracking-wide">الإدارة الذكية والمستدامة للمخابز الحديثة</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/90 transition-all shadow-xl disabled:opacity-50 group overflow-hidden relative"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
          
          <div className="flex items-center gap-4 px-4 py-8">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] text-white/10 uppercase font-black tracking-[0.2em]">التوثيق السحابي</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                <p className="text-xl font-bold text-white mb-1">100%</p>
                <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">أمان البيانات</p>
             </div>
             <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                <p className="text-xl font-bold text-white mb-1">Live</p>
                <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">مزامنة فورية</p>
             </div>
          </div>
        </div>
        
        <p className="mt-12 text-[10px] text-white/20 text-center font-light uppercase tracking-widest italic flex items-center justify-center gap-2">
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
      <Sidebar activeView={view} setView={setView} user={user} theme={theme} toggleTheme={toggleTheme} />
      
      <div className="lg:pr-72 min-h-screen flex flex-col">
        <TopBar netValue={netValue} theme={theme} toggleTheme={toggleTheme} />
        
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
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-sidebar/80 backdrop-blur-2xl border border-white/5 rounded-[32px] flex items-center justify-around px-4 z-40 shadow-2xl">
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
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
              view === item.id ? "bg-primary text-black scale-110 shadow-lg shadow-primary/20" : "text-white/30"
            )}
          >
            <item.icon size={20} />
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
    <div className="flex flex-col gap-10 animate-in slide-in-from-right-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-1">الذكاء <span className="font-medium text-primary">المحاسبي والتحليلي</span></h1>
          <p className="text-white/40 text-sm font-light italic">تحليل أداء رأس المال وكفاءة التشغيل للدورة الحالية</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {range === 'custom' && (
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] text-white outline-none border-none px-2"
              />
              <span className="text-white/20 text-[10px]">إلى</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] text-white outline-none border-none px-2"
              />
            </div>
          )}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {ranges.map((r) => (
              <button 
                key={r.id}
                onClick={() => setRange(r.id as any)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  range === r.id ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-6">إجمالي الإيرادات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary tracking-tight">{formatCurrency(rangeIncome)}</span>
          </div>
          <div className="flex items-center gap-2 mt-6 text-emerald-400 text-[10px] font-bold">
            {incomeChange ? (
              <>
                <TrendingUp size={14} className={parseFloat(incomeChange) < 0 ? "rotate-180 text-red-400" : ""} />
                <span className={parseFloat(incomeChange) < 0 ? "text-red-400" : ""}>{incomeChange}% عن الفترة السابقة</span>
              </>
            ) : (
              <span className="text-white/20">لا توجد بيانات مقارنة</span>
            )}
          </div>
        </div>

        <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-6">إجمالي المصروفات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">{formatCurrency(rangeExpense)}</span>
          </div>
          <div className="flex items-center gap-2 mt-6 text-red-500 text-[10px] font-bold">
            {expenseChange ? (
              <>
                <TrendingDown size={14} className={parseFloat(expenseChange) < 0 ? "rotate-180 text-emerald-400" : ""} />
                <span className={parseFloat(expenseChange) < 0 ? "text-emerald-400" : ""}>{expenseChange}% عن الفترة السابقة</span>
              </>
            ) : (
              <span className="text-white/20 text-right w-full">لا توجد بيانات مقارنة</span>
            )}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-red-500 h-full rounded-full" style={{ width: `${rangeIncome > 0 ? Math.min((rangeExpense/rangeIncome)*100, 100) : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-sidebar p-10 rounded-[40px] border border-primary/20 shadow-2xl flex flex-col justify-between group shadow-primary/5">
          <p className="text-[10px] uppercase tracking-widest font-black text-primary/60 mb-6">صافي الربح / الفائدة</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">{formatCurrency(rangeIncome - rangeExpense)}</span>
          </div>
          <p className="text-[10px] text-white/20 mt-6 italic font-medium">الأرباح التشغيلية المحققة بعد خصم التكاليف</p>
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
