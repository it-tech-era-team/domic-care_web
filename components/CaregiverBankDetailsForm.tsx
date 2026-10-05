'use client';

import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface BankDetails {
  stripeAccountId: string | null;
  bankName: string;
  accountHolderName: string;
  routingNumber: string;
  accountNumberLast4: string;
  payoutsEnabled: boolean;
}

export default function CaregiverBankDetailsForm() {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    stripeAccountId: null,
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    accountNumberLast4: '',
    payoutsEnabled: false,
  });

  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current caregiver bank details on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/stripe/caregiver-bank');
        if (res.ok) {
          const data = await res.json();
          if (data.bankDetails) {
            setBankDetails(data.bankDetails);
            setBankName(data.bankDetails.bankName || '');
            setAccountHolderName(data.bankDetails.accountHolderName || '');
          }
        }
      } catch (err) {
        console.error('Error loading bank details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!bankName.trim() || !accountHolderName.trim() || !routingNumber.trim() || !accountNumber.trim()) {
      setError('Please fill in all bank account details.');
      return;
    }

    if (routingNumber.trim().length !== 9) {
      setError('US Routing number must be exactly 9 digits.');
      return;
    }

    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setError('Account number and confirmation do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/stripe/caregiver-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountHolderName: accountHolderName.trim(),
          routingNumber: routingNumber.trim(),
          accountNumber: accountNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to save bank details.');
      } else {
        setSuccessMsg('Bank account connected successfully to Stripe! Payouts enabled.');
        setBankDetails(data.bankDetails);
        setAccountNumber('');
        setConfirmAccountNumber('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Submit bank error:', err);
      setError('An unexpected error occurred while saving bank details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading payout settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-900 animate-fade-in">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Direct Bank Payout Status</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {bankDetails.payoutsEnabled
                ? `Connected to ${bankDetails.bankName || 'Bank Account'} ending in ****${bankDetails.accountNumberLast4}`
                : 'No bank account connected yet for direct payouts.'}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
            bankDetails.payoutsEnabled
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}
        >
          {bankDetails.payoutsEnabled ? 'Stripe Active' : 'Setup Required'}
        </span>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-blue-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">How payouts work on Domicare:</p>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            When a client books a session and you mark it as <span className="font-black">Completed</span>, Stripe automatically transfers your payout (<span className="font-black">88%</span> of total booking fee) directly to this bank account. The <span className="font-black">12% platform fee</span> is retained automatically.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bank Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Financial Institution / Bank Name
            </label>
            <div className="relative">
              <Building2 className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
              <input
                type="text"
                required
                placeholder="e.g. Chase, Bank of America, Wells Fargo"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Account Holder Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Account Holder Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Full name as printed on your bank statement"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Routing Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Routing Number (9 Digits)
            </label>
            <div className="relative">
              <CreditCard className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
              <input
                type="text"
                required
                maxLength={9}
                placeholder="9-digit routing number"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Account Number
            </label>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
              <input
                type="password"
                required
                placeholder="Bank account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Confirm Account Number */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Confirm Account Number
            </label>
            <input
              type="text"
              required
              placeholder="Re-enter bank account number"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 rounded-2xl nav-pill-active py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer block hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {submitting ? 'Connecting Bank Account...' : 'Save & Connect Bank Payout Account'}
        </button>
      </form>
    </div>
  );
}
