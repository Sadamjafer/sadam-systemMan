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
  X
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
type View = 'dashboard' | 'finance' | 'contacts' | 'inventory' | 'reports';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
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

const Sidebar = ({ activeView, setView, user }: { activeView: View, setView: (v: View) => void, user: User }) => {
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'finance', label: 'المالية', icon: Wallet },
    { id: 'contacts', label: 'جهات الاتصال', icon: Users },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-72 fixed right-0 top-0 bg-sidebar border-l border-white/5 p-8 gap-2 z-40">
      <div className="flex items-center gap-4 mb-12 flex-row">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0 shadow-lg shadow-primary/20">
          L
        </div>
        <div>
          <h2 className="text-xl font-medium tracking-tight text-white leading-tight">لوكسوريا</h2>
        </div>
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-6 px-4">القائمة الرئيسية</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={cn(
                "flex items-center justify-start gap-4 px-4 py-1.5 transition-all duration-200 group relative w-full",
                activeView === item.id 
                  ? "text-primary" 
                  : "text-white/50 hover:text-white"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                activeView === item.id ? "bg-primary scale-125" : "bg-transparent group-hover:bg-white/20"
              )} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
            <button 
              onClick={() => signOut(auth)}
              className="text-[10px] text-white/40 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <LogOut size={10} />
              تسجيل الخروج
            </button>
          </div>
        </div>
        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm text-center">
          <p className="text-[10px] text-white/40 mb-1 font-light italic">الحساب المربوط</p>
          <p className="text-[10px] mb-0 font-medium text-white/90 truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ netValue }: { netValue: number }) => {
  return (
    <header className="flex justify-between items-center w-full px-12 py-6 bg-bakery-surface sticky top-0 z-30 lg:pr-72">
      <div className="flex items-center gap-4">
        <div className="lg:hidden flex items-center gap-3">
           <Menu size={24} className="text-primary" />
           <h1 className="text-xl font-black text-primary">لوكسوريا</h1>
        </div>
        <div className="hidden lg:flex items-center bg-white/5 border border-white/5 rounded-full px-6 py-2.5 gap-3 text-white/40 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all backdrop-blur-md">
          <Search size={18} />
          <input type="text" placeholder="بحث عن سجل استثماري..." className="bg-transparent border-none outline-none text-sm w-64 text-right placeholder:text-white/20" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">صافي القيمة</p>
          <p className="text-lg font-bold text-primary leading-none">{formatCurrency(netValue)}</p>
        </div>
        <div className="h-10 w-px bg-white/10"></div>
        <button className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-colors relative group">
          <Bell size={20} className="text-white/70 group-hover:text-white transition-colors" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-bakery-surface"></span>
        </button>
      </div>
    </header>
  );
};

