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

      <div className="mt-auto">
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

const TopBar = () => {
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
          <p className="text-lg font-bold text-primary leading-none">$1,240,500</p>
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

const Dashboard = () => {
  const chartData = [
    { name: 'السبت', income: 45000, expense: 32000 },
    { name: 'الأحد', income: 52000, expense: 38000 },
    { name: 'الاثنين', income: 41000, expense: 29000 },
    { name: 'الثلاثاء', income: 63000, expense: 42000 },
    { name: 'الأربعاء', income: 58000, expense: 35000 },
    { name: 'الخميس', income: 72000, expense: 45000 },
    { name: 'الجمعة', income: 68000, expense: 41000 },
  ];

  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'دقيق قمح ممتاز', quantity: 120, unit: 'جوال', price: 18500, status: 'available', icon: Wheat },
    { id: '2', name: 'خميرة فورية', quantity: 2, unit: 'كرتونة', price: 45000, status: 'low', icon: Beaker },
    { id: '3', name: 'سكر أبيض', quantity: 45, unit: 'جوال', price: 32000, status: 'available', icon: Droplets },
    { id: '4', name: 'وقود (ديزل)', quantity: 850, unit: 'لتر', price: 1150, status: 'available', icon: Fuel },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">مرحباً، <span className="font-medium text-primary">مدير المخبز</span></h1>
          <p className="text-white/40 text-sm font-light italic">آخر تحديث للبيانات الاستثمارية: اليوم، 10:45 صباحاً</p>
        </div>
        <button className="flex items-center gap-3 bg-primary text-black px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 active:scale-95">
          <PlusCircle size={20} />
          <span>توسيع المحفظة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="خزنة النقد النقدية" value="450,000" unit="ج.س" trend={12} color="bg-primary" icon={Wallet} />
        <StatCard title="عائدات اليوم" value="120,000" unit="ج.س" trend={5} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard title="التفقات الجارية" value="85,000" unit="ج.س" trend={-2} color="bg-red-500" icon={TrendingDown} />
        <StatCard title="الالتزامات الخارجية" value="210,000" unit="ج.س" color="bg-primary" icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-gradient-to-bl from-[#1c1c1c] to-[#121212] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col justify-between h-[380px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 mb-6 inline-block italic tracking-wider">أداء رأس المال</span>
              <h2 className="text-6xl font-light text-white">+12.4%</h2>
              <p className="text-white/40 text-sm mt-3 font-light">نمو إيجابي مقارنة بدورة الإنتاج السابقة</p>
            </div>
            <div className="flex gap-1.5 items-end h-24">
              <div className="w-1.5 h-8 bg-primary/20 rounded-full"></div>
              <div className="w-1.5 h-12 bg-primary/40 rounded-full"></div>
              <div className="w-1.5 h-16 bg-primary/60 rounded-full"></div>
              <div className="w-1.5 h-20 bg-primary rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]"></div>
            </div>
          </div>
          <div className="flex gap-16 border-t border-white/5 pt-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">العائد المتوقع</p>
              <p className="text-2xl font-medium text-white">$142,000</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">الأرباح الصافية</p>
              <p className="text-2xl font-medium text-white">$34,500</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-primary rounded-[32px] p-8 flex flex-col justify-between shadow-2xl h-[380px]">
             <div className="flex justify-between items-start">
                <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-md">
                  <Wallet size={24} className="text-black/70" />
                </div>
                <span className="text-black/60 text-[10px] font-bold uppercase tracking-widest">البطاقة المتميزة</span>
             </div>
             <div>
                <p className="text-black/40 text-[10px] mb-1 font-mono uppercase">كود التشفير</p>
                <p className="text-black text-2xl font-bold tracking-[0.2em]">**** 8829</p>
             </div>
             <div className="flex justify-between items-end">
                <div className="text-black">
                  <p className="text-[10px] opacity-60 uppercase font-bold mb-1">الرصيد المتاح</p>
                  <p className="text-4xl font-black">$42,800</p>
                </div>
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl">GOLD</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">أحدث التحركات المالية</h3>
             <button className="text-xs text-primary font-bold tracking-wider hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-4">
             {[
               { icon: '🥐', title: 'مبيعات الصباح', desc: 'تم التسوية - الوردية A', val: '+12,000', color: 'text-emerald-400' },
               { icon: '📦', title: 'توريد مواد خام', desc: 'مطاحن الدقيق الوطنية', val: '-45,000', color: 'text-white' },
               { icon: '⚡️', title: 'مصاريف تشغيل', desc: 'فاتورة الكهرباء والوقود', val: '-8,500', color: 'text-white' }
             ].map((t, i) => (
               <div key={i} className="bg-surface-card p-5 rounded-3xl flex justify-between items-center border border-white/[0.03] hover:border-white/10 transition-all group">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{t.icon}</div>
                   <div>
                     <p className="text-sm font-medium text-white">{t.title}</p>
                     <p className="text-[10px] text-white/30 italic mt-0.5">{t.desc}</p>
                   </div>
                 </div>
                 <span className={cn("text-sm font-bold tracking-tight", t.color)}>{t.val} ج.س</span>
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

const Finance = () => {
  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-surface-card p-10 rounded-[40px] border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-4xl font-light text-white mb-2">المالية والقيود <span className="font-medium">اليومية</span></h2>
          <p className="text-white/40 text-sm font-light italic">إدارة الإيرادات والمصروفات ليوم الثلاثاء، 24 أكتوبر 2023</p>
        </div>
        <div className="flex flex-col items-end bg-primary text-black px-10 py-6 rounded-3xl shadow-2xl relative overflow-hidden min-w-[280px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50"></div>
          <span className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-2">صافي الربح الفعلي</span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-5xl font-black">14,500</span>
            <span className="text-sm font-black uppercase">SDG</span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-black/60 relative z-10 font-bold text-xs uppercase tracking-tighter">
            <TrendingUp size={14} />
            <span>+12% نمو دوري</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex bg-white/5 p-2 rounded-[24px] border border-white/5 backdrop-blur-md">
            <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-black bg-primary rounded-2xl shadow-xl">الإيرادات</button>
            <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">المصروفات</button>
          </div>
          <div className="bg-surface-card p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col gap-8">
            <h3 className="text-sm font-bold tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <PlusCircle size={20} />
              </div>
              تسجيل إدخال مالي جديد
            </h3>
            <form className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">الفترة الزمنية</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-white transition-all appearance-none cursor-pointer backdrop-blur-md">
                  <option className="bg-[#1c1c1c]">الوردية الصباحية (Premium)</option>
                  <option className="bg-[#1c1c1c]">الوردية المسائية (Elite)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">إجمالي المبيعات المحققة</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-20 pr-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-white transition-all text-left placeholder:text-white/10" 
                    placeholder="00.00" 
                  />
                  <span className="absolute left-6 top-4.5 text-[10px] font-black tracking-widest text-primary uppercase">SDG</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/30 px-2">ملاحظات التدقيق الإضافية</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-white transition-all h-24 resize-none placeholder:text-white/10" 
                  placeholder="أدخل تفاصيل القيود المالية والملاحظات الرقابية..."
                ></textarea>
              </div>
              <button className="w-full bg-primary text-black rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] mt-4">
                تأكيد القيد المالي
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-surface-card p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute -left-10 -top-10 text-primary opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={160} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-4 relative z-10">إجمالي الإيرادات المسجلة</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-black text-white leading-none">22,000</span>
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">SDG</span>
              </div>
            </div>
            <div className="bg-surface-card p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute -left-10 -top-10 text-white opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={160} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-4 relative z-10">إجمالي النفقات الجارية</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-black text-white leading-none">7,500</span>
                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">SDG</span>
              </div>
            </div>
          </div>

          <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex-1 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase">سجل الإيرادات التفصيلي</h3>
              <button className="text-primary text-[10px] font-black tracking-widest flex items-center gap-2 hover:underline uppercase">
                عرض تقرير الأداء
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right border-collapse">
                <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="py-6 px-10">الطابع الزمني</th>
                    <th className="py-6 px-10">تصنيف الوردية</th>
                    <th className="py-6 px-10 text-left">صافي المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {[
                    { time: '14:30 PM', shift: 'Morning Elite', amount: '12,000' },
                    { time: '09:15 AM', shift: 'Morning Elite', amount: '10,000' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-6 px-10 text-sm font-medium text-white/90">{row.time}</td>
                      <td className="py-6 px-10">
                        <span className="inline-flex items-center gap-2 bg-white/5 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 group-hover:border-primary/20 group-hover:text-primary transition-all">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {row.shift}
                        </span>
                      </td>
                      <td className="py-6 px-10 text-left font-black text-white tracking-tight">{row.amount} <span className="text-[10px] text-white/20 font-light ml-1 uppercase">SDG</span></td>
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

const Contacts = () => {
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
              <span className="text-4xl font-black text-white tracking-tight">45,200</span>
              <span className="text-xs font-black text-white/20 uppercase tracking-widest">SDG</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="bg-primary/10 text-primary font-black text-[10px] px-5 py-2 rounded-full flex items-center gap-2 border border-primary/20 uppercase tracking-widest">
              <TrendingUp size={14} />
              التزامات التوريد الجارية
            </span>
            <div className="p-4 bg-white/5 rounded-2xl text-primary border border-white/5">
              <Fuel size={26} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mb-2">إجمالي مديونية التوريد</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary tracking-tight">128,500</span>
              <span className="text-xs font-black text-primary/30 uppercase tracking-widest">SDG</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 leading-none">
              <Users size={20} className="text-primary" />
              سجل ديون العملاء
            </h2>
            <button className="text-white/30 hover:text-primary transition-all p-3 hover:bg-white/5 rounded-full border border-transparent hover:border-white/5">
              <Filter size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="py-6 px-10">هوية العميل</th>
                  <th className="py-6 px-10">آخر تعامل</th>
                  <th className="py-6 px-10">إجمالي الدين</th>
                  <th className="py-6 px-10 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {[
                  { name: 'أحمد محمد', date: '12 أكتوبر', debt: '15,000', initial: 'أ', color: 'bg-primary' },
                  { name: 'بقالة النور', date: '10 أكتوبر', debt: '22,500', initial: 'ب', color: 'bg-primary/40' },
                  { name: 'مطعم الأمل', date: '05 أكتوبر', debt: '7,700', initial: 'م', color: 'bg-white/10' },
                ].map((c, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm uppercase shadow-lg", c.color)}>
                          {c.initial}
                        </div>
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10 text-white/40 text-xs font-medium italic">{c.date}</td>
                    <td className="py-6 px-10 font-black text-red-400 tracking-tight">{c.debt} <span className="text-[10px] opacity-30 ml-1">SDG</span></td>
                    <td className="py-6 px-10 text-center">
                      <button className="p-3 text-white/20 hover:text-primary transition-all rounded-xl hover:bg-white/5"><Wallet size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-white/[0.02] transition-all border-t border-white/[0.05]">
            عرض القائمة الكاملة
          </button>
        </div>

        <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3 leading-none">
              <Beaker size={20} className="text-primary" />
              حسابات كبار الموردين
            </h2>
            <button className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary/20 transition-all border border-primary/20">
              <PlusCircle size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="py-6 px-10">اسم المؤسسة الورادة</th>
                  <th className="py-6 px-10">الرصيد المفتوح</th>
                  <th className="py-6 px-10">دفعة التسوية</th>
                  <th className="py-6 px-10 text-center">تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {[
                  { name: 'مطاحن الدقيق الوطنية', cat: 'دقيق ومخبوزات', balance: '85,000', date: '01 أكتوبر' },
                  { name: 'شركة الوقود الحديثة', cat: 'غاز الديزل', balance: '32,000', date: '28 سبتمبر' },
                  { name: 'مورد التغليف البلاستيكي', cat: 'أكياس ومواد تغليف', balance: '11,500', date: '15 سبتمبر' },
                ].map((s, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-6 px-10">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{s.name}</span>
                        <span className="text-[10px] text-white/20 font-medium mt-1 uppercase tracking-widest">{s.cat}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10 font-black text-primary tracking-tight">{s.balance} <span className="text-[10px] opacity-30 ml-1">SDG</span></td>
                    <td className="py-6 px-10 text-white/40 text-xs font-medium italic">{s.date}</td>
                    <td className="py-6 px-10 text-center">
                      <button className="bg-white/5 text-white/60 border border-white/10 hover:bg-primary hover:text-black hover:border-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        تسجيل سداد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           <button className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-white/[0.02] transition-all border-t border-white/[0.05]">
            سجل الموردين الكامل
          </button>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  return (
    <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">المخزون <span className="font-medium text-primary">والرقابة الأصولية</span></h1>
          <p className="text-white/40 text-sm font-light italic">متابعة حركة المواد الخام وكفاءة التخزين اللوجستي</p>
        </div>
        <button className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/10 transition-all shadow-xl backdrop-blur-md active:scale-95">
          <Download size={20} />
          <span className="text-xs uppercase tracking-widest">تصدير التقارير الاستراتيجية</span>
        </button>
      </div>

      <div className="bg-sidebar border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
         <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-sm font-black tracking-[0.2em] text-white/80 uppercase flex items-center gap-3">
            <Package size={20} className="text-primary" />
             حالة المواد الخام والسلع الوسيطة
          </h2>
          <button className="text-primary text-[10px] font-black tracking-widest flex items-center gap-2 hover:underline uppercase">
            تحديث جرد المخزن
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-black/20 text-white/30 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-6 px-10">المادة الأولية</th>
                <th className="py-6 px-10 text-left">المستوى الحالي</th>
                <th className="py-6 px-10 text-left">التكلفة الرأسمالية</th>
                <th className="py-6 px-10 text-center">المؤشر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
               {[
                { name: 'دقيق ممتاز', qty: '120 جوال', cost: '2,220,000', status: 'available', icon: Wheat },
                { name: 'سكر نقي', qty: '45 جوال', cost: '1,440,000', status: 'available', icon: Droplets },
                { name: 'خميرة فرنسية', qty: '2 كرتونة', cost: '90,000', status: 'low', icon: Beaker },
                { name: 'ديزل تشغيل', qty: '850 لتر', cost: '977,500', status: 'available', icon: Fuel },
               ].map((item, idx) => (
                 <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                   <td className="py-6 px-10 flex items-center gap-5">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><item.icon size={22} /></div>
                     <span className="font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                   </td>
                   <td className="py-6 px-10 text-left font-medium text-white/60 text-sm italic">{item.qty}</td>
                   <td className="py-6 px-10 text-left font-black text-primary tracking-tight">{item.cost} <span className="text-[10px] opacity-30 ml-1">SDG</span></td>
                   <td className="py-6 px-10 text-center">
                     <StatusBadge status={item.status as any} />
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
              <Download size={20} className="text-primary" />
              أرشيف التقارير المحاسبية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 text-white rounded-[32px] font-bold hover:bg-white/10 transition-all group active:scale-95 shadow-xl">
                <FileText size={32} className="text-primary group-hover:rotate-6 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest opacity-60">الأرباح (PDF)</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 text-white rounded-[32px] font-bold hover:bg-white/10 transition-all group active:scale-95 shadow-xl">
                <TableIcon size={32} className="text-emerald-400 group-hover:-rotate-6 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest opacity-60">المخزون (Excel)</span>
              </button>
            </div>
         </div>

         <div className="bg-primary text-black p-10 rounded-[40px] shadow-2xl flex items-center justify-between group overflow-hidden relative border border-white/10">
            <div className="absolute -left-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform -rotate-12">
              <BarChart3 size={240} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3 leading-none uppercase tracking-tighter">القدرة الإنتاجية القصوى</h3>
              <p className="text-black/60 text-sm leading-relaxed max-w-[220px] font-medium italic">
                وفقاً للموارد المتاحة حالياً في المستودعات الاستراتيجية، يمكن إنتاج <span className="text-black font-black underline underline-offset-4 decoration-2">2400</span> وحدة.
              </p>
            </div>
            <div className="bg-black/10 p-6 rounded-3xl backdrop-blur-md relative z-10 border border-black/5 flex flex-col items-center shadow-inner">
              <span className="text-5xl font-black tracking-tighter leading-none">85%</span>
              <p className="text-[10px] uppercase font-black tracking-widest text-black/40 text-center mt-3">الكفاءة التشغيلية</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = React.useState<View>('dashboard');

  return (
    <div className="min-h-screen bg-bakery-surface text-on-surface">
      <Sidebar activeView={view} setView={setView} />
      
      <div className="lg:pr-72 min-h-screen flex flex-col">
        <TopBar />
        
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
              {view === 'dashboard' && <Dashboard />}
              {view === 'finance' && <Finance />}
              {view === 'contacts' && <Contacts />}
              {view === 'inventory' && <Inventory />}
              {view === 'reports' && (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center border border-white/5 bg-white/[0.02] rounded-[40px] border-dashed">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 text-primary border border-white/5">
                    <BarChart3 size={40} />
                  </div>
                  <h2 className="text-2xl font-light text-white mb-4 italic">التقارير التحليلية <span className="font-medium text-primary">المتقدمة</span></h2>
                  <p className="text-white/30 text-sm max-w-md font-light">يتم حالياً تكوين مراجعات الذكاء الاصطناعي وتقارير الأداء السنوي. يرجى مراجعة الوكيل لمزيد من المعلومات.</p>
                </div>
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
