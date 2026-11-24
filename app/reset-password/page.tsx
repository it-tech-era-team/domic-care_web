"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Lock, CheckCircle, ShieldAlert, ArrowRight, Loader2, Eye, EyeOff, Clock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyTokenAndSession = async () => {
      try {
        const tokenHash = searchParams.get("token_hash");
        const exp = searchParams.get("exp");

        // 1. Check 60-second expiration timestamp if present in query params
        if (exp) {
          const expirationTime = Number(exp);
          if (!isNaN(expirationTime) && Date.now() > expirationTime) {
            if (isMounted) {
              setError("This password reset link has expired (valid for 60 seconds). Please request a fresh reset link.");
              setIsExpired(true);
              setIsVerifying(false);
            }
            return;
          }
        }

        // 2. Direct OTP verification if token_hash is present
        if (tokenHash) {
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (otpError) {
            console.warn("[verifyOtp] Token verification failed:", otpError.message);
            if (isMounted) {
              setError("Invalid or expired password reset link. Please request a new one.");
              setIsExpired(true);
              setIsVerifying(false);
            }
            return;
          }

          if (isMounted) {
            setError("");
            setIsExpired(false);
            setIsVerifying(false);
          }
          return;
        }

        // 3. Fallback: Check if recovery access token is in URL hash or session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          const hash = typeof window !== "undefined" ? window.location.hash : "";
          if (!hash.includes("access_token")) {
            if (isMounted) {
              setError("Invalid or expired password reset link. Please request a new one.");
              setIsExpired(true);
              setIsVerifying(false);
            }
            return;
          }
        }

        if (isMounted) {
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error("[ResetPassword] Verification error:", err);
        if (isMounted) {
          setError("Failed to verify reset credentials. Please request a fresh link.");
          setIsExpired(true);
          setIsVerifying(false);
        }
      }
    };

    verifyTokenAndSession();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Fallback to server endpoint
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || json.error || "Failed to reset password.");
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
          <div className="text-center space-y-2 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your new secure password below to access your account.
            </p>
          </div>

          {/* Verifying Spinner */}
          {isVerifying && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Verifying secure recovery link...</p>
            </div>
          )}

          {/* Error / Expiry Alert */}
          {!isVerifying && error && (
            <div className="mb-5 space-y-3">
              <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {isExpired && (
                <Link
                  href="/forgot-password"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-black text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>Request Fresh 60s Reset Link</span>
                </Link>
              )}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 border border-emerald-200 animate-fade-in">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>Password successfully updated! Redirecting to login...</span>
            </div>
          )}

          {/* Reset Form */}
          {!isVerifying && !isExpired && !success && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-11 py-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-11 py-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Save Password</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-4 mt-4 border-t border-slate-100">
            <Link href="/login" className="text-xs font-bold text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
