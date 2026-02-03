'use client';

import React from 'react';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { SearchFilters } from '@/lib/types';

interface FilterRowProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

// Sample data - in production, these would come from an API
const industryOptions: DropdownOption[] = [
  { value: '', label: 'All industries' },
  { value: '54', label: 'Professional, Scientific, and Technical Services' },
  { value: '541330', label: 'Engineering Services' },
  { value: '541511', label: 'Custom Computer Programming Services' },
  { value: '541512', label: 'Computer Systems Design Services' },
  { value: '541519', label: 'Other Computer Related Services' },
  { value: '336411', label: 'Aircraft Manufacturing' },
  { value: '334511', label: 'Search, Detection, Navigation Instruments' },
];

const locationOptions: DropdownOption[] = [
  { value: '', label: 'Worldwide' },
  { value: 'USA', label: 'United States' },
  { value: 'VA', label: 'Virginia' },
  { value: 'MD', label: 'Maryland' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'CA', label: 'California' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
];

export const FilterRow: React.FC<FilterRowProps> = ({
  filters,
  onChange,
  onSearch,
}) => {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 grid grid-cols-4 gap-4">
        <Dropdown
          label="NAICS/Industry"
          options={industryOptions}
          value={filters.industry || ''}
          onChange={(value) => onChange({ ...filters, industry: value })}
          placeholder="Select industry"
        />

        <Dropdown
          label="Location"
          options={locationOptions}
          value={filters.location || ''}
          onChange={(value) => onChange({ ...filters, location: value })}
          placeholder="Select location"
        />

        <Input
          label="Agency Filter"
          placeholder="Enter areas"
          value={filters.agency || ''}
          onChange={(e) => onChange({ ...filters, agency: e.target.value })}
        />

        <Input
          label="Keyword"
          placeholder="Enter keywords"
          value={filters.keywords || ''}
          onChange={(e) => onChange({ ...filters, keywords: e.target.value })}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        icon={Sparkles}
        onClick={onSearch}
        className="mb-0"
      >
        Find my leads
      </Button>
    </div>
  );
};
