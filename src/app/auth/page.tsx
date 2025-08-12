"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import SignInForm from "@/components/auth/sign-in-page";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, Info, Mail, Check } from "lucide-react";
import { useState } from "react";

function ForgotPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Reset link sent! Please check your email.");
        setEmail("");
        onClose();
      } else {
        toast.error(data.error || "Failed to send reset link.");
      }
    } catch {
      toast.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Forgot Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-3 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle error parameters from NextAuth
    const error = searchParams?.get("error");
    const message = searchParams?.get("message");
    
    if (error === "Callback") {
      toast.error("Account not found. Please purchase coins to create your account.");
    }
    
    if (message === "account_created") {
      toast.success("Your account has been created successfully! Please check your email for login instructions.");
    }
    
    if (message === "password_reset_success") {
      toast.success("Password updated successfully! You can now sign in with your new password.");
    }
  }, [searchParams]);
  
  const message = searchParams?.get("message");
  const showAccountCreatedNotice = message === "account_created";
  const showPasswordResetSuccess = message === "password_reset_success";
  const [forgotOpen, setForgotOpen] = useState(false);

  return (
    <>
      {showAccountCreatedNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  Account Successfully Created!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200 mb-3">
                  Your account has been created. Please check your email for login instructions.
                </p>
                <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Check your inbox for details</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showPasswordResetSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  Password Updated Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200">
                  You can now sign in with your new password.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Payment Notice Banner (only show if not showing account created notice) */}
      {!showAccountCreatedNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  New to NotesAcademy?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                  Purchase coins first to create your account and start generating AI-powered study materials.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors group"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  View Pricing Plans
                  <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <SignInForm />
      <div className="w-full max-w-md flex justify-end mt-2">
        <button
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          type="button"
          onClick={() => setForgotOpen(true)}
        >
          Forgot password?
        </button>
      </div>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      
      {/* Additional Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-center max-w-md"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Simply sign in above
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Accounts are created automatically after your first purchase
        </p>
      </motion.div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <div className="w-full max-w-md mb-6">
        <div className="h-24 bg-slate-800 rounded-lg animate-pulse"></div>
      </div>
      <div className="w-full max-w-md">
        <div className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
      </div>
      <div className="mt-6 text-center max-w-md">
        <div className="h-4 bg-slate-800 rounded mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-800 rounded animate-pulse"></div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Suspense fallback={<LoadingFallback />}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
