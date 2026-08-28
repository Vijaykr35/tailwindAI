"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/LoginModal";
import { Sparkles, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "Lightning Fast",
      description: "Powered by edge computing for instantaneous responses and fluid interactions."
    },
    {
      icon: <Shield className="w-6 h-6 text-fuchsia-400" />,
      title: "Secure by Design",
      description: "Your data is encrypted end-to-end. We believe privacy is a fundamental right."
    },
    {
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      title: "Omnipresent",
      description: "Access your intelligence across all devices. Syncs seamlessly in real-time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07010f] text-white flex flex-col font-sans selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      {/* Deep cosmic purple glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation */}
      <header className="w-full z-40 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto backdrop-blur-sm border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-2 font-medium text-lg tracking-wide text-purple-50">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Tailwind AI</span>
        </div>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors uppercase tracking-wider px-4 py-2 rounded-full hover:bg-white/5"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-20 relative z-10 px-6">
        <div className="max-w-4xl w-full text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/20 text-xs font-medium text-purple-200 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            System Online
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Beyond <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400">
              Intelligence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-purple-200/50 max-w-xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            A minimalist sanctuary for your thoughts. 
            Connect with Tailwind AI and explore the universe of ideas.
          </p>
          
          <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="group flex items-center gap-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-white px-8 py-4 rounded-full text-sm font-medium transition-all backdrop-blur-md hover:border-purple-500/60 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
            >
              Try now
              <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white/90">{feature.title}</h3>
              <p className="text-purple-200/40 text-sm leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-sm text-purple-200/30 mt-auto relative z-10">
        <p>© {new Date().getFullYear()} Tailwind AI. All rights reserved.</p>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}
