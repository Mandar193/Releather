import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Sell from "./pages/Sell";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function App() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Leather Lover",
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            sustainabilityScore: {
              itemsResold: 0,
              itemsRecycled: 0,
              co2Saved: 0,
            },
            role: "user",
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-[#5A5A40] selection:text-white">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
