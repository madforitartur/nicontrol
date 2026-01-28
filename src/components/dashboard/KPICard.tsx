import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    icon: 'bg-primary/10 text-primary',
    border: 'border-border',
  },
  success: {
    bg: 'bg-card',
    icon: 'bg-status-success-light text-status-success',
    border: 'border-status-success/20',
  },
  warning: {
    bg: 'bg-card',
    icon: 'bg-status-warning-light text-status-warning',
    border: 'border-status-warning/20',
  },
  danger: {
    bg: 'bg-card',
    icon: 'bg-status-danger-light text-status-danger',
    border: 'border-status-danger/20',
  },
  info: {
    bg: 'bg-card',
    icon: 'bg-status-info-light text-status-info',
    border: 'border-status-info/20',
  },
};

export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = 'default' 
}: KPICardProps) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "rounded-xl border p-5 shadow-card animate-slide-up",
      styles.bg,
      styles.border
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-sm font-medium",
              trend === 'up' && "text-status-success",
              trend === 'down' && "text-status-danger",
              trend === 'neutral' && "text-muted-foreground"
            )}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
