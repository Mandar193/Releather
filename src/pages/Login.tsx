import { motion } from "motion/react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Hammer, Leaf, ShieldCheck, ArrowRight, LogIn, Loader2 } from "lucide-react";
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

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else {
        setError(err.message || "Google Authentication failed");
      }
    } finally {
      setIsGoogleLoading(false);
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
      console.error("Auth error:", err.code, err.message);
      if (err.code === "auth/operation-not-allowed") {
        setError("Sign-in method not enabled. Please enable 'Email/Password' in your Firebase Console.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. If you don't have an account, please click 'Sign Up' below.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please Sign In instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
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
          <div className="mb-8 text-center">
            <div className="flex bg-[#f5f5f0] p-1 rounded-2xl mb-6">
              <button 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isSignUp ? 'bg-white shadow-sm text-[#5A5A40]' : 'text-gray-400'}`}
              >
                SIGN IN
              </button>
              <button 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isSignUp ? 'bg-white shadow-sm text-[#5A5A40]' : 'text-gray-400'}`}
              >
                SIGN UP
              </button>
            </div>
            <h2 className="text-3xl font-serif font-bold italic text-[#1a1a1a] mb-2">
              {isSignUp ? "Join the Circle" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {isSignUp ? "Start your circular leather journey" : "Continue your circular leather journey"}
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
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 py-4 px-6 rounded-2xl hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#5A5A40]" />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span className="font-bold text-[#1a1a1a] group-hover:text-[#5A5A40]">
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </span>
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
