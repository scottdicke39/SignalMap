"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Check } from 'lucide-react';

// Company categories and individual companies
const COMPANY_CATEGORIES = [
  // Broad Categories
  '📊 Forbes Cloud 100 (2024)',
  '📊 Forbes Cloud 100 (2023)',
  '📊 Forbes Cloud 100 (2022)',
  '🚀 Recent IPOs (Last 12 months)',
  '🚀 Recent IPOs (Last 24 months)',
  '💰 Recent Acquisitions/Buyouts',
  '🦄 Unicorn Startups ($1B+ valuation)',
  '🎯 High-Growth Startups (Series C+)',
  '💎 Y Combinator Alumni',
  '💎 Top VC-Backed Companies',
  '🏢 Fortune 500 Tech',
  '🌟 Fast Company Most Innovative',
  '📈 Inc 5000 Fastest Growing',
  '🤖 AI/ML Leaders',
  '☁️ Cloud Infrastructure Leaders',
  '🔒 Cybersecurity Leaders',
  '💳 Fintech Leaders',
  '🏥 Healthtech Leaders',
  '🎓 Edtech Leaders'
];

const TECH_COMPANIES = [
  // FAANG+
  'Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft',
  // Major Tech
  'Salesforce', 'Oracle', 'Adobe', 'IBM', 'Intel', 'NVIDIA', 'AMD',
  // Social/Consumer
  'Twitter (X)', 'LinkedIn', 'Snapchat', 'TikTok', 'Reddit', 'Pinterest', 'Discord',
  // Cloud/Infrastructure
  'AWS', 'Azure', 'Google Cloud', 'Snowflake', 'Databricks', 'MongoDB',
  // Enterprise SaaS
  'Slack', 'Zoom', 'Atlassian', 'Asana', 'Notion', 'Figma', 'Canva',
  // Fintech
  'Stripe', 'Square', 'PayPal', 'Coinbase', 'Robinhood', 'Plaid', 'Brex',
  // E-commerce
  'Shopify', 'Etsy', 'eBay', 'Instacart', 'DoorDash', 'Uber', 'Lyft',
  // Startups/Unicorns
  'OpenAI', 'Anthropic', 'Mistral AI', 'Stability AI', 'Hugging Face',
  'SpaceX', 'Tesla', 'Rivian', 'Lucid Motors',
  'Airbnb', 'Booking.com', 'Expedia',
  // HR/Recruiting Tech
  'Greenhouse', 'Lever', 'Workday', 'SAP', 'ADP', 'Gusto',
  // Developer Tools
  'GitHub', 'GitLab', 'Vercel', 'Netlify', 'HashiCorp', 'Docker',
  // Consulting/Services
  'McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'KPMG', 'EY', 'PwC',
  // Other Notable
  'Palantir', 'Roblox', 'Unity', 'Epic Games', 'Spotify', 'Twitch'
];

const ALL_OPTIONS = [...COMPANY_CATEGORIES, ...TECH_COMPANIES.sort()];

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (company: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompanyAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder,
  className 
}: CompanyAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter companies and categories based on input
  useEffect(() => {
    if (value.length > 0) {
      const filtered = ALL_OPTIONS.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Show max 10 suggestions (more for categories)
      
      setFilteredCompanies(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      // Show categories by default when empty
      setFilteredCompanies(COMPANY_CATEGORIES.slice(0, 6));
      setShowSuggestions(false);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCompanies.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCompanies[selectedIndex]) {
          handleSelect(filteredCompanies[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelect = (company: string) => {
    onSelect(company);
    onChange('');
    setShowSuggestions(false);
  };

  const isCategory = (option: string) => {
    return COMPANY_CATEGORIES.includes(option);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && filteredCompanies.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
          {filteredCompanies.map((option, index) => {
            const isCat = isCategory(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                } ${isCat ? 'font-medium border-b border-gray-100' : ''}`}
              >
                <span className={`text-sm ${isCat ? 'text-blue-700' : 'text-gray-700'}`}>
                  {option}
                </span>
                {index === selectedIndex && (
                  <Check className={`h-4 w-4 ${isCat ? 'text-blue-600' : 'text-gray-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {value.length > 0 && filteredCompanies.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-500">
            No matches found. Press Enter to add "{value}"
          </p>
        </div>
      )}
    </div>
  );
}

