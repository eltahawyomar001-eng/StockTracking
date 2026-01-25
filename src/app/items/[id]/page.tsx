import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppLayout, GlassCard } from '@/components/app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ArrowRight, MapPin, ArrowRightLeft } from 'lucide-react';
import { getItem } from '@/app/actions/items';
import { formatNumberArabic, formatDateArabic, movementTypeToArabic } from '@/lib/arabic-utils';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
    const { id } = await params;
    const item = await getItem(id);

    if (!item) {
        notFound();
    }

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in-up">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-foreground/60">
                    <Link href="/items" className="hover:text-foreground transition-colors">
                        الأصناف
                    </Link>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span className="text-foreground">{item.name}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
                                <code className="text-primary bg-primary/10 px-2 py-1 rounded text-sm">
                                    {item.code}
                                </code>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            {item.category && (
                                <Badge variant="secondary" className="bg-primary/10">
                                    {item.category.name}
                                </Badge>
                            )}
                            {item.subcategory && (
                                <Badge variant="secondary" className="bg-white/5">
                                    {item.subcategory.name}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <GlassCard className="text-center px-8 py-4">
                        <p className="text-foreground/60 text-sm mb-1">الرصيد الإجمالي</p>
                        <p className={`text-4xl font-bold ${item.totalStock > 0
                            ? 'text-green-400'
                            : item.totalStock < 0
                                ? 'text-red-400'
                                : 'text-foreground/60'
                            }`}>
                            {formatNumberArabic(item.totalStock)}
                        </p>
                    </GlassCard>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="stock" className="space-y-4">
                    <TabsList className="glass-card-light p-1 rounded-xl">
                        <TabsTrigger
                            value="stock"
                            className="data-[state=active]:bg-primary/20 rounded-lg px-4"
                        >
                            <MapPin className="w-4 h-4 ml-2" />
                            الرصيد حسب الموقع
                        </TabsTrigger>
                        <TabsTrigger
                            value="movements"
                            className="data-[state=active]:bg-primary/20 rounded-lg px-4"
                        >
                            <ArrowRightLeft className="w-4 h-4 ml-2" />
                            سجل الحركات
                        </TabsTrigger>
                    </TabsList>

                    {/* Stock by Location */}
                    <TabsContent value="stock">
                        <GlassCard>
                            <h3 className="text-lg font-semibold text-foreground mb-4">الرصيد حسب الموقع</h3>

                            {item.stockSnapshots.length === 0 ? (
                                <div className="text-center py-8 text-foreground/50">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>لا يوجد رصيد في أي موقع</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {item.stockSnapshots.map((snapshot: { id: string; onHand: number; location: { name: string } }) => (
                                        <div
                                            key={snapshot.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-primary/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-accent/20">
                                                    <MapPin className="w-5 h-5 text-accent" />
                                                </div>
                                                <span className="text-foreground font-medium">
                                                    {snapshot.location.name}
                                                </span>
                                            </div>
                                            <span className={`text-xl font-bold ${snapshot.onHand > 0
                                                ? 'text-green-400'
                                                : snapshot.onHand < 0
                                                    ? 'text-red-400'
                                                    : 'text-foreground/60'
                                                }`}>
                                                {formatNumberArabic(snapshot.onHand)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </TabsContent>

                    {/* Movements History */}
                    <TabsContent value="movements">
                        <GlassCard>
                            <h3 className="text-lg font-semibold text-foreground mb-4">سجل الحركات</h3>

                            {item.movements.length === 0 ? (
                                <div className="text-center py-8 text-foreground/50">
                                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>لا توجد حركات مسجلة</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-primary/20">
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">التاريخ</th>
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">النوع</th>
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">الكمية</th>
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">من</th>
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">إلى</th>
                                                <th className="text-right py-3 px-4 text-foreground/60 font-medium">ملاحظات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.movements.map((movement: { id: string; date: Date; type: 'IN' | 'OUT' | 'TRANSFER'; quantity: number; fromLocation?: { name: string } | null; toLocation?: { name: string } | null; note?: string | null }) => (
                                                <tr
                                                    key={movement.id}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="py-3 px-4 text-foreground/80">
                                                        {formatDateArabic(movement.date)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge
                                                            className={
                                                                movement.type === 'IN'
                                                                    ? 'badge-in'
                                                                    : movement.type === 'OUT'
                                                                        ? 'badge-out'
                                                                        : 'badge-transfer'
                                                            }
                                                        >
                                                            {movementTypeToArabic(movement.type)}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-foreground font-medium">
                                                        {formatNumberArabic(movement.quantity)}
                                                    </td>
                                                    <td className="py-3 px-4 text-foreground/60">
                                                        {movement.fromLocation?.name || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-foreground/60">
                                                        {movement.toLocation?.name || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-foreground/50 text-sm max-w-xs truncate">
                                                        {movement.note || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </GlassCard>
                    </TabsContent>
                </Tabs>

                {/* Back Button */}
                <div>
                    <Link href="/items">
                        <Button variant="ghost" className="text-foreground/60 hover:text-foreground">
                            <ArrowRight className="w-4 h-4 ml-2" />
                            العودة للأصناف
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
