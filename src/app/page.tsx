import { Package, MapPin, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { AppLayout, StatCard, GlassCard } from '@/components/app';
import { getDashboardStats } from './actions/movements';
import { formatNumberArabic, formatDateArabic, movementTypeToArabic } from '@/lib/arabic-utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { MovementType } from '@/generated/prisma';

interface RecentMovement {
  id: string;
  date: Date;
  type: MovementType;
  quantity: number;
  item: { id: string; name: string };
  fromLocation: { name: string } | null;
  toLocation: { name: string } | null;
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
          <p className="text-white/60">نظرة عامة على حالة المخزون</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الأصناف"
            value={formatNumberArabic(stats.totalItems)}
            icon={Package}
          />
          <StatCard
            title="المواقع/القاعات"
            value={formatNumberArabic(stats.totalLocations)}
            icon={MapPin}
          />
          <StatCard
            title="إجمالي الحركات"
            value={formatNumberArabic(stats.totalMovements)}
            icon={ArrowRightLeft}
          />
          <StatCard
            title="حركات اليوم"
            value={formatNumberArabic(stats.todayMovements)}
            icon={TrendingUp}
          />
        </div>

        {/* Recent Movements */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">أحدث الحركات</h2>
            <Link
              href="/items"
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          {stats.recentMovements.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد حركات بعد</p>
              <Link
                href="/import"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                استيراد بيانات من Excel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right py-3 px-4 text-white/60 font-medium">التاريخ</th>
                    <th className="text-right py-3 px-4 text-white/60 font-medium">الصنف</th>
                    <th className="text-right py-3 px-4 text-white/60 font-medium">النوع</th>
                    <th className="text-right py-3 px-4 text-white/60 font-medium">الكمية</th>
                    <th className="text-right py-3 px-4 text-white/60 font-medium">من/إلى</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.recentMovements as RecentMovement[]).map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white/80">
                        {formatDateArabic(movement.date)}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/items/${movement.item.id}`}
                          className="text-white hover:text-primary transition-colors"
                        >
                          {movement.item.name}
                        </Link>
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
                      <td className="py-3 px-4 text-white font-medium">
                        {formatNumberArabic(movement.quantity)}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {movement.type === 'TRANSFER' ? (
                          <>
                            {movement.fromLocation?.name}
                            <span className="mx-1">←</span>
                            {movement.toLocation?.name}
                          </>
                        ) : movement.type === 'IN' ? (
                          movement.toLocation?.name
                        ) : (
                          movement.fromLocation?.name
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/import">
            <GlassCard hover className="text-center cursor-pointer">
              <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto mb-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-white font-medium mb-1">استيراد بيانات</h3>
              <p className="text-white/50 text-sm">رفع ملف Excel</p>
            </GlassCard>
          </Link>

          <Link href="/items">
            <GlassCard hover className="text-center cursor-pointer">
              <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto mb-3">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-white font-medium mb-1">الأصناف</h3>
              <p className="text-white/50 text-sm">عرض وإدارة الأصناف</p>
            </GlassCard>
          </Link>

          <Link href="/categories">
            <GlassCard hover className="text-center cursor-pointer">
              <div className="p-3 rounded-xl bg-chart-3/20 w-fit mx-auto mb-3">
                <MapPin className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-white font-medium mb-1">الفئات</h3>
              <p className="text-white/50 text-sm">إدارة التصنيفات</p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
