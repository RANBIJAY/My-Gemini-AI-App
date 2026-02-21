import React, { useState, useCallback } from 'react';
import { 
  Wand2, 
  Copy, 
  Check, 
  Trash2, 
  ChevronRight, 
  Layout, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { processText, TASKS, TaskType } from './services/gemini';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskType>('summarize');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await processText(input, selectedTask, customPrompt);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [output]);

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">AI Workbench</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>v1.0.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <FileText size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Input</h2>
            </div>
            <button 
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
              title="Clear all"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden focus-within:border-blue-500 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here to begin processing..."
              className="w-full h-64 p-6 resize-none focus:outline-none text-slate-700 leading-relaxed"
            />
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
              {TASKS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTask === task.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {task.label}
                </button>
              ))}
            </div>
          </div>

          {selectedTask === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Instruction</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Rewrite this as a poem, Extract all email addresses..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
              />
            </motion.div>
          )}

          <button
            onClick={handleProcess}
            disabled={isLoading || !input.trim()}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isLoading || !input.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Wand2 size={18} />
                Process with Gemini
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Output Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Layout size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Output</h2>
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !output 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : isCopied 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
              {isCopied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px] p-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!output && !isLoading ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-8 text-center"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ChevronRight size={32} />
                  </div>
                  <p className="text-sm font-medium">Results will appear here after processing</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate max-w-none"
                >
                  <div className="markdown-body">
                    <Markdown>{output}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <p>© 2026 AI Workbench • Powered by Gemini 3 Flash</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

