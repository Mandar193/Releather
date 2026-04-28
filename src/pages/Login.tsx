import { motion } from "motion/react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Hammer, Leaf, ShieldCheck, ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";

export default function Login() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        const { createUserWithEmailAndPassword } = await import("firebase/auth");
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed") {
        setError("Sign-in method not enabled. Please enable 'Email/Password' in your Firebase Console (Authentication > Sign-in method).");
      } else {
        setError(err.message || "Authentication failed");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Left Side: Brand Story */}
      <div className="lg:w-1/2 bg-[#5A5A40] relative overflow-hidden flex flex-col justify-center p-12 lg:p-24 text-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <Hammer className="w-8 h-8" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-serif font-bold italic leading-tight mb-8">
            One Material.<br/>
            Infinite <span className="underline decoration-white/30">Journeys.</span>
          </h1>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1 shrink-0">
                <Leaf className="w-3 h-3" />
              </div>
              <p className="text-lg opacity-80 font-serif italic text-white/90">
                For the <span className="font-bold">Sustainability Seekers</span>: Track every gram of CO2 you save.
              </p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <p className="text-lg opacity-80 font-serif italic text-white/90">
                For the <span className="font-bold">Collectors</span>: Buy verified, AI-authenticated pre-owned leather gems.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side: Login Actions */}
      <div className="lg:w-1/2 bg-[#f5f5f0] flex items-center justify-center p-8 lg:p-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-xl shadow-[#5A5A40]/5 border border-[#5A5A40]/5 flex flex-col text-center"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-serif font-bold italic text-[#1a1a1a] mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-400 font-medium">
              {isSignUp ? "Sign up to join the circular economy" : "Choose your gateway to the circular economy"}
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1 leading-none">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f5f5f0] border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1 leading-none">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f5f5f0] border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 px-1">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold hover:bg-[#5A5A40] transition-colors shadow-lg shadow-black/5"
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </button>
              
              <p className="text-center text-xs text-gray-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#5A5A40] font-bold hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-300 bg-white px-4">
                Or continue with
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-4 bg-white border border-gray-200 py-4 px-6 rounded-2xl hover:border-[#5A5A40] transition-all group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span className="font-bold text-[#1a1a1a] group-hover:text-[#5A5A40]">Google Account</span>
            </button>
          </div>

          <div className="bg-[#f5f5f0] p-6 rounded-2xl text-left border border-[#5A5A40]/10">
            <div className="flex items-center space-x-2 text-[#5A5A40] mb-3">
              <LogIn className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Why authenticate?</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed italic">
              Authentication allows us to track the <span className="text-[#5A5A40] font-bold">Product Lifecycle</span> accurately and credit you with environmental impact points for reselling or recycling.
            </p>
          </div>
          
          <p className="mt-8 text-xs text-gray-400 font-medium">
            By continuing, you agree to ReLeather's circular economy terms and privacy preservation policies.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
