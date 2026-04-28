import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { LeatherItem } from "../types";
import { Trash2, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = 'mandaras936@gmail.com';

export default function Admin() {
  const [user, loadingAuth] = useAuthState(auth);
  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [items, setItems] = useState<LeatherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingAuth) {
      if (isAdminUser) {
        fetchItems();
      } else {
        navigate("/");
      }
    }
  }, [isAdminUser, loadingAuth, navigate]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getItems();
      data.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
      setItems(data);
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY remove this item as an admin?")) return;
    
    setDeletingId(itemId);
    try {
      await api.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      alert("Success: Item has been permanently removed from the database.");
    } catch (err: any) {
      alert(`Deletion Failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]" />
        <p className="text-gray-400 font-serif italic">Loading admin records...</p>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-[3rem] border border-red-100 max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold italic mb-4">Access Denied</h2>
          <p>This administrative zone is restricted to authorized personnel only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Control Center</span>
          </div>
          <h1 className="text-5xl font-serif font-bold italic">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={fetchItems}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#5A5A40] transition-all text-gray-400 hover:text-[#5A5A40] shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Listings</p>
            <p className="text-3xl font-serif font-bold italic text-[#5A5A40]">{items.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl shadow-[#5A5A40]/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Seller UID</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-600">
                      {item.createdAt ? format(new Date(item.createdAt as any), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-mono text-gray-400 truncate max-w-[100px]" title={item.sellerId}>
                      {item.sellerId}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'sold' ? 'bg-green-100 text-green-700' :
                      item.status === 'recycling' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-900">₹{item.listedPrice}</p>
                  </td>
                  <td className="px-8 py-6 text-right font-medium">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className={`p-3 rounded-xl transition-all ${
                        deletingId === item.id 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Delete from database"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
