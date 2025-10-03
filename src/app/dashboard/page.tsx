"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Intake } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Filter, FileText, Clock, Users, 
  CheckCircle2, AlertCircle, ExternalLink, Edit, Copy, Trash2,
  Sparkles
} from "lucide-react";
import Link from 'next/link';

export default function Dashboard() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    loadIntakes();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
  };

  const loadIntakes = async () => {
    try {
      const { data, error } = await supabase
        .from('intakes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setIntakes(data || []);
    } catch (error) {
      console.error('Error loading intakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIntakes = intakes.filter(intake => {
    const matchesSearch = intake.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intake.hiring_manager?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intake.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || intake.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'in_review': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'published': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-3 h-3" />;
      case 'in_review': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle2 className="w-3 h-3" />;
      case 'published': return <ExternalLink className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your intakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 font-[Calibri,sans-serif]">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartIntake Dashboard
                </h1>
                <p className="text-sm font-medium text-slate-600">by Handshake</p>
              </div>
            </div>
            <Link href="/intake/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                New Intake
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{intakes.length}</p>
                    <p className="text-xs text-slate-600">Total Intakes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{intakes.filter(i => i.status === 'draft').length}</p>
                    <p className="text-xs text-slate-600">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{intakes.filter(i => i.status === 'approved').length}</p>
                    <p className="text-xs text-slate-600">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{intakes.filter(i => i.status === 'published').length}</p>
                    <p className="text-xs text-slate-600">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Search & Filters */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title, hiring manager, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="rounded-xl"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('draft')}
                  className="rounded-xl"
                >
                  Drafts
                </Button>
                <Button
                  variant={statusFilter === 'in_review' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('in_review')}
                  className="rounded-xl"
                >
                  In Review
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  className="rounded-xl"
                >
                  Approved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intakes List */}
        <div className="space-y-4">
          {filteredIntakes.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-4">No intakes found</p>
                <Link href="/intake/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Intake
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredIntakes.map((intake) => (
              <Card key={intake.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {intake.title || intake.job_title || 'Untitled Intake'}
                        </h3>
                        <Badge className={`${getStatusColor(intake.status)} border flex items-center gap-1`}>
                          {getStatusIcon(intake.status)}
                          {intake.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                        {intake.hiring_manager && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {intake.hiring_manager}
                          </span>
                        )}
                        {intake.department && (
                          <span>• {intake.department}</span>
                        )}
                        {intake.level && (
                          <span>• Level {intake.level}</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        Updated {formatDate(intake.updated_at)}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/intake/${intake.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

