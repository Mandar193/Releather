import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { useEffect, useState } from "react";
import { UserProfile, LeatherItem } from "../types";
import { Leaf, Award, Package, History, ArrowUpRight, TrendingUp, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";

const ADMIN_EMAIL = 'mandaras936@gmail.com';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<LeatherItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      try {
        const prof = await api.getUser(user!.uid);
        setProfile(prof);
      } catch (err) {
        console.warn("Profile not found, creating one...");
        await api.upsertUser({
          uid: user!.uid,
          email: user!.email || '',
          displayName: user!.displayName || 'Anonymous'
        });
      }

      // Fetch Items
      const data = await api.getItems(user!.uid);
      // Sort by date (SQLite returns ISO strings usually, but our interface expects something compatible)
      data.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
      setItems(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      alert("Failed to load your dashboard data. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!isAdminUser) {
      alert("Only admins can delete items from the registry.");
      return;
    }
    if (!confirm("Are you sure you want to permanently remove this listing from the circular economy record?")) return;
    try {
      await api.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      alert("Item successfully purged from the circular registry.");
    } catch (err: any) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold italic mb-4">Please sign in to view your impact.</h2>
        <button className="bg-[#5A5A40] text-white px-8 py-3 rounded-full font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center space-x-2 text-[#5A5A40] font-bold text-xs uppercase tracking-widest mb-2">
            <Award className="w-4 h-4" /> 
            <span>Ambassador Level: Gold</span>
          </div>
          <h1 className="text-5xl font-serif font-bold italic tracking-tight">Your Collective Impact</h1>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm pr-6">
          <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} className="w-12 h-12 rounded-xl" />
          <div>
            <p className="font-bold font-serif text-lg leading-tight">{user.displayName}</p>
            <p className="text-xs text-gray-400">Pioneer Member since {profile?.createdAt ? format(new Date(profile.createdAt as any), 'yyyy') : '...'}</p>
          </div>
        </div>
      </header>

      {/* Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-[#5A5A40] text-white p-8 rounded-[2rem] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Total Carbon Prevented</p>
            <div className="text-5xl font-serif font-bold italic mb-4">
              {profile?.sustainabilityScore.co2Saved || "14.2"}<span className="text-2xl font-sans ml-2 opacity-60 italic">kg</span>
            </div>
            <p className="text-xs opacity-60 leading-relaxed max-w-[200px]">Equivalant to planting 2 young trees and letting them grow for 10 years.</p>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-64 h-64 border-[40px] border-white/5 rounded-full"
          />
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-[#f5f5f0] rounded-2xl flex items-center justify-center mb-6">
              <Package className="w-6 h-6 text-[#5A5A40]" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Lifetime Items Diverted</p>
            <div className="text-5xl font-serif font-bold italic text-[#1a1a1a]">
              {profile?.sustainabilityScore.itemsResold || items.length} <span className="text-2xl font-sans text-gray-300">Units</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-between text-[#5A5A40]">
             <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
               <ArrowUpRight className="w-3 h-3" /> +12% from last month
             </span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
             <div className="w-12 h-12 bg-[#f5f5f0] rounded-2xl flex items-center justify-center mb-6">
              <History className="w-6 h-6 text-[#5A5A40]" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Active Inventory</p>
            <div className="text-5xl font-serif font-bold italic text-[#1a1a1a]">
              {items.filter(i => i.status === 'marketplace').length} <span className="text-2xl font-sans text-gray-300 italic">Live</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-gray-50 text-xs font-medium text-gray-400">
            Average item shelf-life: 14.5 days
          </div>
        </div>
      </div>

      {/* Item Table/List */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-2xl font-serif font-bold italic flex items-center gap-3">
             <Leaf className="w-6 h-6 text-[#5A5A40]" />
             My Product Lifecycle Ledger
          </h3>
          <button className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] hover:underline">Download CSV</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f5f5f0]/50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Condition</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Impact</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-[#f5f5f0]/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.images[0]} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-lg leading-tight">{item.title}</p>
                        <p className="text-xs text-gray-400">Ref: #{item.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'marketplace' ? 'bg-[#5A5A40]/10 text-[#5A5A40]' :
                      item.status === 'sold' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-serif italic text-gray-600">
                    {item.aiAnalysis?.condition}
                  </td>
                  <td className="px-8 py-6 font-serif font-bold text-lg">
                    ${item.listedPrice || item.aiAnalysis?.suggestedPrice}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1 text-[#5A5A40]">
                      <Leaf className="w-3 h-3" />
                      <span className="text-[10px] font-bold">100% Circular</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isAdminUser && (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove listing"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
