import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import LoadingSpinner from './LoadingSpinner';

const AISummaryPanel = () => {
  const { summary, isSummaryLoading, fetchSummary } = useAnalyticsStore();
  const { activeWorkspace } = useWorkspaceStore();

  const handleGenerate = () => {
    if (!activeWorkspace) return;
    fetchSummary(activeWorkspace._id);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <HiOutlineSparkles className="text-white text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Summary</h3>
            <p className="text-xs text-dark-500">Powered by Gemini</p>
          </div>
        </div>

        {summary?.cached && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            CACHED
          </span>
        )}
      </div>

      {isSummaryLoading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <LoadingSpinner size="md" />
          <p className="mt-3 text-xs text-dark-400 animate-pulse-soft">Generating summary...</p>
        </div>
      ) : summary?.summary ? (
        <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/30">
          <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-dark-500 mb-3">
            Get an AI-powered summary of today's team accomplishments
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isSummaryLoading || !activeWorkspace}
        className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        id="btn-ai-summary"
      >
        <HiOutlineSparkles />
        {summary?.summary ? 'Refresh Summary' : 'Generate Summary'}
      </button>
    </div>
  );
};

export default AISummaryPanel;
