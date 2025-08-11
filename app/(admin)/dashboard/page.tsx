'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Tags, Palette, Layers } from 'lucide-react';

interface Stats {
  postCount: number;
  categoryCount: number;
  subCategoryCount: number;
  tagCount: number;
}

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  href: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon: Icon, href }) => (
  <Link href={href} className="block">
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  </Link>
);

const StatCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/4" />
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Optionally, set an error state here
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">儀表板</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="總文章數"
              count={stats?.postCount ?? 0}
              icon={FileText}
              href="/posts"
            />
            <StatCard
              title="總主題數"
              count={stats?.categoryCount ?? 0}
              icon={Palette}
              href="/categories"
            />
            <StatCard
              title="總子主題數"
              count={stats?.subCategoryCount ?? 0}
              icon={Layers}
              href="/sub-categories"
            />
            <StatCard
              title="總標籤數"
              count={stats?.tagCount ?? 0}
              icon={Tags}
              href="/tags"
            />
          </>
        )}
      </div>
    </div>
  );
}