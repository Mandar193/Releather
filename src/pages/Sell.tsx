import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, DollarSign, Leaf, BarChart3 } from "lucide-react";
import { analyzeLeatherProduct, suggestSustainabilityImpact } from "../lib/gemini";
import { AIAnalysis } from "../types";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Sell() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bags");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submittingRef = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeLeatherProduct(image);
      setAnalysis(result);
      const impactText = await suggestSustainabilityImpact(title || "leather product");
      setImpact(impactText);
    } catch (err: any) {
      console.error(err);
      alert(`Analysis failed: ${err.message || "Please try again."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleList = async (mode: 'marketplace' | 'recycling') => {
    if (!auth.currentUser || !analysis || submittingRef.current) {
      if (!auth.currentUser && !submittingRef.current) alert("Please sign in to list items.");
      return;
    }
    
    // Immediate lock
    submittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      // Capture data locally in case state changes
      const currentAnalysis = analysis;
      const currentImage = image;
      const currentTitle = title;
      const currentCategory = category;

      const itemData = {
        id: crypto.randomUUID(),
        sellerId: auth.currentUser.uid,
        title: currentTitle || "Classic Leather Item",
        description: currentAnalysis.notes,
        category: currentCategory,
        images: [currentImage!],
        aiAnalysis: currentAnalysis,
        listedPrice: mode === 'marketplace' ? currentAnalysis.suggestedPrice : 0,
        status: mode === 'marketplace' ? ('marketplace' as any) : ('recycling' as any),
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any
      };

      // Add via API
      await api.createItem(itemData);
      
      // Success: Clear all analysis states to prevent extra clicks
      setAnalysis(null);
      setImage(null);
      setTitle("");
      setIsSuccess(true);
      
      // Final navigation
      setTimeout(() => navigate('/marketplace'), 1500);
    } catch (err) {
      console.error(err);
      // Re-enable only on failure
      submittingRef.current = false;
      setIsSubmitting(false);
      alert("Failed to list item. Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative">
      {isSubmitting && !isSuccess && (
        <div className="fixed inset-0 bg-[#5A5A40]/10 backdrop-blur-[2px] z-[100] flex items-center justify-center pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-[#5A5A40]/20"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#5A5A40]" />
            <span className="font-bold text-[#5A5A40] italic">Listing your item...</span>
          </motion.div>
        </div>
      )}
      <div className="mb-16 rounded-[3rem] overflow-hidden relative h-[300px] group shadow-2xl shadow-[#5A5A40]/10 bg-[#3d3d29]">
        <img 
          src="https://images.unsplash.com/photo-1521111756587-0dfc0dd48b28?auto=format&fit=crop&q=80&w=2000" 
          alt="Leather craft materials" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/95 via-[#121212]/30 to-transparent flex items-end p-8 md:p-12">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-serif font-bold italic mb-3 tracking-tight">Reclaim. Resell. Recycle.</h1>
            <p className="text-white/80 max-w-md font-sans text-sm md:text-base leading-relaxed font-medium">
              Our AI vision analyzes your leather treasure to find its fair value and ensures it never sees a landfill.
            </p>
          </div>
        </div>
      </div>

      <header className="mb-12 text-center sr-only">
        <h1 className="text-4xl font-serif font-bold mb-4 italic">List Your Item</h1>
        <p className="text-gray-600">Our AI identifies your leather product's condition and fair market value.</p>
      </header>

      {isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl border-2 border-[#5A5A40] text-center"
        >
          <div className="w-20 h-20 bg-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-white w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2 italic">Successfully Listed!</h2>
          <p className="text-gray-500">Redirecting to marketplace...</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Upload */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-500">1. Basic Details</label>
              <input
                type="text"
                placeholder="Product Title (e.g. Vintage Leather Satchel)"
                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-[#5A5A40] transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select 
                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-[#5A5A40] transition-colors appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Bags</option>
                <option>Shoes</option>
                <option>Jackets</option>
                <option>Accessories</option>
                <option>Furniture</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-500">2. Item Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                  image ? 'border-[#5A5A40]' : 'border-gray-300 hover:border-[#5A5A40] bg-white'
                }`}
              >
                {image ? (
                  <img src={image} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-gray-300 mb-4" />
                    <span className="text-gray-500 font-medium">Click to upload photo</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>

            {!analysis && (
              <button
                onClick={runAIAnalysis}
                disabled={!image || isAnalyzing}
                className={`w-full py-5 rounded-full font-bold text-lg flex items-center justify-center space-x-3 transition-colors ${
                  !image || isAnalyzing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#5A5A40] text-white hover:bg-[#4a4a35]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>AI is Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span>Run AI Valuation</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Results */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-8 sticky top-28"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Condition</span>
                      <h3 className="text-3xl font-serif font-bold italic">{analysis.condition}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Suggested Value</span>
                      <div className="flex items-center text-3xl font-serif font-bold italic text-green-700">
                        <DollarSign className="w-6 h-6" />
                        <span>{analysis.suggestedPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center space-x-2">
                       <AlertCircle className="w-4 h-4 text-[#5A5A40]" />
                       <span>Expert Insights</span>
                    </h4>
                    <p className="text-gray-600 leading-relaxed italic border-l-4 border-[#5A5A40] pl-4">
                      "{analysis.notes}"
                    </p>
                  </div>

                  {impact && (
                    <div className="bg-[#5A5A40]/5 p-6 rounded-2xl flex items-start space-x-4">
                      <Leaf className="w-6 h-6 text-[#5A5A40] shrink-0" />
                      <div className="text-sm text-[#5A5A40]">
                        <p className="font-bold mb-1 italic text-base">Environmental Impact</p>
                        <p className="opacity-80 leading-relaxed font-medium">{impact}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={() => handleList('marketplace')}
                      disabled={isSubmitting}
                      className={`bg-[#5A5A40] text-white py-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4a4a35]'
                      }`}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>List for Resale</span>
                    </button>
                    <button
                      onClick={() => handleList('recycling')}
                      disabled={isSubmitting}
                      className={`border-2 border-[#5A5A40] text-[#5A5A40] py-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5A5A40]/5'
                      }`}
                    >
                      <span>Go to Recycling</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div key="placeholder" className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
                  <BarChart3 className="w-16 h-16 text-gray-200 mb-6" />
                  <p className="text-gray-400 font-medium italic">Upload a photo to see <br/> AI analysis and impact tracking</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
