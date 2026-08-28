"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      login(); // update global auth state
      
      // Close modal after showing success state and redirect
      setTimeout(() => {
        onClose();
        router.push("/chat");
        // Reset state for next open
        setTimeout(() => setIsSuccess(false), 300);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07010f]/80 backdrop-blur-md transition-all p-4">
      <div className="relative w-full max-w-sm p-8 bg-[#0a0216] rounded-3xl shadow-2xl border border-purple-500/20 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-purple-500/10 blur-[50px] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-purple-200/40 hover:text-white transition-colors z-10"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-400 mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
            <h2 className="text-2xl font-semibold text-white tracking-tight">Access Granted</h2>
            <p className="text-purple-200/50 mt-2 text-sm font-light">Redirecting to your workspace...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-8 text-purple-300 relative z-10">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium tracking-wide">Tailwind AI</span>
            </div>

            <h2 className="text-3xl font-semibold mb-2 text-white tracking-tight relative z-10">
              {isLogin ? "Welcome" : "Join us"}
            </h2>
            <p className="text-purple-200/50 mb-8 text-sm font-light relative z-10">
              {isLogin
                ? "Enter your coordinates to resume."
                : "Begin your journey into the cosmos."}
            </p>

            <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder:text-purple-200/30 text-sm disabled:opacity-50"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder:text-purple-200/30 text-sm disabled:opacity-50"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder:text-purple-200/30 text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-6 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/50 text-white font-medium transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Authenticating..." : (isLogin ? "Sign In" : "Sign Up")}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-purple-200/40 relative z-10">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsLogin(!isLogin)}
                className="hover:text-purple-300 transition-colors disabled:opacity-50"
              >
                {isLogin ? "Create an account" : "Sign in to existing account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
