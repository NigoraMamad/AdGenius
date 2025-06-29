'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnimatedMetricsCardProps {
  title: string;
  value: number | string;
  format: 'currency' | 'number' | 'percentage';
  type?: 'roas' | 'default';
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  delay?: number;
}

export function AnimatedMetricsCard({ 
  title, 
  value, 
  format, 
  type = 'default',
  icon, 
  trend,
  delay = 0 
}: AnimatedMetricsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        if (type === 'roas') {
          return `${val.toFixed(2)}x`;
        }
        return val.toLocaleString();
      default:
        return val.toString();
    }
  };

  const getGradientColor = () => {
    if (type === 'roas') {
      const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
      if (numValue >= 4) return 'from-green-500 to-emerald-600';
      if (numValue >= 3) return 'from-blue-500 to-cyan-600';
      if (numValue >= 2) return 'from-yellow-500 to-orange-600';
      return 'from-red-500 to-pink-600';
    }
    return 'from-indigo-500 to-purple-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.25, 0, 1],
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${getGradientColor()} p-6 rounded-xl shadow-lg text-white relative`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wide">
              {title}
            </h3>
            <div className="text-white/80">
              {icon}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: delay + 0.2,
              ease: [0.25, 0.25, 0, 1],
            }}
            className="mb-2"
          >
            <p className="text-3xl font-bold text-white mb-1">
              {formatValue(value)}
            </p>
          </motion.div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: delay + 0.4,
              }}
              className="flex items-center gap-1"
            >
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                trend.direction === 'up' 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-red-500/20 text-red-100'
              }`}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value).toFixed(1)}%</span>
              </div>
              <span className="text-white/70 text-xs">vs last month</span>
            </motion.div>
          )}
        </div>

        {/* Shine Effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            delay: delay + 1,
            ease: 'easeInOut',
          }}
          className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </div>
    </motion.div>
  );
} 