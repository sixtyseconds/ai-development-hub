'use client';

import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

type StatsCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
};

export default function StatsCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="text-sm text-gray mb-2">{title}</div>
      <div className="flex items-center text-2xl font-semibold">
        <div
          className={`w-9 h-9 rounded flex items-center justify-center mr-3 ${bgColor} ${textColor}`}
        >
          {icon}
        </div>
        {value}
      </div>
      {trend && (
        <div className={`flex items-center text-xs mt-2 ${trend.isUp ? 'text-secondary' : 'text-danger'}`}>
          {trend.isUp ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
          <span className="ml-1">{trend.value}</span>
        </div>
      )}
    </div>
  );
} 