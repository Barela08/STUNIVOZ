import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Map, Search, FileText, Download, ChevronDown, ChevronUp,
  BookOpen, Code2, Palette, TrendingUp, Database, Shield, Cpu, Globe,
  Megaphone, BarChart2, Layers, Lightbulb, X, Clock, Tag, Eye
} from 'lucide-react';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  pdfUrl?: string;
  pdfName?: string;
  coverColor?: string;
  icon?: string;
  duration?: string;
  level?: string;
  tags?: string[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  'Software Engineering': { icon: Code2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  'Data Science': { icon: Database, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  'UI/UX Design': { icon: Palette, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
  'Marketing': { icon: Megaphone, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  'Finance': { icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  'Cybersecurity': { icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  'AI / ML': { icon: Cpu, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  'Analytics': { icon: BarChart2, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' },
  'Product Management': { icon: Layers, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  'Web Development': { icon: Globe, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
  'General': { icon: BookOpen, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-700' },
};

const DEFAULT_META = { icon: Lightbulb, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' };

const LEVEL_BADGE: Record<string, string> = {
  Beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  Advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const PDFViewerModal: React.FC<{ url: string; name: string; onClose: () => void }> = ({ url, name, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={url} download={name} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium transition-all">
            <Download className="w-3.5 h-3.5" /> Download
          </a>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${url}#toolbar=1`}
          title={name}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  </div>
);

const RoadmapCard: React.FC<{ roadmap: Roadmap }> = ({ roadmap }) => {
  const [expanded, setExpanded] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const meta = CATEGORY_META[roadmap.category] || DEFAULT_META;
  const Icon = meta.icon;

  return (
    <>
      {showPDF && roadmap.pdfUrl && (
        <PDFViewerModal url={roadmap.pdfUrl} name={roadmap.pdfName || 'Roadmap.pdf'} onClose={() => setShowPDF(false)} />
      )}
      <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${meta.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
        {/* Card Header */}
        <div className={`${meta.bg} px-5 py-4 border-b ${meta.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${meta.color}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate">{roadmap.title}</h3>
                <span className={`text-xs font-medium ${meta.color}`}>{roadmap.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {roadmap.level && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${LEVEL_BADGE[roadmap.level] || LEVEL_BADGE['Beginner']}`}>
                  {roadmap.level}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{roadmap.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {roadmap.duration && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{roadmap.duration}</span>
            )}
            {roadmap.tags && roadmap.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3.5 h-3.5" />
                {roadmap.tags.slice(0, 3).map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px]">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Expanded Content */}
          {expanded && roadmap.content && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                {roadmap.content}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {roadmap.content && (
              <button
                onClick={() => setExpanded(e => !e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  expanded
                    ? `${meta.bg} ${meta.color} ${meta.border}`
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {expanded ? 'Hide Details' : 'View Details'}
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
            {roadmap.pdfUrl && (
              <>
                <button
                  onClick={() => setShowPDF(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${meta.bg} ${meta.color} ${meta.border} hover:opacity-80`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  View PDF
                </button>
                <a
                  href={roadmap.pdfUrl}
                  download={roadmap.pdfName || 'roadmap.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:opacity-80"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const RoadmapsPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [fsError, setFsError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'roadmaps'),
      snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Roadmap));
        const published = all
          .filter(r => r.published === true)
          .sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.localeCompare(a.createdAt);
          });
        setRoadmaps(published);
        setLoading(false);
        setFsError('');
      },
      err => {
        setLoading(false);
        setFsError(
          err.code === 'permission-denied'
            ? 'You do not have permission to view roadmaps. Please contact the admin.'
            : `Could not load roadmaps: ${err.message}`
        );
      }
    );
    return () => unsub();
  }, []);

  const categories = ['All', ...Array.from(new Set(roadmaps.map(r => r.category).filter(Boolean)))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = roadmaps.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()) || r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchLevel = selectedLevel === 'All' || r.level === selectedLevel;
    return matchSearch && matchCat && matchLevel;
  });

  const grouped: Record<string, Roadmap[]> = {};
  if (selectedCategory === 'All') {
    filtered.forEach(r => {
      const cat = r.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(r);
    });
  } else {
    grouped[selectedCategory] = filtered;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Map className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Roadmaps</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Step-by-step guides to kickstart your career in any field</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {filtered.length} roadmap{filtered.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => {
            const meta = cat === 'All' ? null : (CATEGORY_META[cat] || DEFAULT_META);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? meta
                      ? `${meta.bg} ${meta.color} ${meta.border}`
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Level filter */}
        <select
          value={selectedLevel}
          onChange={e => setSelectedLevel(e.target.value)}
          className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-primary-500 transition-all"
        >
          {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
        </select>
      </div>

      {/* Firebase error */}
      {fsError && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{fsError}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-gray-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {roadmaps.length === 0 ? 'No roadmaps yet' : 'No roadmaps found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {roadmaps.length === 0
              ? 'Admin will be uploading roadmaps soon. Check back later!'
              : 'Try changing your search or filters to find what you need.'}
          </p>
          {search || selectedCategory !== 'All' || selectedLevel !== 'All' ? (
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:opacity-80 transition-all">
              Clear Filters
            </button>
          ) : null}
        </div>
      )}

      {/* Grouped Cards */}
      {!loading && Object.keys(grouped).length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => {
            const meta = CATEGORY_META[cat] || DEFAULT_META;
            const Icon = meta.icon;
            return (
              <div key={cat}>
                {selectedCategory === 'All' && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{cat}</h2>
                    <span className="text-xs text-gray-400 font-medium">({items.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map(r => <RoadmapCard key={r.id} roadmap={r} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
