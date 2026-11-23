import React from 'react';
import { X, Phone, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { NATIONAL_HELPLINES } from '../data/constants';

interface HelplineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplineDrawer: React.FC<HelplineDrawerProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Phone className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                National Government Helplines
              </h3>
              <p className="text-[11px] text-rose-200">
                Official 24x7 Toll-Free Citizen Assistance Lines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Helplines List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              All helplines listed below are toll-free government numbers. You can click on the phone numbers to dial directly from your mobile device.
            </p>
          </div>

          <div className="space-y-2.5">
            {NATIONAL_HELPLINES.map((hl, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-rose-300 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {hl.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {hl.purpose}
                  </p>
                </div>

                <a
                  href={`tel:${hl.number.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{hl.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Government of India Official Helplines</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
