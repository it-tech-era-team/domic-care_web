'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, X, ShieldCheck, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Tw5XBLzyP8rgUyOrAwvUOk5cxqEWrk0rkBjnNxCb6rf1Vy1TCroujec5hNwYA7BQ856QaYUqwtiOm7gKwlgtmow002JMZ5pEk';
const stripePromise = loadStripe(publishableKey);

const customAppearance = {
  theme: 'flat' as const,
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#e11d48',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    spacingUnit: '4px',
    borderRadius: '16px',
    colorTextPlaceholder: '#94a3b8',
  },
  rules: {
    '.Input': {
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      boxShadow: 'none',
      fontSize: '14px',
      padding: '12px 14px',
      borderRadius: '14px',
      color: '#0f172a',
      transition: 'all 0.2s ease',
    },
    '.Input:focus': {
      border: '1px solid #2563eb',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
    },
    '.Label': {
      fontWeight: '700',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#475569',
      marginBottom: '6px',
    },
    '.Tab': {
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      backgroundColor: '#ffffff',
      fontWeight: '600',
      padding: '10px 14px',
    },
    '.Tab--selected': {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
    },
  },
};

interface StripePaymentModalProps {
  bookingId: string;
  serviceName: string;
  caregiverName: string;
  startDate: string;
  onSuccess: () => void;
  onClose: () => void;
}

function CheckoutForm({
  bookingId,
  totalAmountUSD,
  platformFeeUSD,
  caregiverPayoutUSD,
  onSuccess,
  onClose,
}: {
  bookingId: string;
  totalAmountUSD: number;
  platformFeeUSD: number;
  caregiverPayoutUSD: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Payment form error');
      setSubmitting(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/user/bookings?paid=${bookingId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try another card.');
      setSubmitting(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const patchRes = await fetch(`/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'accepted',
            paymentStatus: 'paid',
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (patchRes.ok) {
          onSuccess();
        } else {
          onSuccess();
        }
      } catch (err) {
        console.error('Error updating booking payment status:', err);
        onSuccess();
      }
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Summary */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span>Booking Service Fee</span>
          <span className="text-slate-900 font-extrabold">${totalAmountUSD.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-200/70 pt-2.5">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            Platform Protection & Escrow Guarantee
          </span>
          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Protected
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200/70 pt-3">
          <span>Total Amount Due Now</span>
          <span className="text-blue-600 text-base sm:text-lg">${totalAmountUSD.toFixed(2)} USD</span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200/80 animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Element Container */}
      <div className="p-4 sm:p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            Payment Details
          </span>
          <span className="text-[10px] font-bold text-slate-400">Cards Accepted</span>
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'never',
              googlePay: 'never',
            },
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || submitting}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Pay ${totalAmountUSD.toFixed(2)} USD</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 justify-center pt-1">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted & Guaranteed Secure</span>
        </div>
      </div>
    </form>
  );
}

export default function StripePaymentModal({
  bookingId,
  serviceName,
  caregiverName,
  startDate,
  onSuccess,
  onClose,
}: StripePaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [totalAmountUSD, setTotalAmountUSD] = useState(0);
  const [platformFeeUSD, setPlatformFeeUSD] = useState(0);
  const [caregiverPayoutUSD, setCaregiverPayoutUSD] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Periodically clean up any floating Stripe Link badge element injected into body
    const cleanupBadges = () => {
      const fixedElements = document.querySelectorAll('body > div, body > iframe');
      fixedElements.forEach((el) => {
        const style = el.getAttribute('style') || '';
        const html = el.outerHTML || '';
        if (
          (style.includes('bottom') || style.includes('fixed')) &&
          (html.includes('stripe') || html.includes('Stripe') || html.includes('link.stripe.com'))
        ) {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
          (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
        }
      });
    };

    cleanupBadges();
    const interval = setInterval(cleanupBadges, 250);

    return () => {
      document.body.style.overflow = prevOverflow;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const initPaymentIntent = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || 'Failed to initialize payment.');
        } else {
          setClientSecret(data.clientSecret);
          setTotalAmountUSD(data.totalAmountUSD);
          setPlatformFeeUSD(data.platformFeeUSD);
          setCaregiverPayoutUSD(data.caregiverPayoutUSD);
        }
      } catch (err) {
        console.error('Error initiating payment:', err);
        setError('Network error initializing payment session.');
      } finally {
        setLoading(false);
      }
    };

    initPaymentIntent();
  }, [bookingId]);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative text-slate-900 my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Confirm & Complete Payment</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Caregiver <span className="font-extrabold text-slate-900">{caregiverName}</span> • {serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Preparing secure checkout session...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200/80">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: customAppearance }}>
            <CheckoutForm
              bookingId={bookingId}
              totalAmountUSD={totalAmountUSD}
              platformFeeUSD={platformFeeUSD}
              caregiverPayoutUSD={caregiverPayoutUSD}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


