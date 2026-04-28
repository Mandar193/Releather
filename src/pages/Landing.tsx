import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Hammer, RotateCw, ShieldCheck } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";

export default function Landing() {
  const [user] = useAuthState(auth);
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 lg:px-8 text-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-xs font-display font-bold uppercase tracking-wider mb-8">
            <Leaf className="w-3 h-3" />
            <span>Join the Circular Revolution</span>
          </span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-[#1a1a1a] mb-8 leading-[0.9] tracking-tighter">
            Leather Reborn. <br/>
            <span className="text-[#5A5A40] italic">Responsibly.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-12 font-sans leading-relaxed">
            Upload your leather treasures. Our AI analyzes their condition and lists them for sale or recycling. Zero waste, pure craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to="/sell"
                className="w-full sm:w-auto px-8 py-4 bg-[#5A5A40] text-white rounded-full font-bold text-lg hover:bg-[#4a4a35] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-[#5A5A40]/20"
              >
                <span>Sell or Recycle Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-[#5A5A40] text-white rounded-full font-bold text-lg hover:bg-[#4a4a35] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-[#5A5A40]/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-8 py-4 border-2 border-[#5A5A40] text-[#5A5A40] rounded-full font-bold text-lg hover:bg-[#5A5A40]/5 transition-all flex items-center justify-center"
            >
              Shop Authentic Leather
            </Link>
          </div>
        </motion.div>

        {/* Floating Shapes / Atmosphere */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl">
          <div className="w-[800px] h-[800px] rounded-full bg-[#5A5A40]" />
        </div>
      </section>

      {/* Philosophy Loop */}
      <section className="bg-white py-24 border-y border-[#5A5A40]/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-[#f5f5f0] rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#5A5A40] transition-colors overflow-hidden">
              <RotateCw className="w-8 h-8 text-[#5A5A40] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4 italic">Circular Lifecycle</h3>
            <p className="text-gray-600">Every item is tracked from its first owner to its final recycling loop, ensuring nothing ever reaches a landfill.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-[#f5f5f0] rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#5A5A40] transition-colors">
              <ShieldCheck className="w-8 h-8 text-[#5A5A40] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4 italic">AI Verified</h3>
            <p className="text-gray-600">Our Gemini-powered vision AI assesses condition and authenticity markers to provide fair valuation instantly.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-[#f5f5f0] rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#5A5A40] transition-colors">
              <Hammer className="w-8 h-8 text-[#5A5A40] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4 italic">Bespoke Recycling</h3>
            <p className="text-gray-600">Items that can't be resold are routed to partner artisans who transform them into beautiful new accessories.</p>
          </div>
        </div>
      </section>

      {/* Visual Break */}
      <section className="relative h-[60vh] overflow-hidden bg-[#5A5A40]">
        <img 
          src="https://images.unsplash.com/photo-1547038577-da80abbc4f19?auto=format&fit=crop&q=80&w=2000" 
          alt="Leather craftmanship" 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          <h2 className="text-4xl md:text-6xl font-serif text-white max-w-3xl leading-tight">
            "Quality leather doesn't die. It just waits for its next chapter."
          </h2>
        </div>
      </section>
    </div>
  );
}
