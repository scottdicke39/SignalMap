"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CompanyAutocomplete } from '@/components/ui/company-autocomplete';
import { Sparkles, Plus, X } from 'lucide-react';

interface StrategicPlanningProps {
  onAIAssist: (section: string, context: string, useGlean?: boolean) => void;
}

export default function StrategicPlanning({ onAIAssist }: StrategicPlanningProps) {
  const [strategicData, setStrategicData] = useState({
    idealCandidate: '',
    companyObjectives: '',
    businessImpact: '',
    challenges: '',
    success90Days: '',
    success1Year: '',
    outstandingPerformance: '',
    companiesToTarget: [] as string[],
    companiesToAvoid: [] as string[],
    rolePitch: ''
  });

  const [newTargetCompany, setNewTargetCompany] = useState('');
  const [newAvoidCompany, setNewAvoidCompany] = useState('');
  const [linkedInProfiles, setLinkedInProfiles] = useState<string[]>([]);
  const [newLinkedInProfile, setNewLinkedInProfile] = useState('');

  const updateField = (field: string, value: string | string[]) => {
    setStrategicData(prev => ({ ...prev, [field]: value }));
  };

  const addTargetCompany = () => {
    if (newTargetCompany.trim()) {
      updateField('companiesToTarget', [...strategicData.companiesToTarget, newTargetCompany.trim()]);
      setNewTargetCompany('');
    }
  };

  const addAvoidCompany = () => {
    if (newAvoidCompany.trim()) {
      updateField('companiesToAvoid', [...strategicData.companiesToAvoid, newAvoidCompany.trim()]);
      setNewAvoidCompany('');
    }
  };

  const addLinkedInProfile = () => {
    if (newLinkedInProfile.trim()) {
      setLinkedInProfiles([...linkedInProfiles, newLinkedInProfile.trim()]);
      setNewLinkedInProfile('');
    }
  };

  const removeLinkedInProfile = (index: number) => {
    setLinkedInProfiles(linkedInProfiles.filter((_, i) => i !== index));
  };

  const removeCompany = (type: 'target' | 'avoid', index: number) => {
    if (type === 'target') {
      updateField('companiesToTarget', strategicData.companiesToTarget.filter((_, i) => i !== index));
    } else {
      updateField('companiesToAvoid', strategicData.companiesToAvoid.filter((_, i) => i !== index));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Strategic Hiring Context</CardTitle>
        <p className="text-sm text-slate-600">Build the complete hiring strategy with AI assistance</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Ideal Candidate Profile */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Ideal Candidate Profile</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAIAssist('idealCandidate')}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Suggest
            </Button>
          </div>
          
          {/* LinkedIn Profile References */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Reference LinkedIn Profiles (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="url"
                value={newLinkedInProfile}
                onChange={(e) => setNewLinkedInProfile(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLinkedInProfile();
                  }
                }}
                placeholder="https://linkedin.com/in/profile..."
                className="flex-1 text-sm"
              />
              <Button 
                onClick={addLinkedInProfile}
                disabled={!newLinkedInProfile.trim()}
                size="sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {linkedInProfiles.length > 0 && (
              <div className="space-y-1">
                {linkedInProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg text-sm border border-blue-100">
                    <span className="flex-1 truncate text-blue-700 font-medium">{profile}</span>
                    <button
                      onClick={() => removeLinkedInProfile(index)}
                      className="text-blue-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Add LinkedIn profiles of ideal candidates - AI will use them as reference
            </p>
          </div>

          <Textarea
            value={strategicData.idealCandidate}
            onChange={(e) => updateField('idealCandidate', e.target.value)}
            placeholder="Describe the ideal candidate: background, experience level, key traits..."
            className="h-20"
          />
        </div>

        {/* Company Objectives */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Company Objectives This Hire Supports</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAIAssist('companyObjectives')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI + Glean
            </Button>
          </div>
          <Textarea
            value={strategicData.companyObjectives}
            onChange={(e) => updateField('companyObjectives', e.target.value)}
            placeholder="OKRs, strategic initiatives, revenue goals, etc..."
            className="h-20"
          />
          <p className="text-xs text-slate-500">
            ✨ AI will search Glean for company goals, OKRs, and strategic initiatives
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Business Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Business Impact of This Role</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAIAssist('businessImpact')}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI + Glean
              </Button>
            </div>
            <Textarea
              value={strategicData.businessImpact}
              onChange={(e) => updateField('businessImpact', e.target.value)}
              placeholder="How will this role drive business results?"
              className="h-20"
            />
            <p className="text-xs text-slate-500">
              ✨ AI will search Glean for business priorities and metrics
            </p>
          </div>

          {/* Challenges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Challenges This Person Will Face</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAIAssist('challenges')}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI + Glean
              </Button>
            </div>
            <Textarea
              value={strategicData.challenges}
              onChange={(e) => updateField('challenges', e.target.value)}
              placeholder="Key obstacles and difficulties they'll encounter..."
              className="h-20"
            />
            <p className="text-xs text-slate-500">
              ✨ AI will search Glean for team challenges and tech debt
            </p>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">What Does Success Look Like?</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-600">90 Days</label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAIAssist('success90Days')}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI + Glean
                </Button>
              </div>
              <Textarea
                value={strategicData.success90Days}
                onChange={(e) => updateField('success90Days', e.target.value)}
                placeholder="Short-term success indicators..."
                className="h-16"
              />
              <p className="text-xs text-slate-500">
                ✨ AI will search Glean for onboarding docs and ramp-up expectations
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-green-600">One (1) Year</label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAIAssist('success1Year')}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI + Glean
                </Button>
              </div>
              <Textarea
                value={strategicData.success1Year}
                onChange={(e) => updateField('success1Year', e.target.value)}
                placeholder="Long-term impact and achievements..."
                className="h-16"
              />
              <p className="text-xs text-slate-500">
                ✨ AI will search Glean for long-term team and company goals
              </p>
            </div>
          </div>
        </div>

        {/* Outstanding Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">What Would Outstanding Performance Look Like?</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAIAssist('outstandingPerformance')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI + Glean
            </Button>
          </div>
          <Textarea
            value={strategicData.outstandingPerformance}
            onChange={(e) => updateField('outstandingPerformance', e.target.value)}
            placeholder="Above and beyond expectations - what does exceptional look like?"
            className="h-20"
          />
          <p className="text-xs text-slate-500">
            ✨ AI will search Glean for examples of high performers and company values
          </p>
        </div>

        {/* Company Targeting */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-green-600">Companies/Industries to Target</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAIAssist('targetCompanies', strategicData.companiesToTarget.join(', '))}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Suggest
              </Button>
            </div>
            <div className="flex gap-2">
              <CompanyAutocomplete
                value={newTargetCompany}
                onChange={setNewTargetCompany}
                onSelect={(company) => {
                  updateField('companiesToTarget', [...strategicData.companiesToTarget, company]);
                  setNewTargetCompany('');
                }}
                placeholder="Add target company/industry (type to see suggestions)"
                className="text-sm"
              />
              <Button size="sm" onClick={addTargetCompany}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategicData.companiesToTarget.map((company, index) => (
                <Badge key={index} variant="outline" className="text-green-700">
                  {company}
                  <button
                    onClick={() => removeCompany('target', index)}
                    className="ml-1 text-green-500 hover:text-green-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-red-600">Companies/Industries to Avoid</label>
            <div className="flex gap-2">
              <CompanyAutocomplete
                value={newAvoidCompany}
                onChange={setNewAvoidCompany}
                onSelect={(company) => {
                  updateField('companiesToAvoid', [...strategicData.companiesToAvoid, company]);
                  setNewAvoidCompany('');
                }}
                placeholder="Add company/industry to avoid (type to see suggestions)"
                className="text-sm"
              />
              <Button size="sm" onClick={addAvoidCompany}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategicData.companiesToAvoid.map((company, index) => (
                <Badge key={index} variant="outline" className="text-red-700">
                  {company}
                  <button
                    onClick={() => removeCompany('avoid', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Role Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">How Would You Sell This Role to a Top Candidate?</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAIAssist('rolePitch')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI + Glean
            </Button>
          </div>
          <Textarea
            value={strategicData.rolePitch}
            onChange={(e) => updateField('rolePitch', e.target.value)}
            placeholder="The compelling narrative for why someone should take this role..."
            className="h-24"
          />
          <p className="text-xs text-slate-500">
            ✨ AI will search Glean for company culture, benefits, mission, and recent wins
          </p>
        </div>

      </CardContent>
    </Card>
  );
}








