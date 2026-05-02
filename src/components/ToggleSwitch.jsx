import React from 'react';
import { motion } from 'motion/react';

export default function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm font-medium text-gray-900 block">{label}</span>
        {description && <span className="text-xs text-gray-500">{description}</span>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        />
      </button>
    </div>
  );
}
