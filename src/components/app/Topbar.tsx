'use client';

import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="glass-card sticky top-0 z-30 border-t-0 border-r-0 border-l-0 rounded-none">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Menu button للموبايل */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-primary/10 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="ابحث عن صنف بالاسم أو الكود..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass-input pr-10 rounded-xl h-10 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </form>

                {/* مساحة فارغة للتوازن */}
                <div className="w-10 lg:hidden" />
            </div>
        </header>
    );
}
