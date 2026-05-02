import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function DashboardCard({ children, className, title, icon: Icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white p-6 rounded-2xl shadow-sm border border-gray-100", className)}
    >
      {title && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Icon size={18} />
            </div>
          )}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}
