'use server';

import prisma from '@/lib/db';
import { CategorySchema, SubcategorySchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

// جلب جميع الفئات
export async function getCategories() {
    return prisma.category.findMany({
        include: {
            subcategories: true,
            _count: {
                select: { items: true },
            },
        },
        orderBy: { name: 'asc' },
    });
}

// جلب فئة واحدة
export async function getCategory(id: string) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            subcategories: true,
            items: true,
        },
    });
}

// إنشاء فئة جديدة
export async function createCategory(data: { name: string; description?: string }) {
    const validated = CategorySchema.parse(data);

    const category = await prisma.category.create({
        data: validated,
    });

    revalidatePath('/categories');
    return category;
}

// تحديث فئة
export async function updateCategory(id: string, data: { name: string; description?: string }) {
    const validated = CategorySchema.parse(data);

    const category = await prisma.category.update({
        where: { id },
        data: validated,
    });

    revalidatePath('/categories');
    return category;
}

// حذف فئة
export async function deleteCategory(id: string) {
    await prisma.category.delete({
        where: { id },
    });

    revalidatePath('/categories');
}

// إنشاء فئة فرعية
export async function createSubcategory(data: { name: string; categoryId: string }) {
    const validated = SubcategorySchema.parse(data);

    const subcategory = await prisma.subcategory.create({
        data: validated,
    });

    revalidatePath('/categories');
    return subcategory;
}

// تحديث فئة فرعية
export async function updateSubcategory(id: string, data: { name: string; categoryId: string }) {
    const validated = SubcategorySchema.parse(data);

    const subcategory = await prisma.subcategory.update({
        where: { id },
        data: validated,
    });

    revalidatePath('/categories');
    return subcategory;
}

// حذف فئة فرعية
export async function deleteSubcategory(id: string) {
    await prisma.subcategory.delete({
        where: { id },
    });

    revalidatePath('/categories');
}
