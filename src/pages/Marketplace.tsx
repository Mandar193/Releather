import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { LeatherItem } from "../types";
import ItemCard from "../components/ItemCard";
import { Search, SlidersHorizontal, PackageX, Loader2, DollarSign, ArrowRight, CreditCard, ShieldCheck, CheckCircle2, QrCode, Smartphone, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";

const ADMIN_EMAIL = 'mandaras936@gmail.com';

export default function Marketplace() {
  const [user] = useAuthState(auth);
  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [items, setItems] = useState<LeatherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [selectedItem, setSelectedItem] = useState<LeatherItem | null>(null);

  // Checkout States
  const [isCheckout, setIsCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [sortBy]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getItems();
      // Filter for marketplace only
      const marketItems = data.filter(i => i.status === 'marketplace');
      
      // Sorting
      marketItems.sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
        }
        if (sortBy === 'price-low') {
          return (a.listedPrice || 0) - (b.listedPrice || 0);
        }
        if (sortBy === 'price-high') {
          return (b.listedPrice || 0) - (a.listedPrice || 0);
        }
        return 0;
      });
      
      setItems(marketItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedItem || !user) return;
    
    setIsProcessing(true);
    try {
      await api.createTransaction({
        itemId: selectedItem.id,
        buyerId: user.uid,
        sellerId: selectedItem.sellerId,
        amount: selectedItem.listedPrice || 0
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setSelectedItem(null);
        setIsCheckout(false);
        setPaymentSuccess(false);
        fetchItems();
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to process transaction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminDelete = async (itemId: string) => {
    if (!confirm("ADMIN: Are you sure you want to delete this listing from the marketplace?")) return;
    
    setDeletingId(itemId);
    try {
      await api.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      setSelectedItem(null);
      alert("Admin Action Success: Product removed from database.");
    } catch (err: any) {
      alert(`Admin Action Failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const upiId = (import.meta as any).env.VITE_UPI_ID || "mandaras936@ybl";
  const upiLink = selectedItem ? `upi://pay?pa=${upiId}&pn=ReLeather&am=${selectedItem.listedPrice}&cu=INR` : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Visual Category Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 h-32 md:h-48">
        {[
          { label: 'Bags', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600' },
          { label: 'Jackets', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600' },
          { label: 'Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600' },
          { label: 'Accessories', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600' }
        ].map((cat, idx) => (
          <div key={idx} className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-[#5A5A40]/5">
            <img 
              src={cat.img} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="text-white font-serif font-bold italic text-base md:text-xl tracking-wider drop-shadow-lg">{cat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <header className="mb-12 space-y-6">
        <div>
          <h1 className="text-5xl font-serif font-bold italic mb-2 tracking-tight underline underline-offset-8 decoration-[#5A5A40]">Marketplace</h1>
          <p className="text-gray-500 font-medium">Verified pre-owned leather with full lifecycle transparent history.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#5A5A40] transition-colors" />
            <input
              type="text"
              placeholder="Search by title, brand, or material..."
              className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#5A5A40] transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-600 outline-none focus:border-[#5A5A40] transition-colors shadow-sm appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            <button className="flex items-center space-x-2 bg-white border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-600 hover:border-[#5A5A40] transition-colors shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-[#5A5A40] animate-spin" />
          <p className="text-gray-400 font-serif italic">Loading masterpieces...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <PackageX className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h3 className="text-2xl font-serif font-bold italic text-gray-300">No items found</h3>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Detail Overlay / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if(!isProcessing && !paymentSuccess) {
                setSelectedItem(null);
                setIsCheckout(false);
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            layoutId={selectedItem.id}
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden relative z-10 flex flex-col md:flex-row h-full max-h-[85vh] shadow-2xl"
          >
            <div className={`md:w-1/2 h-[300px] md:h-auto overflow-hidden bg-gray-100 transition-all ${isCheckout ? 'md:w-1/3' : 'md:w-1/2'}`}>
              <img src={selectedItem.images[0]} className="w-full h-full object-cover" />
            </div>
            
            <div className={`p-8 overflow-y-auto flex flex-col transition-all ${isCheckout ? 'md:w-2/3' : 'md:w-1/2'}`}>
              <AnimatePresence mode="wait">
                {!isCheckout ? (
                  <motion.div 
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 space-y-6"
                  >
                    <div>
                      <div className="flex items-center space-x-2 text-[#5A5A40] font-bold text-xs uppercase tracking-widest mb-2">
                        <DollarSign className="w-4 h-4" /> 
                        <span>Resale Listing</span>
                      </div>
                      <h2 className="text-4xl font-serif font-bold italic">{selectedItem.title}</h2>
                    </div>

                    {isAdminUser && (
                      <button 
                        disabled={deletingId === selectedItem.id}
                        onClick={() => handleAdminDelete(selectedItem.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors w-fit ${
                          deletingId === selectedItem.id
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {deletingId === selectedItem.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deletingId === selectedItem.id ? "Removing..." : "Admin: Remove Product"}
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f5f5f0] p-4 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] opacity-50">Condition</span>
                        <p className="font-bold font-serif italic text-lg">{selectedItem.aiAnalysis?.condition}</p>
                      </div>
                       <div className="bg-[#f5f5f0] p-4 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] opacity-50">Category</span>
                        <p className="font-bold font-serif italic text-lg">{selectedItem.category}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm uppercase tracking-widest border-b border-gray-100 pb-2">Lifecycle History</h4>
                      {selectedItem.lifecycleHistory.map((h, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-2 h-2 rounded-full bg-[#5A5A40] mt-1.5 shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold capitalize">{h.status}: </span>
                            <span className="text-gray-500 font-medium">{h.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#5A5A40]/5 p-6 rounded-2xl border border-[#5A5A40]/10">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Search className="w-3 h-3" />
                        AI Verification Notes
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{selectedItem.description}"</p>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Price</span>
                        <div className="flex items-center text-3xl font-serif font-bold italic text-[#1a1a1a]">
                          <DollarSign className="w-6 h-6 text-[#5A5A40]" />
                          <span>{selectedItem.listedPrice}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if(!user) {
                            alert("Please sign in to purchase items.");
                            return;
                          }
                          setIsCheckout(true);
                        }}
                        className="bg-[#5A5A40] text-white px-10 py-4 rounded-full font-bold hover:bg-[#4a4a35] transition-all flex items-center space-x-2"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="checkout"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="mb-8">
                      <button 
                        onClick={() => setIsCheckout(false)}
                        className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] mb-4 flex items-center gap-1 hover:underline"
                      >
                         <ArrowRight className="w-3 h-3 rotate-180" /> Back to Item
                      </button>
                      <h2 className="text-3xl font-serif font-bold italic">Checkout</h2>
                      <p className="text-gray-500 text-sm">Secure payment via Razorpay (UPI, Cards, Netbanking).</p>
                    </div>

                    {paymentSuccess ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                           <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold italic">Payment Submitted!</h3>
                        <p className="text-gray-500 max-w-xs">We've recorded your transaction. Once the seller confirms receipt of your deposit, the item status will be updated.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6 flex-1 flex flex-col items-center">
                          <div className="bg-white p-4 rounded-3xl border-2 border-[#5A5A40]/10 shadow-inner">
                            <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                          </div>
                          
                          <div className="text-center space-y-1">
                            <p className="font-bold text-lg">{upiId}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Scanning Price: ₹{selectedItem.listedPrice}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                              <Smartphone className="w-4 h-4 text-[#5A5A40] mb-1" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Scan to Pay</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                              <QrCode className="w-4 h-4 text-[#5A5A40] mb-1" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Any UPI App</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 w-full">
                             <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                             <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                Please scan the QR code using any UPI app (GPay, PhonePe, Paytm) to complete the transfer.
                             </p>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 mt-8">
                           <button 
                             disabled={isProcessing}
                             onClick={handleBuy}
                             className={`w-full py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                               isProcessing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#5A5A40] text-white hover:bg-[#4a4a35]'
                             }`}
                           >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <span>I have completed the payment</span>
                              )}
                           </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
