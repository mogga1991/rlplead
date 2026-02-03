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

// Property type options - narrows down which GSA lease winners to find
const propertyTypeOptions: DropdownOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'office', label: 'Office Space' },
  { value: 'parking', label: 'Parking' },
  { value: 'land', label: 'Land' },
];

const locationOptions: DropdownOption[] = [
  { value: '', label: 'All States' },
  { value: 'VA', label: 'Virginia' },
  { value: 'MD', label: 'Maryland' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'CA', label: 'California' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
  { value: 'IL', label: 'Illinois' },
  { value: 'GA', label: 'Georgia' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'WA', label: 'Washington' },
  { value: 'CO', label: 'Colorado' },
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
          label="Property Type"
          options={propertyTypeOptions}
          value={filters.propertyType || 'all'}
          onChange={(value) => onChange({ ...filters, propertyType: value as 'all' | 'office' | 'parking' | 'land' })}
          placeholder="Select property type"
        />

        <Dropdown
          label="State"
          options={locationOptions}
          value={filters.location || ''}
          onChange={(value) => onChange({ ...filters, location: value })}
          placeholder="Select state"
        />

        <Input
          label="Lease Value Range"
          placeholder="e.g., 100000-5000000"
          value={filters.agency || ''}
          onChange={(e) => onChange({ ...filters, agency: e.target.value })}
        />

        <Input
          label="Keyword"
          placeholder="Class A, SCIF, 10000 RSF..."
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
        Find Lessors
      </Button>
    </div>
  );
};
