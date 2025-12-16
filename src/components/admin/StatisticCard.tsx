import { motion } from 'motion/react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatisticCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    gradient?: string;
    iconBg?: string;
    iconColor?: string;
    isLoading?: boolean;
    className?: string;
}

export function StatisticCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    gradient = 'from-slate-500/10 to-slate-500/5',
    iconBg = 'bg-slate-500/10',
    iconColor = 'text-slate-500',
    isLoading = false,
    className,
}: StatisticCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                'relative overflow-hidden bg-card border border-border/50 p-6 rounded-xl transition-shadow duration-300 hover:shadow-lg hover:border-border group',
                isLoading && 'animate-pulse',
                className
            )}
        >
            {/* Background gradient */}
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-100',
                    gradient
                )}
            />

            <div className="relative flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    {/* Header with title */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
                            {title}
                        </p>
                    </div>

                    {/* Value */}
                    <p className="text-3xl font-serif tracking-tight">
                        {isLoading ? '—' : value}
                    </p>

                    {/* Trend badge */}
                    {trend && (
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                                    trend.isPositive
                                        ? 'bg-success/10 text-success'
                                        : 'bg-destructive/10 text-destructive'
                                )}
                            >
                                {trend.isPositive ? (
                                    <ArrowUp className="h-3 w-3" />
                                ) : (
                                    <ArrowDown className="h-3 w-3" />
                                )}
                                {Math.abs(trend.value)}%
                            </span>
                            {subtitle && (
                                <span className="text-xs text-muted-foreground">{subtitle}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Icon */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className={cn('p-3 rounded-xl transition-all duration-300', iconBg)}
                >
                    <Icon className={cn('h-5 w-5', iconColor)} />
                </motion.div>
            </div>
        </motion.div>
    );
}

export default StatisticCard;
