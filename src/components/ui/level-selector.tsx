"use client"

import React from 'react';
import { Select } from './select';

export const IC_LEVELS = [
  { value: 'L1', label: 'L1 - Junior IC' },
  { value: 'L2', label: 'L2 - IC' },
  { value: 'L3', label: 'L3 - IC' },
  { value: 'L4', label: 'L4 - Senior IC' },
  { value: 'L5', label: 'L5 - Staff IC' },
  { value: 'L6', label: 'L6 - Senior Staff IC' },
  { value: 'L7', label: 'L7 - Principal IC' },
  { value: 'L8', label: 'L8 - Senior Principal IC' },
  { value: 'L9', label: 'L9 - Distinguished IC' }
];

export const MGMT_LEVELS = [
  { value: 'M3', label: 'M3 - Manager' },
  { value: 'M4', label: 'M4 - Senior Manager' },
  { value: 'M5', label: 'M5 - Director' }
];

export const ALL_LEVELS = [...IC_LEVELS, ...MGMT_LEVELS];

interface LevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LevelSelector({ value, onChange, className }: LevelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <option value="">Select Level...</option>
      <optgroup label="Individual Contributor (IC)">
        {IC_LEVELS.map(level => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Management">
        {MGMT_LEVELS.map(level => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

