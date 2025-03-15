'use client';

import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface TrendProps {
  value: string;
  isUp: boolean;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  trend?: TrendProps;
  isLoading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  trend,
  isLoading = false,
}: StatsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full ${bgColor} ${textColor} flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col">
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mb-2"></div>
          {trend && <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="text-3xl font-bold mb-1">{value}</div>
          {trend && (
            <div className="flex items-center text-sm">
              <span className={trend.isUp ? 'text-success' : 'text-error'}>
                {trend.isUp ? '↑' : '↓'}
              </span>
              <span className="text-gray ml-1">{trend.value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 