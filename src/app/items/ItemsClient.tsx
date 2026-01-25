'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout, GlassCard } from '@/components/app';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumberArabic } from '@/lib/arabic-utils';
import { getItems } from '@/app/actions/items';
import { getCategories } from '@/app/actions/categories';

type ItemWithStock = Awaited<ReturnType<typeof getItems>>['items'][0];
type Category = Awaited<ReturnType<typeof getCategories>>[0];

interface ItemsClientProps {
    initialItems: { items: ItemWithStock[]; total: number; pages: number; page: number };
    categories: Category[];
    initialSearch?: string;
    initialCategory?: string;
}

export default function ItemsClient({
    initialItems,
    categories,
    initialSearch = '',
    initialCategory = ''
}: ItemsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [items, setItems] = useState(initialItems);
    const [search, setSearch] = useState(initialSearch);
    const [categoryId, setCategoryId] = useState(initialCategory);
    const [loading, setLoading] = useState(false);

    const fetchItems = async (page = 1) => {
        setLoading(true);
        try {
            const result = await getItems({
                search: search || undefined,
                categoryId: categoryId || undefined,
                page,
            });
            setItems(result);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchItems(1);

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryId) params.set('category', categoryId);
        router.push(`/items?${params.toString()}`);
    };

    const handleCategoryChange = (value: string) => {
        setCategoryId(value === 'all' ? '' : value);
    };

    useEffect(() => {
        if (categoryId !== initialCategory) {
            fetchItems(1);
        }
    }, [categoryId]);

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">الأصناف</h1>
                    <p className="text-foreground/60">عرض وإدارة جميع الأصناف في المخزون</p>
                </div>

                {/* Filters */}
                <GlassCard className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="ابحث بالاسم أو الكود..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input pr-10"
                            />
                        </div>

                        <Select value={categoryId || 'all'} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full md:w-48 glass-input">
                                <SelectValue placeholder="جميع الفئات" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-primary/20">
                                <SelectItem value="all">جميع الفئات</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button type="submit" className="bg-primary btn-rounded">
                            بحث
                        </Button>
                    </form>
                </GlassCard>

                {/* Items Table */}
                {items.items.length === 0 ? (
                    <GlassCard className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
                        <h3 className="text-xl text-foreground/60 mb-2">لا توجد أصناف</h3>
                        <p className="text-muted-foreground mb-4">
                            {search || categoryId ? 'جرب تغيير معايير البحث' : 'ابدأ باستيراد بيانات من Excel'}
                        </p>
                        {!search && !categoryId && (
                            <Link href="/import">
                                <Button className="bg-primary btn-rounded">
                                    استيراد بيانات
                                </Button>
                            </Link>
                        )}
                    </GlassCard>
                ) : (
                    <>
                        <div className="glass-table">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-right py-4 px-4 text-foreground/60 font-medium">كود الصنف</th>
                                            <th className="text-right py-4 px-4 text-foreground/60 font-medium">اسم الصنف</th>
                                            <th className="text-right py-4 px-4 text-foreground/60 font-medium">الفئة</th>
                                            <th className="text-right py-4 px-4 text-foreground/60 font-medium">الرصيد الإجمالي</th>
                                            <th className="py-4 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.items.map((item) => (
                                            <tr key={item.id} className="border-t border-white/5">
                                                <td className="py-4 px-4">
                                                    <code className="text-primary bg-primary/10 px-2 py-1 rounded">
                                                        {item.code}
                                                    </code>
                                                </td>
                                                <td className="py-4 px-4 text-foreground font-medium">
                                                    {item.name}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {item.category ? (
                                                        <Badge variant="secondary" className="bg-primary/10 text-foreground/80">
                                                            {item.category.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`font-bold ${item.totalStock > 0
                                                            ? 'text-green-400'
                                                            : item.totalStock < 0
                                                                ? 'text-red-400'
                                                                : 'text-foreground/60'
                                                        }`}>
                                                        {formatNumberArabic(item.totalStock)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Link href={`/items/${item.id}`}>
                                                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                                                            عرض التفاصيل
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {items.pages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={items.page <= 1 || loading}
                                    onClick={() => fetchItems(items.page - 1)}
                                    className="text-foreground/60 hover:text-foreground"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>

                                <span className="text-foreground/60 px-4">
                                    صفحة {formatNumberArabic(items.page)} من {formatNumberArabic(items.pages)}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={items.page >= items.pages || loading}
                                    onClick={() => fetchItems(items.page + 1)}
                                    className="text-foreground/60 hover:text-foreground"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
