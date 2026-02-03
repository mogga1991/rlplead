'use client';

import React from 'react';
import { Search, Sparkles, ToggleLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
}) => {
  const [findSimilar, setFindSimilar] = React.useState(false);

  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search for GSA lessors — companies leasing office, parking, or land to the government..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
            <Sparkles className="w-4 h-4" />
            Let AI hunt
          </button>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <button
            onClick={() => setFindSimilar(!findSimilar)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              findSimilar ? 'bg-fed-green-900' : 'bg-gray-300'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                findSimilar ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span>Find similar company</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
