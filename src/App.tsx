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
  LogOut
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

const Sidebar = ({ activeView, setView }: { activeView: View, setView: (v: View) => void }) => {
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
        <button 
          onClick={() => {
            if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest font-black"
        >
          إعادة ضبط جميع البيانات
        </button>
        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
          <p className="text-xs text-white/40 mb-1 font-light italic">الدعم المتميز</p>
          <p className="text-sm mb-4 font-medium text-white/90">تحتاج إلى مساعدة؟</p>
          <button className="w-full py-2.5 bg-primary text-black text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95">
            اتصل بالوكيل
          </button>
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

const Contacts = ({ contacts, onPay }: { contacts: any[], onPay: (id: string, amount: number, isSupplier: boolean) => void }) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [historyId, setHistoryId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');

  const handlePay = () => {
    if (!selectedId || !amount) return;
    const contact = contacts.find(c => c.id === selectedId);
    onPay(selectedId, parseFloat(amount), contact.type === 'supplier');
    setSelectedId(null);
    setAmount('');
  };

  const selectedForHistory = contacts.find(c => c.id === historyId);

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-left-8 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-light text-white mb-1">إدارة <span className="font-medium text-primary">العلاقات الاستراتيجية</span></h1>
        <p className="text-white/40 text-sm font-light italic">متابعة الأرصدة المتبادلة مع العملاء والموردين المعتمدين</p>
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
                  <th className="py-6 px-10 text-center">إجراء</th>
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
                      <button onClick={() => setSelectedId(c.id)} className="p-3 text-white/20 hover:text-primary transition-all rounded-xl hover:bg-white/5"><Wallet size={18} /></button>
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
                      <button onClick={() => setSelectedId(s.id)} className="bg-white/5 text-white/60 border border-white/10 hover:bg-primary hover:text-black hover:border-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        تسجيل سداد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

const Inventory = ({ inventory, onUpdate }: any) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'restock' | 'withdraw'>('restock');
  const [amount, setAmount] = React.useState('');
  const [price, setPrice] = React.useState('');

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

  return (
    <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">إدارة <span className="font-medium text-primary">المواد الخام الاستراتيجية</span></h1>
          <p className="text-white/40 text-sm font-light italic">مراقبة مستويات الوقود والدقيق والسلع الأساسية في الوقت الفعلي</p>
        </div>
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
                <th className="py-6 px-10 text-center">تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {inventory.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-white/5">
                        <item.icon size={22} />
                      </div>
                      <span className="font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                    </div>
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
                بناءً على كمية الدقيق والوقود المتوفرة، يمكن تشغيل <span className="text-black font-black underline underline-offset-4 decoration-2">{Math.floor(inventory[0].quantity * 20)}</span> وحدة إنتاجية.
              </p>
            </div>
            <div className="bg-black/10 p-6 rounded-3xl backdrop-blur-md relative z-10 border border-black/5 flex flex-col items-center shadow-inner">
               <span className="text-5xl font-black tracking-tighter leading-none">{(inventory.filter((i:any) => i.status === 'available').length / inventory.length * 100).toFixed(0)}%</span>
               <p className="text-[10px] uppercase font-black tracking-widest text-black/40 text-center mt-3">جاهزية التوريد</p>
            </div>
         </div>
      </div>

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

export default function App() {
  const [view, setView] = React.useState<View>('dashboard');
  
  // --- Global State ---
  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    const saved = localStorage.getItem('luxuria_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '14:30 م', description: 'مبيعات وردية الصباح', amount: 12000, type: 'income', category: 'sales' },
      { id: '2', date: '09:15 ص', description: 'مبيعات وردية الصباح', amount: 10000, type: 'income', category: 'sales' },
      { id: '3', date: 'أمس', description: 'شراء دقيق ممتاز', amount: 45000, type: 'expense', category: 'inventory' },
    ];
  });

  const ICON_MAP: Record<string, React.ElementType> = { Wheat, Beaker, Droplets, Fuel };

  const [inventory, setInventory] = React.useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('luxuria_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        icon: ICON_MAP[item.iconName] || Package
      }));
    }
    return [
      { id: '1', name: 'دقيق قمح ممتاز', quantity: 120, unit: 'جوال', price: 18500, status: 'available', icon: Wheat, iconName: 'Wheat' } as any,
      { id: '2', name: 'خميرة فورية', quantity: 2, unit: 'كرتونة', price: 45000, status: 'low', icon: Beaker, iconName: 'Beaker' } as any,
      { id: '3', name: 'سكر أبيض', quantity: 45, unit: 'جوال', price: 32000, status: 'available', icon: Droplets, iconName: 'Droplets' } as any,
      { id: '4', name: 'وقود (ديزل)', quantity: 850, unit: 'لتر', price: 1150, status: 'available', icon: Fuel, iconName: 'Fuel' } as any,
    ];
  });

  const [contacts, setContacts] = React.useState(() => {
    const saved = localStorage.getItem('luxuria_contacts');
    const defaultContacts = [
      { id: '1', name: 'أحمد محمد', date: '12 أكتوبر', debt: 15000, initial: 'أ', color: 'bg-primary', type: 'customer', history: [] },
      { id: '2', name: 'بقالة النور', date: '10 أكتوبر', debt: 22500, initial: 'ب', color: 'bg-primary/40', type: 'customer', history: [] },
      { id: '3', name: 'مطعم الأمل', date: '05 أكتوبر', debt: 7700, initial: 'م', color: 'bg-white/10', type: 'customer', history: [] },
      { id: '4', name: 'مطاحن الدقيق الوطنية', cat: 'دقيق ومخبوزات', balance: 85000, date: '01 أكتوبر', type: 'supplier', history: [] },
      { id: '5', name: 'شركة الوقود الحديثة', cat: 'غاز الديزل', balance: 32000, date: '28 سبتمبر', type: 'supplier', history: [] },
    ];
    return saved ? JSON.parse(saved) : defaultContacts;
  });

  // --- Persistence Effects ---
  React.useEffect(() => {
    localStorage.setItem('luxuria_transactions', JSON.stringify(transactions));
  }, [transactions]);

  React.useEffect(() => {
    const dataToSave = inventory.map(({ icon, ...rest }: any) => rest);
    localStorage.setItem('luxuria_inventory', JSON.stringify(dataToSave));
  }, [inventory]);

  React.useEffect(() => {
    localStorage.setItem('luxuria_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // --- Actions ---
  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newT: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions(prev => [newT, ...prev]);
  };

  const updateInventory = (id: string, amount: number, cost?: number) => {
    const itemName = inventory.find(i => i.id === id)?.name;

    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + amount);
        const updatedItem = { 
          ...item, 
          quantity: newQty, 
          status: newQty > 10 ? 'available' : newQty > 0 ? 'low' : 'out' 
        } as any;
        
        // تحديث السعر فقط في حالة التوريد الجديد وبمبلغ صحيح
        if (cost && amount > 0) {
          updatedItem.price = cost / amount;
        }
        
        return updatedItem;
      }
      return item;
    }));
    
    if (cost && cost > 0) {
      addTransaction({ 
        description: `توريد مواد: ${itemName}`, 
        amount: cost, 
        type: 'expense', 
        category: 'inventory' 
      });
    }
  };

  const handlePayment = (id: string, amount: number, isSupplier: boolean) => {
    const date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    if (isSupplier) {
      setContacts(prev => prev.map(c => {
        if (c.id === id) {
          const newHistory = [...(c.history || []), { date, description: 'دفع مبلغ للمورد', amount: -amount, balance: (c.balance || 0) - amount }];
          return { ...c, balance: Math.max(0, (c.balance || 0) - amount), history: newHistory };
        }
        return c;
      }));
      addTransaction({ description: `سداد مورد: ${contacts.find(c => c.id === id)?.name}`, amount, type: 'expense', category: 'payment' });
    } else {
      setContacts(prev => prev.map(c => {
        if (c.id === id) {
          const newHistory = [...(c.history || []), { date, description: 'تحصيل مبلغ من العميل', amount: -amount, balance: (c.debt || 0) - amount }];
          return { ...c, debt: Math.max(0, (c.debt || 0) - amount), history: newHistory };
        }
        return c;
      }));
      addTransaction({ description: `تحصيل دين: ${contacts.find(c => c.id === id)?.name}`, amount, type: 'income', category: 'debt' });
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Calculations ---
  const dailyIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const dailyExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalDebt = contacts.filter(c => c.type === 'customer').reduce((acc, c) => acc + (c.debt || 0), 0);
  const netValue = 1240500 + dailyIncome - dailyExpense; // Base + current session

  return (
    <div className="min-h-screen bg-bakery-surface text-on-surface">
      <Sidebar activeView={view} setView={setView} />
      
      <div className="lg:pr-72 min-h-screen flex flex-col">
        <TopBar netValue={netValue} />
        
        <main className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {view === 'dashboard' && <Dashboard stats={{ netValue, dailyIncome, dailyExpense, totalDebt }} transactions={transactions} inventory={inventory} />}
              {view === 'finance' && <Finance stats={{ dailyIncome, dailyExpense }} transactions={transactions} onAdd={addTransaction} />}
              {view === 'contacts' && <Contacts contacts={contacts} onPay={handlePayment} />}
              {view === 'inventory' && <Inventory inventory={inventory} onUpdate={updateInventory} />}
              {view === 'reports' && (
                <Reports 
                  transactions={transactions} 
                  inventory={inventory} 
                  onEditTransaction={updateTransaction} 
                  onDeleteTransaction={deleteTransaction}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-sidebar/80 border border-white/5 shadow-2xl rounded-[32px] flex items-center justify-around px-4 z-50 backdrop-blur-xl">
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
              "p-4 rounded-full transition-all duration-300",
              view === item.id ? "bg-primary text-black -translate-y-6 shadow-[0_15px_30px_rgba(197,160,89,0.3)] scale-110" : "text-white/40"
            )}
          >
            <item.icon size={22} />
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

  const handleSaveEdit = () => {
    if (editingTransaction) {
      onEditTransaction(editingTransaction.id, {
        description: editForm.description,
        amount: parseFloat(editForm.amount)
      });
      setEditingTransaction(null);
    }
  };

  const filteredTransactions = transactions.filter((t: any) => {
    if (range === 'all') return true;
    // في بيئة حقيقية سنستخدم تواريخ فعلية، هنا سنحاكي الفلترة بناءً على عدد الحركات
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
        {/* Income Details Card */}
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

        {/* Expense Details Card */}
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
      
      {/* قسم إضافي لتحليل الأصول */}
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

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar w-full max-w-sm rounded-[40px] border border-white/10 p-10 flex flex-col gap-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center">تعديل العملية</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">الوصف</label>
                  <input 
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-right font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="وصف العملية"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-2 block">المبلغ</label>
                  <input 
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-black text-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  <button 
                    onClick={handleSaveEdit} 
                    className="py-4 bg-primary text-black rounded-2xl font-black hover:bg-primary/90 transition-all text-xs uppercase tracking-widest"
                  >
                    حفظ التعديلات
                  </button>
                  <div className="flex gap-4">
                    <button onClick={() => setEditingTransaction(null)} className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest">إلغاء</button>
                    <button 
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه العملية؟')) {
                          onDeleteTransaction(editingTransaction.id);
                          setEditingTransaction(null);
                        }
                      }} 
                      className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-all text-xs uppercase tracking-widest border border-red-500/20"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
