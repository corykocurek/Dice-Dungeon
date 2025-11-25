
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'outline';
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const RetroButton: React.FC<ButtonProps> = ({ className, variant = 'primary', ...props }) => {
  const variants = {
    primary: "bg-blue-800 border-blue-400 text-blue-100 hover:bg-blue-700",
    danger: "bg-red-900 border-red-500 text-red-100 hover:bg-red-800",
    success: "bg-green-800 border-green-500 text-green-100 hover:bg-green-700",
    outline: "bg-transparent border-slate-500 text-slate-300 hover:bg-slate-800"
  };

  return (
    <button
      className={cn(
        "px-4 py-2 border-2 uppercase font-vt323 tracking-wider transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export const Panel: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => {
  return (
    <div className={cn("bg-slate-900 border-4 border-double border-slate-600 p-4 relative shadow-lg", className)}>
      {title && (
        <div className="absolute -top-4 left-4 bg-slate-900 px-2 text-slate-300 border border-slate-600 font-bold uppercase text-sm">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color = "bg-green-500", label, animate = true }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <span className="text-xs uppercase text-slate-400">{label}</span>}
      <div className="w-full h-4 bg-slate-800 border border-slate-600 relative">
        <div 
          className={cn("h-full", animate && "transition-all duration-300", color)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