const StatCard = ({ title, value, unit, trend, color, icon: Icon }: any) => {
  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5 text-primary group-hover:scale-110 transition-transform")}>
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
      <h3 className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-xs text-white/30 font-medium italic">{unit}</span>
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
          <h1 className="text-4xl font-light text-white mb-2">مرحباً، <span className="font-medium text-primary">مدير المخبز</span></h1>
          <p className="text-white/40 text-sm font-light italic">آخر تحديث للبيانات الاستثمارية: {new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي القيمة الحالية" value={formatCurrency(stats.netValue)} trend={12} color="bg-primary" icon={Wallet} />
        <StatCard title="عائدات الجلسة" value={formatCurrency(stats.dailyIncome)} trend={5} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard title="التفقات الجارية" value={formatCurrency(stats.dailyExpense)} trend={-2} color="bg-red-500" icon={TrendingDown} />
        <StatCard title="الالتزامات الخارجية" value={formatCurrency(stats.totalDebt)} color="bg-primary" icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-gradient-to-bl from-[#1c1c1c] to-[#121212] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col justify-between h-[380px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 mb-6 inline-block italic tracking-wider">كفاءة الإنتاج</span>
              <h2 className="text-6xl font-light text-white">+{((stats.dailyIncome / (stats.dailyExpense || 1)) * 10).toFixed(1)}%</h2>
              <p className="text-white/40 text-sm mt-3 font-light">نسبة استرداد التكاليف للدورة الحالية</p>
            </div>
            <div className="flex gap-1.5 items-end h-24">
              {transactions.slice(0, 8).map((t: any, i: number) => (
                <div key={i} className={cn("w-1.5 rounded-full", t.type === 'income' ? 'bg-primary' : 'bg-white/10')} style={{ height: `${Math.min(t.amount/1000, 100)}%` }}></div>
              ))}
            </div>
          </div>
          <div className="flex gap-16 border-t border-white/5 pt-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">إجمالي تحركات العملة</p>
              <p className="text-2xl font-medium text-white">{transactions.length} قيود</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">هامش الربح الفوري</p>
              <p className="text-2xl font-medium text-white">{formatCurrency(stats.dailyIncome - stats.dailyExpense)}</p>
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
             <h3 className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">أحدث التحركات المالية</h3>
          </div>
          <div className="space-y-4">
             {transactions.slice(0, 3).map((t: any, i: number) => (
               <div key={i} className="bg-surface-card p-5 rounded-3xl flex justify-between items-center border border-white/[0.03] hover:border-white/10 transition-all group">
                 <div className="flex items-center gap-5">
                   <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform", t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/40')}>
                     {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-white">{t.description}</p>
                     <p className="text-[10px] text-white/30 italic mt-0.5">{t.date}</p>
                   </div>
                 </div>
                 <span className={cn("text-sm font-bold tracking-tight", t.type === 'income' ? "text-primary" : "text-white/60")}>
                   {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                 </span>
               </div>
             ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">توزيع الأصول الاستراتيجية</h3>
             <span className="text-[10px] text-white/30 font-light italic tracking-wide">إجمالي 4 فئات أساسية</span>
          </div>
          <div className="bg-sidebar/50 border border-white/5 rounded-[40px] p-10 flex-1 flex flex-col justify-center gap-10 backdrop-blur-xl shadow-inner">
             {[
               { label: 'الإنتاج', val: 65, color: 'bg-primary' },
               { label: 'المخزون', val: 20, color: 'bg-primary/60' },
               { label: 'الاحتياطي', val: 15, color: 'bg-white/20' }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-6">
                 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.val}%` }}
                     transition={{ duration: 1.5, delay: i * 0.2 }}
                     className={cn("h-full rounded-full shadow-[0_0_10px_rgba(197,160,89,0.2)]", item.color)} 
                   />
                 </div>
                 <span className="text-[10px] font-bold tracking-widest text-white/60 w-24 text-left uppercase">{item.label} {item.val}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Finance = ({ stats, transactions, onAdd }: any) => {
  const [tab, setTab] = React.useState<'income' | 'expense'>('income');
  const [amount, setAmount] = React.useState('');
  const [desc, setDesc] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    onAdd({
      description: desc,
      amount: parseFloat(amount),
      type: tab,
      category: tab === 'income' ? 'sales' : 'expense'
    });
    setAmount('');
    setDesc('');
  };

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-4xl font-light text-white mb-2">المالية والقيود <span className="font-medium">اليومية</span></h2>
          <p className="text-white/40 text-sm font-light italic">إدارة الإيرادات والمصروفات للدورة الحالية</p>
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
            <button onClick={() => setTab('income')} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all", tab === 'income' ? "bg-primary text-black" : "text-white/40")}>الإيرادات</button>
            <button onClick={() => setTab('expense')} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all", tab === 'expense' ? "bg-red-500 text-white" : "text-white/40")}>المصروفات</button>
          </div>
          <div className="bg-surface-card p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col gap-8">
            <h3 className="text-sm font-bold tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 border-b border-white/5 pb-6">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tab === 'income' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500")}>
                {tab === 'income' ? <PlusCircle size={20} /> : <TrendingDown size={20} />}
              </div>
              تسجيل {tab === 'income' ? 'إيراد' : 'مصروف'} جديد
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
               <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">الوصف / التفاصيل</label>
                <input 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-white transition-all backdrop-blur-md" 
                  placeholder={tab === 'income' ? "مبيعات الوردية..." : "شراء مواد..."}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">المبلغ المالي</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex-1 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase">سجل القيود المالية الجارية</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right border-collapse">
                <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-6 px-10">التفاصيل</th>
                    <th className="py-6 px-10">التوقيت</th>
                    <th className="py-6 px-10 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {transactions.slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-1.5 h-1.5 rounded-full", row.type === 'income' ? "bg-primary" : "bg-red-500")} />
                          <span className="font-bold text-white group-hover:text-primary transition-colors">{row.description}</span>
                        </div>
                      </td>
                      <td className="py-6 px-10 text-white/40 text-xs font-medium italic">{row.date}</td>
                      <td className={cn("py-6 px-10 text-left font-black tracking-tight", row.type === 'income' ? "text-primary" : "text-white/60")}>
                        {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contacts = ({ contacts, onPay, onAdd, onDelete }: { 
  contacts: any[], 
  onPay: (id: string, amount: number, isSupplier: boolean) => void,
  onAdd: (contact: any) => void,
  onDelete: (id: string) => void
}) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [historyId, setHistoryId] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newContact, setNewContact] = React.useState({ name: '', type: 'customer', debt: 0, balance: 0 });

  const handlePay = () => {
    if (!selectedId || !amount) return;
    const contact = contacts.find(c => c.id === selectedId);
    onPay(selectedId, parseFloat(amount), contact.type === 'supplier');
    setSelectedId(null);
    setAmount('');
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
          <h1 className="text-4xl font-light text-white mb-1">إدارة <span className="font-medium text-primary">العلاقات الاستراتيجية</span></h1>
          <p className="text-white/40 text-sm font-light italic">متابعة الأرصدة المتبادلة مع العملاء والموردين المعتمدين</p>
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
              <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
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
                           <span className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</span>
                           <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">عرض السجل</span>
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
                            <button onClick={() => setSelectedId(c.id)} className="p-3 text-white/20 hover:text-primary transition-all rounded-xl hover:bg-white/5" title="تحصيل مبلغ"><Wallet size={18} /></button>
                            <button onClick={() => setDeleteConfirmId(c.id)} className="p-3 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5" title="حذف">
                              <TrendingDown size={14} className="rotate-45" />✕
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
              <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
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
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{s.name}</span>
                        <span className="text-[10px] text-white/20 font-medium mt-1 uppercase tracking-widest">سجل العمليات ←</span>
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
                            <button onClick={() => setSelectedId(s.id)} className="bg-white/5 text-white/60 border border-white/10 hover:bg-primary hover:text-black hover:border-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                              تسجيل سداد
                            </button>
                            <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-white/5">✕</button>
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
                  <input 
                    type="number"
                    value={newContact.type === 'customer' ? newContact.debt : newContact.balance}
                    onChange={(e) => setNewContact(prev => ({ ...prev, [newContact.type === 'customer' ? 'debt' : 'balance']: parseFloat(e.target.value) || 0 }))}
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
        {historyId && selectedForHistory && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex items-center justify-center p-6 md:p-12">
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               className="bg-sidebar w-full max-w-2xl rounded-[40px] border border-white/10 overflow-hidden flex flex-col max-h-[80vh] shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
             >
                <div className="p-10 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black text-lg", selectedForHistory.color || "bg-primary")}>
                         {selectedForHistory.initial || selectedForHistory.name[0]}
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-white">{selectedForHistory.name}</h3>
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                           {selectedForHistory.type === 'customer' ? 'سجل معاملات العميل' : 'سجل استحقاقات المورد'}
                         </p>
                      </div>
                   </div>
                   <button onClick={() => setHistoryId(null)} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                      ✕
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-6">
                   {(!selectedForHistory.history || selectedForHistory.history.length === 0) ? (
                     <div className="h-60 flex flex-col items-center justify-center text-white/20 gap-4 italic">
                        <BarChart3 size={48} strokeWidth={1} />
                        <p>لا توجد سجلات عمليات سابقة لهذا العميل</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {selectedForHistory.history.map((entry: any, i: number) => (
                           <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:bg-white/[0.07] transition-all">
                              <div>
                                 <p className="text-white font-bold mb-1">{entry.description}</p>
                                 <p className="text-[10px] text-white/30 italic">{entry.date}</p>
                              </div>
                              <div className="text-left">
                                 <p className={cn("text-lg font-black tracking-tight", entry.amount > 0 ? "text-emerald-400" : "text-red-400")}>
                                    {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                                 </p>
                                 <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter">الرصيد بعد العملية: {formatCurrency(entry.balance)}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/20 flex justify-between items-center">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">الملخص النهائي للحساب</p>
                   <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-white/40 italic">الرصيد الحالي:</span>
                      <span className={cn("text-2xl font-black tracking-tighter", selectedForHistory.type === 'customer' ? "text-red-400" : "text-primary")}>
                         {formatCurrency(selectedForHistory.type === 'customer' ? selectedForHistory.debt : selectedForHistory.balance)}
                      </span>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-sm rounded-[40px] border border-white/10 p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center">تسجيل دفعة مالية</h3>
              <p className="text-white/40 text-sm text-center italic">تحويل مالي لـ {contacts.find(c => c.id === selectedId)?.name}</p>
              <div className="space-y-4">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
          <h1 className="text-4xl font-light text-white mb-2">إدارة <span className="font-medium text-primary">المواد الخام الاستراتيجية</span></h1>
          <p className="text-white/40 text-sm font-light italic">مراقبة مستويات الوقود والدقيق والسلع الأساسية في الوقت الفعلي</p>
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
            <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
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
                        <span className="font-bold text-white group-hover/btn:text-primary transition-colors">{item.name}</span>
                        <span className="text-[8px] text-white/20 uppercase font-black group-hover/btn:text-white/40">عرض البيانات التحليلية</span>
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
           <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[80] flex items-center justify-center p-6">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-sidebar w-full max-w-lg rounded-[48px] border border-white/10 overflow-hidden shadow-2xl"
             >
                <div className="p-12 flex flex-col gap-10">
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
                                      <span className="text-[10px] text-white font-bold">{h.type === 'addition' ? 'توريد كمية' : 'سحب كمية'}</span>
                                      <span className="text-[10px] text-white/30">{h.date}</span>
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
                    <input 
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
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
                  <input 
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
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
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-black text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                {mode === 'restock' && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">إجمالي قيمة الشراء</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
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
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
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
      orderBy('date', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setLoadingData(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

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
    };
  }, [user]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    try {
      await addDoc(collection(db, 'transactions'), {
        ...data,
        date,
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

  const handlePayment = async (id: string, amount: number, isSupplier: boolean) => {
    if (!user) return;
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    if (isSupplier) {
      const newHistory = [...(contact.history || []), { date, description: 'دفع مبلغ للمورد', amount: -amount, balance: (contact.balance || 0) - amount }];
      try {
        await updateDoc(doc(db, 'contacts', id), {
          balance: Math.max(0, (contact.balance || 0) - amount),
          history: newHistory
        });
        addTransaction({ description: `سداد مورد: ${contact.name}`, amount, type: 'expense', category: 'payment' });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
      }
    } else {
      const newHistory = [...(contact.history || []), { date, description: 'تحصيل مبلغ من العميل', amount: -amount, balance: (contact.debt || 0) - amount }];
      try {
        await updateDoc(doc(db, 'contacts', id), {
          debt: Math.max(0, (contact.debt || 0) - amount),
          history: newHistory
        });
        addTransaction({ description: `تحصيل دين: ${contact.name}`, amount, type: 'income', category: 'debt' });
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
    <div className="min-h-screen bg-bakery-surface text-right font-sans" dir="rtl">
      <Sidebar activeView={view} setView={setView} user={user} />
      
      <div className="lg:pr-72 min-h-screen flex flex-col">
        <TopBar netValue={netValue} />
        
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
                  {view === 'finance' && <Finance stats={{ dailyIncome, dailyExpense }} transactions={transactions} onAdd={addTransaction} />}
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
  const [range, setRange] = React.useState<'day' | 'week' | 'month' | 'all'>('all');
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
    const idx = transactions.indexOf(t);
    if (range === 'day') return idx < 5;
    if (range === 'week') return idx < 20;
    if (range === 'month') return idx < 50;
    return true;
  });

  const rangeIncome = filteredTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
  const rangeExpense = filteredTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
  const inventoryValue = inventory.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  
  const ranges = [
    { id: 'day', label: 'اليوم' },
    { id: 'week', label: 'الأسبوع' },
    { id: 'month', label: 'الشهر' },
    { id: 'all', label: 'الكل' },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-right-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-1">الذكاء <span className="font-medium text-primary">المحاسبي والتحليلي</span></h1>
          <p className="text-white/40 text-sm font-light italic">تحليل أداء رأس المال وكفاءة التشغيل للدورة الحالية</p>
        </div>
        
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-6">إجمالي الإيرادات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary tracking-tight">{formatCurrency(rangeIncome)}</span>
          </div>
          <div className="flex items-center gap-2 mt-6 text-emerald-400 text-[10px] font-bold">
            <TrendingUp size={14} />
            <span>+12.4% عن الفترة السابقة</span>
          </div>
        </div>

        <div className="bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-6">إجمالي المصروفات (الفترة)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">{formatCurrency(rangeExpense)}</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
             <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((rangeExpense/rangeIncome)*100, 100)}%` }}></div>
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
                  <input 
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
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
