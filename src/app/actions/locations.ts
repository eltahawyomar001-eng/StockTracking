'use server';

import prisma from '@/lib/db';
import { LocationSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

// جلب جميع المواقع
export async function getLocations() {
    return prisma.location.findMany({
        include: {
            _count: {
                select: { stockSnapshots: true },
            },
        },
        orderBy: { name: 'asc' },
    });
}

// جلب موقع واحد
export async function getLocation(id: string) {
    return prisma.location.findUnique({
        where: { id },
        include: {
            stockSnapshots: {
                include: {
                    item: true,
                },
            },
        },
    });
}

// إنشاء موقع جديد
export async function createLocation(data: { name: string; description?: string }) {
    const validated = LocationSchema.parse(data);

    const location = await prisma.location.create({
        data: validated,
    });

    revalidatePath('/locations');
    return location;
}

// تحديث موقع
export async function updateLocation(id: string, data: { name: string; description?: string }) {
    const validated = LocationSchema.parse(data);

    const location = await prisma.location.update({
        where: { id },
        data: validated,
    });

    revalidatePath('/locations');
    return location;
}

// حذف موقع
export async function deleteLocation(id: string) {
    // التحقق من عدم وجود أرصدة مرتبطة
    const stockCount = await prisma.stockSnapshot.count({
        where: { locationId: id, onHand: { not: 0 } },
    });

    if (stockCount > 0) {
        throw new Error('لا يمكن حذف الموقع لوجود أرصدة مخزون مرتبطة به');
    }

    await prisma.location.delete({
        where: { id },
    });

    revalidatePath('/locations');
}
