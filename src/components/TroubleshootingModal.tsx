import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Smartphone,
  Lock,
  Upload,
  CreditCard,
  SearchCheck
} from 'lucide-react';
import { TROUBLESHOOTING_ISSUES } from '../services/troubleshootingData';
import { TroubleshootingIssue } from '../types';

interface TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskTroubleshooting: (query: string) => void;
}

export const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({
  isOpen,
  onClose,
  onAskTroubleshooting
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(TROUBLESHOOTING_ISSUES[0].id);
  const [customProblem, setCustomProblem] = useState('');

  if (!isOpen) return null;

  const currentIssue = TROUBLESHOOTING_ISSUES.find(i => i.id === selectedIssueId) || TROUBLESHOOTING_ISSUES[0];

  const categoryIcons: Record<string, React.ReactNode> = {
    otp: <Smartphone className="w-4 h-4 text-orange-600" />,
    login: <Lock className="w-4 h-4 text-blue-600" />,
    upload: <Upload className="w-4 h-4 text-purple-600" />,
    payment_dbt: <CreditCard className="w-4 h-4 text-emerald-600" />,
    status: <SearchCheck className="w-4 h-4 text-cyan-600" />
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProblem.trim()) return;
    onAskTroubleshooting(customProblem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Government Portal Application Troubleshooting Hub
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Step-by-step diagnostic solutions for OTP errors, DBT payments, document rejection & delays.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issue Selector Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 text-xs font-semibold no-scrollbar">
          {TROUBLESHOOTING_ISSUES.map((issue) => {
            const isSelected = issue.id === selectedIssueId;
            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-emerald-900 border border-emerald-300 shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {categoryIcons[issue.category]}
                <span>{issue.title.split('/')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Issue Details Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Issue Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Problem Guide
              </span>
              <span className="text-xs text-slate-500">
                Verified Portal Workaround
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {currentIssue.title}
            </h3>
          </div>

          {/* Symptoms Card */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Common Symptoms You May Be Facing</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-950">
              {currentIssue.symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step-by-Step Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step-by-Step Resolution Steps
            </h4>

            <div className="space-y-2.5">
              {currentIssue.solutions.map((sol, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {sol}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Official Links */}
          {currentIssue.helplineOrLinks && currentIssue.helplineOrLinks.length > 0 && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Direct Verification Portals</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentIssue.helplineOrLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ask custom problem form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Is your specific issue not listed?
            </h4>
            <form onSubmit={handleSendCustom} className="flex gap-2">
              <input
                type="text"
                placeholder="Describe your error (e.g. 'Payment rejected reason FTO inactive on PM Kisan')..."
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Ask Bot</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs px-6">
          <button
            onClick={() => {
              onClose();
              onAskTroubleshooting(`Troubleshoot: ${currentIssue.title}`);
            }}
            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Ask SchemeSathi about {currentIssue.title.split('/')[0]} in Chat</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
