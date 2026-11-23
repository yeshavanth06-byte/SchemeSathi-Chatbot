import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ExternalLink, 
  Filter, 
  ShieldCheck, 
  Building, 
  Sliders,
  Send,
  ArrowRight
} from 'lucide-react';
import { Scheme, SchemeCategory } from '../types';
import { SCHEMES_DATABASE } from '../data/schemes';
import { CATEGORY_METADATA } from '../data/constants';

interface SchemesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScheme: (scheme: Scheme) => void;
  onAskAboutScheme: (scheme: Scheme) => void;
}

export const SchemesCatalogModal: React.FC<SchemesCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectScheme,
  onAskAboutScheme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Central' | 'State'>('All');

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'All Schemes', count: SCHEMES_DATABASE.length, icon: '🏛️' },
    { key: 'agriculture', label: 'Agriculture', count: SCHEMES_DATABASE.filter(s => s.category === 'agriculture').length, icon: '🌾' },
    { key: 'health', label: 'Healthcare', count: SCHEMES_DATABASE.filter(s => s.category === 'health').length, icon: '🏥' },
    { key: 'education', label: 'Scholarships', count: SCHEMES_DATABASE.filter(s => s.category === 'education').length, icon: '🎓' },
    { key: 'women_child', label: 'Women & Child', count: SCHEMES_DATABASE.filter(s => s.category === 'women_child').length, icon: '👩' },
    { key: 'business_msme', label: 'Business & Loans', count: SCHEMES_DATABASE.filter(s => s.category === 'business_msme').length, icon: '💼' },
    { key: 'housing', label: 'Housing & Clean Energy', count: SCHEMES_DATABASE.filter(s => s.category === 'housing').length, icon: '🏠' },
    { key: 'social_security', label: 'Social Security', count: SCHEMES_DATABASE.filter(s => s.category === 'social_security').length, icon: '🛡️' },
    { key: 'food_welfare', label: 'Food Welfare', count: SCHEMES_DATABASE.filter(s => s.category === 'food_welfare').length, icon: '🍚' }
  ];

  const filteredSchemes = SCHEMES_DATABASE.filter((scheme) => {
    // Category match
    if (selectedCategory !== 'all' && scheme.category !== selectedCategory) {
      return false;
    }

    // Level match
    if (levelFilter !== 'All' && scheme.level !== levelFilter) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = scheme.name.toLowerCase().includes(q);
      const matchShort = scheme.shortName.toLowerCase().includes(q);
      const matchDesc = scheme.description.toLowerCase().includes(q);
      const matchMinistry = scheme.ministry.toLowerCase().includes(q);
      const matchTags = scheme.tags.some(t => t.toLowerCase().includes(q));
      return matchName || matchShort || matchDesc || matchMinistry || matchTags;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Official Database
              </span>
              <span className="text-xs text-slate-300">
                Verified Welfare Initiatives
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Government Schemes Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Explore {SCHEMES_DATABASE.length} central and state welfare programs with full eligibility criteria and document lists.
            </p>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by scheme name, ministry, keyword (e.g. Kisan, Ayushman, ₹6000, solar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Level Toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              {(['All', 'Central', 'State'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    levelFilter === lvl
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Category Horizontal Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all font-medium ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Showing {filteredSchemes.length} of {SCHEMES_DATABASE.length} Schemes
            </span>
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">No schemes found matching "{searchQuery}"</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for broader keywords like "loan", "farmer", "health", or clear your filter.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchemes.map((scheme) => {
                const meta = CATEGORY_METADATA[scheme.category] || { icon: '🏛️', label: scheme.category };
                return (
                  <div
                    key={scheme.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {scheme.level}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-900 transition-colors line-clamp-1">
                          {scheme.name}
                        </h3>
                        <span className="text-xs font-bold text-orange-600 block mb-1">
                          {scheme.shortName}
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {scheme.tagline}
                        </p>
                      </div>

                      {/* Benefit amount highlight */}
                      {scheme.benefitAmount && (
                        <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <span>💰</span>
                          <span className="truncate">{scheme.benefitAmount}</span>
                        </div>
                      )}

                      {/* Ministry */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{scheme.ministry}</span>
                      </div>
                    </div>

                    {/* Bottom action buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectScheme(scheme);
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onAskAboutScheme(scheme);
                        }}
                        className="p-1.5 text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                        title="Discuss in Chat"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Open Official Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Catalog Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All scheme links point to official Ministry & State portals (.gov.in / .nic.in).</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
