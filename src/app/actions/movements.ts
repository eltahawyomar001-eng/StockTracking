'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { MovementType } from '@/generated/prisma';

interface CreateMovementData {
    date: Date;
    type: MovementType;
    quantity: number;
    itemId: string;
    fromLocationId?: string;
    toLocationId?: string;
    note?: string;
    sourceFileName?: string;
    sourceRowHash?: string;
}

// إنشاء حركة مع تحديث الرصيد
export async function createMovement(data: CreateMovementData) {
    return prisma.$transaction(async (tx: typeof prisma) => {
        // التحقق من عدم التكرار
        if (data.sourceRowHash) {
            const existing = await tx.movement.findUnique({
                where: { sourceRowHash: data.sourceRowHash },
            });
            if (existing) {
                throw new Error('هذه الحركة موجودة مسبقاً');
            }
        }

        // التحقق من الرصيد قبل الخصم
        if (data.type === 'OUT' || data.type === 'TRANSFER') {
            if (!data.fromLocationId) {
                throw new Error('موقع المصدر مطلوب');
            }

            const snapshot = await tx.stockSnapshot.findUnique({
                where: {
                    itemId_locationId: {
                        itemId: data.itemId,
                        locationId: data.fromLocationId,
                    },
                },
            });

            const currentStock = snapshot?.onHand || 0;
            if (currentStock < data.quantity) {
                throw new Error(`الرصيد غير كافٍ. الرصيد الحالي: ${currentStock}، المطلوب: ${data.quantity}`);
            }
        }

        // إنشاء الحركة
        const movement = await tx.movement.create({
            data: {
                date: data.date,
                type: data.type,
                quantity: data.quantity,
                itemId: data.itemId,
                fromLocationId: data.fromLocationId,
                toLocationId: data.toLocationId,
                note: data.note,
                sourceFileName: data.sourceFileName,
                sourceRowHash: data.sourceRowHash,
            },
        });

        // تحديث الأرصدة
        if (data.type === 'IN' && data.toLocationId) {
            await updateStock(tx, data.itemId, data.toLocationId, data.quantity);
        }

        if (data.type === 'OUT' && data.fromLocationId) {
            await updateStock(tx, data.itemId, data.fromLocationId, -data.quantity);
        }

        if (data.type === 'TRANSFER' && data.fromLocationId && data.toLocationId) {
            await updateStock(tx, data.itemId, data.fromLocationId, -data.quantity);
            await updateStock(tx, data.itemId, data.toLocationId, data.quantity);
        }

        return movement;
    });
}

// تحديث رصيد الموقع
async function updateStock(
    tx: typeof prisma,
    itemId: string,
    locationId: string,
    delta: number
) {
    const existing = await tx.stockSnapshot.findUnique({
        where: {
            itemId_locationId: { itemId, locationId },
        },
    });

    if (existing) {
        await tx.stockSnapshot.update({
            where: { id: existing.id },
            data: { onHand: existing.onHand + delta },
        });
    } else {
        await tx.stockSnapshot.create({
            data: {
                itemId,
                locationId,
                onHand: delta,
            },
        });
    }
}

// جلب آخر الحركات
export async function getRecentMovements(limit = 10) {
    return prisma.movement.findMany({
        include: {
            item: true,
            fromLocation: true,
            toLocation: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

// جلب حركات صنف معين
export async function getItemMovements(
    itemId: string,
    options: {
        type?: MovementType;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    } = {}
) {
    const { type, startDate, endDate, page = 1, limit = 20 } = options;

    const where = {
        itemId,
        ...(type && { type }),
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
    };

    const [movements, total] = await Promise.all([
        prisma.movement.findMany({
            where,
            include: {
                fromLocation: true,
                toLocation: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { date: 'desc' },
        }),
        prisma.movement.count({ where }),
    ]);

    return {
        movements,
        total,
        pages: Math.ceil(total / limit),
        page,
    };
}

// إحصائيات لوحة التحكم
export async function getDashboardStats() {
    const [totalItems, totalLocations, totalMovements, recentMovements] = await Promise.all([
        prisma.item.count(),
        prisma.location.count(),
        prisma.movement.count(),
        getRecentMovements(5),
    ]);

    // حركات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMovements = await prisma.movement.count({
        where: { createdAt: { gte: today } },
    });

    return {
        totalItems,
        totalLocations,
        totalMovements,
        todayMovements,
        recentMovements,
    };
}
