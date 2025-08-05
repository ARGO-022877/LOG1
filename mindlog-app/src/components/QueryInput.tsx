'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { QueryRequest } from '@/types/knowledge';

interface QueryInputProps {
  onSubmit: (request: QueryRequest) => void;
  isLoading?: boolean;
}

export default function QueryInput({ onSubmit, isLoading = false }: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit({
        query: query.trim(),
        type: 'natural_language'
      });
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="자연어로 질문해보세요... (예: 'Python 스킬을 가진 개발자는 누구인가?')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-text-primary placeholder-text-secondary"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/80 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-fast hover:scale-105"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isLoading ? '처리중...' : '질문하기'}
        </button>
      </form>
    </div>
  );
}