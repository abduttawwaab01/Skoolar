'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, BookOpen, BarChart3, Calendar, MessageSquare, CreditCard, Bell, GraduationCap, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

const quickActions = [
  { icon: Users, label: 'Manage Students', view: 'students' as const, color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', iconColor: 'text-blue-600' },
  { icon: BookOpen, label: 'Academic', view: 'academic-structure' as const, color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100', iconColor: 'text-emerald-600' },
  { icon: Calendar, label: 'Attendance', view: 'attendance' as const, color: 'bg-amber-50 border-amber-200 hover:bg-amber-100', iconColor: 'text-amber-600' },
  { icon: BarChart3, label: 'Reports', view: 'results' as const, color: 'bg-purple-50 border-purple-200 hover:bg-purple-100', iconColor: 'text-purple-600' },
  { icon: CreditCard, label: 'Finance', view: 'finance' as const, color: 'bg-green-50 border-green-200 hover:bg-green-100', iconColor: 'text-green-600' },
  { icon: MessageSquare, label: 'Messages', view: 'messaging-center' as const, color: 'bg-pink-50 border-pink-200 hover:bg-pink-100', iconColor: 'text-pink-600' },
  { icon: Bell, label: 'Announcements', view: 'announcements' as const, color: 'bg-red-50 border-red-200 hover:bg-red-100', iconColor: 'text-red-600' },
  { icon: GraduationCap, label: 'ID Cards', view: 'id-cards' as const, color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100', iconColor: 'text-cyan-600' },
  { icon: ClipboardList, label: 'Evaluations', view: 'weekly-evaluations' as const, color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100', iconColor: 'text-indigo-600' },
];

const stats = [
  { label: 'Total Students', value: '847', change: '+12 this week', trend: 'up' },
  { label: 'Teachers', value: '42', change: '2 new hires', trend: 'up' },
  { label: 'Classes', value: '24', change: 'All active', trend: 'neutral' },
  { label: 'Attendance Rate', value: '94%', change: '+2% from last week', trend: 'up' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

export function OverviewView() {
  const { currentRole, setCurrentView } = useAppStore();
  
  const handleNavigate = (view: string) => {
    setCurrentView(view as any);
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={statCardVariants}
            custom={idx}
            whileHover="hover"
          >
            <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          'h-24 w-full flex-col gap-2 border-2 transition-all duration-200',
                          action.color
                        )}
                        onClick={() => handleNavigate(action.view)}
                      >
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Icon className={cn('size-7', action.iconColor)} />
                        </motion.div>
                        <span className="text-xs font-medium">{action.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { text: 'New student registered', time: '2 mins ago', icon: Users },
                  { text: 'Attendance marked for JSS 1A', time: '15 mins ago', icon: Calendar },
                  { text: 'Fee payment received - ₦50,000', time: '1 hour ago', icon: CreditCard },
                  { text: 'New announcement posted', time: '2 hours ago', icon: Bell },
                  { text: 'Exam results uploaded', time: '3 hours ago', icon: BarChart3 },
                ].map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-gray-100">
                        <Icon className="size-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Database', status: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: 'API Services', status: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: 'Storage', status: '85% Used', color: 'text-amber-600', bg: 'bg-amber-100' },
                { label: 'Last Backup', status: '2 hours ago', color: 'text-blue-600', bg: 'bg-blue-100' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', item.bg, item.color)}>
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
