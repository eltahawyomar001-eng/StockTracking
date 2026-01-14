import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className
}: StatCardProps) {
    return (
        <div className={cn(
            "glass-card stat-card p-6 rounded-2xl",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-white/60 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {subtitle && (
                        <p className="text-white/40 text-sm mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-sm",
                            trend.isPositive ? "text-green-400" : "text-red-400"
                        )}>
                            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                            <span className="text-white/40">من الشهر الماضي</span>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
            </div>
        </div>
    );
}
