'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ProcessedRow } from '@/lib/excel-parser';

interface ImportResult {
    itemsCreated: number;
    itemsUpdated: number;
    movementsCreated: number;
    categoriesCreated: number;
    subcategoriesCreated: number;
    locationsCreated: number;
    errors: string[];
}

// استيراد البيانات من Excel
export async function importExcelData(
    rows: ProcessedRow[],
    fileName: string
): Promise<ImportResult> {
    const result: ImportResult = {
        itemsCreated: 0,
        itemsUpdated: 0,
        movementsCreated: 0,
        categoriesCreated: 0,
        subcategoriesCreated: 0,
        locationsCreated: 0,
        errors: [],
    };

    // تخزين مؤقت للكيانات
    const categoryCache = new Map<string, string>();
    const subcategoryCache = new Map<string, string>();
    const locationCache = new Map<string, string>();
    const itemCache = new Map<string, string>();

    // جلب البيانات الموجودة
    const [categories, subcategories, locations, items] = await Promise.all([
        prisma.category.findMany(),
        prisma.subcategory.findMany(),
        prisma.location.findMany(),
        prisma.item.findMany(),
    ]);

    categories.forEach((c) => categoryCache.set(c.name, c.id));
    subcategories.forEach((s) => subcategoryCache.set(`${s.categoryId}:${s.name}`, s.id));
    locations.forEach((l) => locationCache.set(l.name, l.id));
    items.forEach((i) => itemCache.set(i.code, i.id));

    for (const row of rows) {
        try {
            const { data, hash } = row;

            // إنشاء/الحصول على الفئة
            let categoryId: string | undefined;
            if (data.category) {
                if (!categoryCache.has(data.category)) {
                    const category = await prisma.category.create({
                        data: { name: data.category },
                    });
                    categoryCache.set(data.category, category.id);
                    result.categoriesCreated++;
                }
                categoryId = categoryCache.get(data.category);
            }

            // إنشاء/الحصول على الفئة الفرعية
            let subcategoryId: string | undefined;
            if (data.subcategory && categoryId) {
                const key = `${categoryId}:${data.subcategory}`;
                if (!subcategoryCache.has(key)) {
                    const subcategory = await prisma.subcategory.create({
                        data: { name: data.subcategory, categoryId },
                    });
                    subcategoryCache.set(key, subcategory.id);
                    result.subcategoriesCreated++;
                }
                subcategoryId = subcategoryCache.get(key);
            }

            // إنشاء/الحصول على المواقع
            let fromLocationId: string | undefined;
            let toLocationId: string | undefined;

            if (data.fromLocation) {
                if (!locationCache.has(data.fromLocation)) {
                    const location = await prisma.location.create({
                        data: { name: data.fromLocation },
                    });
                    locationCache.set(data.fromLocation, location.id);
                    result.locationsCreated++;
                }
                fromLocationId = locationCache.get(data.fromLocation);
            }

            if (data.toLocation) {
                if (!locationCache.has(data.toLocation)) {
                    const location = await prisma.location.create({
                        data: { name: data.toLocation },
                    });
                    locationCache.set(data.toLocation, location.id);
                    result.locationsCreated++;
                }
                toLocationId = locationCache.get(data.toLocation);
            }

            // إنشاء/الحصول على الصنف
            let itemId: string;
            if (!itemCache.has(data.itemCode)) {
                const item = await prisma.item.create({
                    data: {
                        code: data.itemCode,
                        name: data.itemName,
                        categoryId,
                        subcategoryId,
                    },
                });
                itemCache.set(data.itemCode, item.id);
                result.itemsCreated++;
                itemId = item.id;
            } else {
                itemId = itemCache.get(data.itemCode)!;
                result.itemsUpdated++;
            }

            // التحقق من عدم التكرار
            const existingMovement = await prisma.movement.findUnique({
                where: { sourceRowHash: hash },
            });

            if (existingMovement) {
                result.errors.push(`سطر ${row.rowNumber}: الحركة موجودة مسبقاً`);
                continue;
            }

            // إنشاء الحركة مع تحديث الرصيد
            await prisma.$transaction(async (tx) => {
                // التحقق من الرصيد
                if (data.movementType === 'OUT' || data.movementType === 'TRANSFER') {
                    if (!fromLocationId) throw new Error('موقع المصدر مطلوب');

                    const snapshot = await tx.stockSnapshot.findUnique({
                        where: { itemId_locationId: { itemId, locationId: fromLocationId } },
                    });

                    const currentStock = snapshot?.onHand || 0;
                    if (currentStock < data.quantity) {
                        throw new Error(`الرصيد غير كافٍ. الحالي: ${currentStock}، المطلوب: ${data.quantity}`);
                    }
                }

                // إنشاء الحركة
                await tx.movement.create({
                    data: {
                        date: new Date(data.date),
                        type: data.movementType,
                        quantity: data.quantity,
                        itemId,
                        fromLocationId,
                        toLocationId,
                        note: data.note,
                        sourceFileName: fileName,
                        sourceRowHash: hash,
                    },
                });

                // تحديث الأرصدة
                if (data.movementType === 'IN' && toLocationId) {
                    await updateSnapshotInTx(tx, itemId, toLocationId, data.quantity);
                }

                if (data.movementType === 'OUT' && fromLocationId) {
                    await updateSnapshotInTx(tx, itemId, fromLocationId, -data.quantity);
                }

                if (data.movementType === 'TRANSFER' && fromLocationId && toLocationId) {
                    await updateSnapshotInTx(tx, itemId, fromLocationId, -data.quantity);
                    await updateSnapshotInTx(tx, itemId, toLocationId, data.quantity);
                }

                result.movementsCreated++;
            });

        } catch (error) {
            result.errors.push(
                `سطر ${row.rowNumber}: ${error instanceof Error ? error.message : 'خطأ غير متوقع'}`
            );
        }
    }

    revalidatePath('/');
    revalidatePath('/items');
    revalidatePath('/import');

    return result;
}

// تحديث الرصيد داخل المعاملة
async function updateSnapshotInTx(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    itemId: string,
    locationId: string,
    delta: number
) {
    const existing = await tx.stockSnapshot.findUnique({
        where: { itemId_locationId: { itemId, locationId } },
    });

    if (existing) {
        await tx.stockSnapshot.update({
            where: { id: existing.id },
            data: { onHand: existing.onHand + delta },
        });
    } else {
        await tx.stockSnapshot.create({
            data: { itemId, locationId, onHand: delta },
        });
    }
}
