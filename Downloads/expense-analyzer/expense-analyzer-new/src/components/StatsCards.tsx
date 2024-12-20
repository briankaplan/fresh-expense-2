'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt, PieChart, DollarSign, Briefcase, User } from 'lucide-react';
import { Transaction, Expense } from '@prisma/client';
import { calculateStats } from '@/lib/stats';
import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  transactions: Transaction[];
  expenses: Expense[];
  total: number;
}

export function StatsCards({ transactions, expenses, total }: StatsCardsProps) {
  const stats = calculateStats(transactions, expenses);

  const statCards = [
    {
      label: 'Total Expenses',
      value: formatCurrency(total),
      change: `${stats.monthlyChange > 0 ? '+' : ''}${stats.monthlyChange.toFixed(1)}%`,
      isPositive: stats.monthlyChange <= 0,
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Pending Receipts',
      value: stats.pendingReceipts.toString(),
      change: `${stats.pendingReceipts} unmatched`,
      isPositive: stats.pendingReceipts === 0,
      icon: Receipt,
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Match Rate',
      value: `${stats.matchRate.toFixed(0)}%`,
      change: `${stats.matchRate >= 90 ? 'Excellent' : stats.matchRate >= 75 ? 'Good' : 'Needs Attention'}`,
      isPositive: stats.matchRate >= 75,
      icon: PieChart,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'This Month',
      value: formatCurrency(stats.monthlyTotal),
      change: `vs ${formatCurrency(stats.lastMonthTotal)} last month`,
      isPositive: stats.monthlyChange <= 0,
      icon: stats.monthlyChange > 0 ? TrendingUp : TrendingDown,
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Business Expenses',
      value: formatCurrency(stats.businessTotal),
      change: `${stats.businessCount} transactions`,
      isPositive: true,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Personal Expenses',
      value: formatCurrency(stats.personalTotal),
      change: `${stats.personalCount} transactions`,
      isPositive: true,
      icon: User,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.label}
          index={index}
          {...stat}
        />
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  color: string;
  index: number;
}

function StatCard({ label, value, change, isPositive, icon: Icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-white to-black" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            {label}
          </span>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {value}
          </span>
          <span className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-[0.08]`} />
        </div>
      </div>
    </motion.div>
  );
} 