import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, ShieldCheck, Check } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'How does SoundPay Pro announce payments aloud?',
      a: 'Whenever a customer scans your counter QR code or pays via payment gateway, the payment gateway sends a secure webhook to your SoundPay Pro server. The backend verifies the HMAC-SHA256 signature, ensures the transaction has not already been announced, saves the record, and prompts the soundbox engine to ring the bell and speak the announcement in Hindi or English.',
    },
    {
      q: 'Why does the speaker sometimes say "Aapko 500 rupaye prapt hue hain" without mentioning a sender name?',
      a: 'SoundPay Pro enforces strict Anti-Fraud & Anti-Fabrication standards. Certain banks and UPI apps do not disclose the payer name in webhook payloads due to user privacy settings. SoundPay Pro NEVER guesses, invents, or fabricates a sender identity. If legitimate sender data is omitted by the bank, SoundPay announces the verified amount accurately.',
    },
    {
      q: 'Can SoundPay announce fake screenshot payments or SMS scams?',
      a: 'No! Unlike apps that attempt to scrape screenshots or intercept SMS, SoundPay Pro operates exclusively through cryptographic server-to-server gateway webhooks. Client-side fake screenshots and forged payloads cannot pass HMAC-SHA256 signature verification.',
    },
    {
      q: 'Can I connect this phone to an external Bluetooth speaker on my shop counter?',
      a: 'Yes. Simply pair your Android device or counter tablet with any standard Bluetooth speaker or 3.5mm AUX speaker. SoundPay Pro will broadcast payment announcements through the connected speaker at maximum clarity.',
    },
    {
      q: 'How do I test transactions before opening my store?',
      a: 'Use the "Payment Gateway Sandbox Simulator" button (+ Test Payment) in the top bar. You can test preset payments like "₹500 from Rahul" or "₹1,500 from Priya" with instant voice verification.',
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setMessage('');
      setTicketSent(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Help & Merchant Support
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Frequently asked questions, soundbox setup guides, and direct assistance
        </p>
      </div>

      {/* FAQs */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 mb-2">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-3.5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between gap-3 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="p-3.5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Card */}
      <form onSubmit={handleSendTicket} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200">
            Need Help with Gateway Webhooks or Soundbox?
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Our fintech engineering team is ready to help verify your Razorpay, Cashfree, or UPI webhook setup.
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Describe your issue or question
          </label>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Need assistance testing Razorpay test webhook signature..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none"
          />
        </div>

        {ticketSent && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Support ticket dispatched. A merchant specialist will respond shortly.</span>
          </div>
        )}

        <button
          type="submit"
          className="min-h-[44px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-500/20"
        >
          Submit Support Request
        </button>
      </form>
    </div>
  );
};
