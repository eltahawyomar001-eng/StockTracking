'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    MapPin,
    FileSpreadsheet,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SarayLogo } from './SarayLogo';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/items', label: 'الأصناف', icon: Package },
    { href: '/categories', label: 'الفئات', icon: FolderTree },
    { href: '/locations', label: 'المواقع', icon: MapPin },
    { href: '/import', label: 'استيراد Excel', icon: FileSpreadsheet },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Overlay للموبايل */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 right-0 h-full w-64 z-50 transition-transform duration-300 lg:translate-x-0",
                    "glass-card border-l-0 border-t-0 border-b-0",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/20">
                    <SarayLogo className="h-12 w-auto" />
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-primary/10 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                    "hover:bg-primary/10",
                                    isActive
                                        ? "bg-primary/15 text-primary border border-primary/30"
                                        : "text-foreground/70 hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground text-center">
                        نظام سراي v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}
