'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface GetItemsParams {
    search?: string;
    categoryId?: string;
    subcategoryId?: string;
    page?: number;
    limit?: number;
}

// جلب الأصناف مع البحث والفلاتر
export async function getItems(params: GetItemsParams = {}) {
    const { search, categoryId, subcategoryId, page = 1, limit = 20 } = params;

    const where = {
        AND: [
            search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { code: { contains: search, mode: 'insensitive' as const } },
                ],
            } : {},
            categoryId ? { categoryId } : {},
            subcategoryId ? { subcategoryId } : {},
        ],
    };

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where,
            include: {
                category: true,
                subcategory: true,
                stockSnapshots: {
                    include: { location: true },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: 'asc' },
        }),
        prisma.item.count({ where }),
    ]);

    // حساب الرصيد الإجمالي لكل صنف
    const itemsWithTotal = items.map((item: typeof items[0]) => ({
        ...item,
        totalStock: item.stockSnapshots.reduce((sum: number, s: { onHand: number }) => sum + s.onHand, 0),
    }));

    return {
        items: itemsWithTotal,
        total,
        pages: Math.ceil(total / limit),
        page,
    };
}

// جلب صنف واحد مع التفاصيل
export async function getItem(id: string) {
    const item = await prisma.item.findUnique({
        where: { id },
        include: {
            category: true,
            subcategory: true,
            stockSnapshots: {
                include: { location: true },
                orderBy: { location: { name: 'asc' } },
            },
            movements: {
                include: {
                    fromLocation: true,
                    toLocation: true,
                },
                orderBy: { date: 'desc' },
                take: 100,
            },
        },
    });

    if (!item) return null;

    return {
        ...item,
        totalStock: item.stockSnapshots.reduce((sum: number, s: { onHand: number }) => sum + s.onHand, 0),
    };
}

// جلب صنف بالكود
export async function getItemByCode(code: string) {
    return prisma.item.findUnique({
        where: { code },
        include: {
            category: true,
            subcategory: true,
        },
    });
}

// إنشاء أو الحصول على صنف
export async function getOrCreateItem(data: {
    code: string;
    name: string;
    categoryId?: string;
    subcategoryId?: string;
}) {
    let item = await prisma.item.findUnique({
        where: { code: data.code },
    });

    if (!item) {
        item = await prisma.item.create({
            data: {
                code: data.code,
                name: data.name,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId,
            },
        });
    }

    return item;
}

// إحصائيات الأصناف
export async function getItemsStats() {
    const [totalItems, totalMovements, lowStockItems] = await Promise.all([
        prisma.item.count(),
        prisma.movement.count(),
        prisma.stockSnapshot.count({
            where: { onHand: { lt: 10 } },
        }),
    ]);

    return { totalItems, totalMovements, lowStockItems };
}
