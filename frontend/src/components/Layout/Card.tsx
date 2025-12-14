import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'base' | 'elevated' | 'floating';
  variant?: 'default' | 'insights' | 'chart' | 'kpi';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  title,
  subtitle,
  padding = 'md',
  elevation = 'base',
  variant = 'default'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const elevationClasses = {
    none: '',
    base: 'card-base',
    elevated: 'card-elevated',
    floating: 'card-base hover:shadow-2xl'
  };

  const variantClasses = {
    default: 'card-base',
    insights: 'insight-card',
    chart: 'chart-container',
    kpi: 'kpi-card'
  };

  return (
    <div className={clsx(
      // Use enhanced card classes from design system
      variant !== 'default' ? variantClasses[variant] : elevationClasses[elevation],
      paddingClasses[padding],
      // Remove old styling, rely on CSS custom properties
      'rounded-xl transition-all duration-200',
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-primary tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-secondary mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};