import { z } from 'zod';

// Schema للتحقق من صف الاستيراد
export const ImportRowSchema = z.object({
    date: z.string().min(1, 'التاريخ مطلوب'),
    itemCode: z.string().min(1, 'كود الصنف مطلوب'),
    itemName: z.string().min(1, 'اسم الصنف مطلوب'),
    quantity: z.number().positive('الكمية يجب أن تكون رقم موجب'),
    movementType: z.enum(['IN', 'OUT', 'TRANSFER'], {
        errorMap: () => ({ message: 'نوع الحركة غير صحيح (وارد/صادر/تحويل)' }),
    }),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    note: z.string().optional(),
}).refine(
    (data) => {
        // التحقق من المواقع حسب نوع الحركة
        if (data.movementType === 'IN' && !data.toLocation) {
            return false;
        }
        if (data.movementType === 'OUT' && !data.fromLocation) {
            return false;
        }
        if (data.movementType === 'TRANSFER' && (!data.fromLocation || !data.toLocation)) {
            return false;
        }
        return true;
    },
    {
        message: 'الموقع المصدر أو الوجهة مطلوب حسب نوع الحركة',
    }
);

export type ImportRow = z.infer<typeof ImportRowSchema>;

// Schema لتعيين الأعمدة
export const ColumnMappingSchema = z.object({
    date: z.string().min(1, 'عمود التاريخ مطلوب'),
    itemCode: z.string().min(1, 'عمود كود الصنف مطلوب'),
    itemName: z.string().min(1, 'عمود اسم الصنف مطلوب'),
    quantity: z.string().min(1, 'عمود الكمية مطلوب'),
    movementType: z.string().min(1, 'عمود نوع الحركة مطلوب'),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    note: z.string().optional(),
});

export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;

// Schema للفئة
export const CategorySchema = z.object({
    name: z.string().min(1, 'اسم الفئة مطلوب').max(100, 'اسم الفئة طويل جداً'),
    description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// Schema للفئة الفرعية
export const SubcategorySchema = z.object({
    name: z.string().min(1, 'اسم الفئة الفرعية مطلوب').max(100, 'اسم الفئة الفرعية طويل جداً'),
    categoryId: z.string().min(1, 'الفئة الرئيسية مطلوبة'),
});

export type SubcategoryInput = z.infer<typeof SubcategorySchema>;

// Schema للموقع
export const LocationSchema = z.object({
    name: z.string().min(1, 'اسم الموقع مطلوب').max(100, 'اسم الموقع طويل جداً'),
    description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

export type LocationInput = z.infer<typeof LocationSchema>;

// Schema للصنف
export const ItemSchema = z.object({
    code: z.string().min(1, 'كود الصنف مطلوب').max(50, 'كود الصنف طويل جداً'),
    name: z.string().min(1, 'اسم الصنف مطلوب').max(200, 'اسم الصنف طويل جداً'),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
});

export type ItemInput = z.infer<typeof ItemSchema>;

// Schema للحركة
export const MovementSchema = z.object({
    date: z.date(),
    type: z.enum(['IN', 'OUT', 'TRANSFER']),
    quantity: z.number().positive('الكمية يجب أن تكون رقم موجب'),
    itemId: z.string().min(1, 'الصنف مطلوب'),
    fromLocationId: z.string().optional(),
    toLocationId: z.string().optional(),
    note: z.string().max(500, 'الملاحظة طويلة جداً').optional(),
}).refine(
    (data) => {
        if (data.type === 'IN' && !data.toLocationId) return false;
        if (data.type === 'OUT' && !data.fromLocationId) return false;
        if (data.type === 'TRANSFER' && (!data.fromLocationId || !data.toLocationId)) return false;
        return true;
    },
    {
        message: 'الموقع المصدر أو الوجهة مطلوب حسب نوع الحركة',
    }
);

export type MovementInput = z.infer<typeof MovementSchema>;
