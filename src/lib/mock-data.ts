// Mock data for testing without database connection
import type { MovementType } from '@/generated/prisma';

// Types matching Prisma schema
export interface MockCategory {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MockSubcategory {
    id: string;
    name: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MockLocation {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MockItem {
    id: string;
    code: string;
    name: string;
    categoryId: string | null;
    subcategoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MockMovement {
    id: string;
    date: Date;
    type: MovementType;
    quantity: number;
    itemId: string;
    fromLocationId: string | null;
    toLocationId: string | null;
    note: string | null;
    sourceFileName: string | null;
    sourceRowHash: string | null;
    createdAt: Date;
}

export interface MockStockSnapshot {
    id: string;
    itemId: string;
    locationId: string;
    onHand: number;
    updatedAt: Date;
}

// Mock Categories
export const mockCategories: MockCategory[] = [
    {
        id: 'cat-1',
        name: 'إلكترونيات',
        description: 'الأجهزة والمعدات الإلكترونية',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-2',
        name: 'مواد غذائية',
        description: 'المواد الغذائية والمشروبات',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-3',
        name: 'قرطاسية',
        description: 'أدوات مكتبية وقرطاسية',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-4',
        name: 'أثاث',
        description: 'الأثاث المكتبي والمنزلي',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

// Mock Subcategories
export const mockSubcategories: MockSubcategory[] = [
    {
        id: 'sub-1',
        name: 'حواسيب',
        categoryId: 'cat-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'sub-2',
        name: 'هواتف',
        categoryId: 'cat-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'sub-3',
        name: 'معجنات',
        categoryId: 'cat-2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'sub-4',
        name: 'مشروبات',
        categoryId: 'cat-2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'sub-5',
        name: 'أقلام',
        categoryId: 'cat-3',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

// Mock Locations
export const mockLocations: MockLocation[] = [
    {
        id: 'loc-1',
        name: 'المخزن الرئيسي',
        description: 'المخزن الرئيسي للمواد',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'loc-2',
        name: 'القاعة A',
        description: 'قاعة التخزين الأولى',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'loc-3',
        name: 'القاعة B',
        description: 'قاعة التخزين الثانية',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'loc-4',
        name: 'المخزن الثانوي',
        description: 'مخزن احتياطي',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

// Mock Items
export const mockItems: MockItem[] = [
    {
        id: 'item-1',
        code: 'ELEC-001',
        name: 'لابتوب Dell XPS 15',
        categoryId: 'cat-1',
        subcategoryId: 'sub-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-2',
        code: 'ELEC-002',
        name: 'هاتف iPhone 15',
        categoryId: 'cat-1',
        subcategoryId: 'sub-2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-3',
        code: 'FOOD-001',
        name: 'كعك شوكولاتة',
        categoryId: 'cat-2',
        subcategoryId: 'sub-3',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-4',
        code: 'FOOD-002',
        name: 'عصير برتقال',
        categoryId: 'cat-2',
        subcategoryId: 'sub-4',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-5',
        code: 'STAT-001',
        name: 'قلم حبر أزرق',
        categoryId: 'cat-3',
        subcategoryId: 'sub-5',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-6',
        code: 'FURN-001',
        name: 'كرسي مكتب',
        categoryId: 'cat-4',
        subcategoryId: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'item-7',
        code: 'ELEC-003',
        name: 'ماوس لاسلكي',
        categoryId: 'cat-1',
        subcategoryId: 'sub-1',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
    {
        id: 'item-8',
        code: 'STAT-002',
        name: 'دفتر ملاحظات',
        categoryId: 'cat-3',
        subcategoryId: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
];

// Mock Movements
export const mockMovements: MockMovement[] = [
    {
        id: 'mov-1',
        date: new Date('2024-01-10'),
        type: 'IN',
        quantity: 10,
        itemId: 'item-1',
        fromLocationId: null,
        toLocationId: 'loc-1',
        note: 'شحنة جديدة',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-10'),
    },
    {
        id: 'mov-2',
        date: new Date('2024-01-11'),
        type: 'IN',
        quantity: 25,
        itemId: 'item-2',
        fromLocationId: null,
        toLocationId: 'loc-1',
        note: 'وارد من المورد',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-11'),
    },
    {
        id: 'mov-3',
        date: new Date('2024-01-12'),
        type: 'TRANSFER',
        quantity: 5,
        itemId: 'item-1',
        fromLocationId: 'loc-1',
        toLocationId: 'loc-2',
        note: 'نقل للقاعة A',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-12'),
    },
    {
        id: 'mov-4',
        date: new Date('2024-01-13'),
        type: 'OUT',
        quantity: 2,
        itemId: 'item-1',
        fromLocationId: 'loc-2',
        toLocationId: null,
        note: 'بيع للعميل',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-13'),
    },
    {
        id: 'mov-5',
        date: new Date('2024-01-15'),
        type: 'IN',
        quantity: 100,
        itemId: 'item-3',
        fromLocationId: null,
        toLocationId: 'loc-1',
        note: 'إنتاج جديد',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: 'mov-6',
        date: new Date('2024-01-16'),
        type: 'IN',
        quantity: 50,
        itemId: 'item-5',
        fromLocationId: null,
        toLocationId: 'loc-3',
        note: 'مشتريات قرطاسية',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-16'),
    },
    {
        id: 'mov-7',
        date: new Date('2024-01-20'),
        type: 'TRANSFER',
        quantity: 10,
        itemId: 'item-2',
        fromLocationId: 'loc-1',
        toLocationId: 'loc-3',
        note: 'إعادة توزيع المخزون',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: 'mov-8',
        date: new Date('2026-01-25'),
        type: 'IN',
        quantity: 15,
        itemId: 'item-7',
        fromLocationId: null,
        toLocationId: 'loc-1',
        note: 'شحنة اليوم',
        sourceFileName: null,
        sourceRowHash: null,
        createdAt: new Date('2026-01-25'),
    },
];

// Mock Stock Snapshots
export const mockStockSnapshots: MockStockSnapshot[] = [
    {
        id: 'stock-1',
        itemId: 'item-1',
        locationId: 'loc-1',
        onHand: 5, // 10 IN - 5 TRANSFER
        updatedAt: new Date('2024-01-12'),
    },
    {
        id: 'stock-2',
        itemId: 'item-1',
        locationId: 'loc-2',
        onHand: 3, // 5 TRANSFER - 2 OUT
        updatedAt: new Date('2024-01-13'),
    },
    {
        id: 'stock-3',
        itemId: 'item-2',
        locationId: 'loc-1',
        onHand: 15, // 25 IN - 10 TRANSFER
        updatedAt: new Date('2024-01-20'),
    },
    {
        id: 'stock-4',
        itemId: 'item-2',
        locationId: 'loc-3',
        onHand: 10, // 10 TRANSFER
        updatedAt: new Date('2024-01-20'),
    },
    {
        id: 'stock-5',
        itemId: 'item-3',
        locationId: 'loc-1',
        onHand: 100, // 100 IN
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'stock-6',
        itemId: 'item-5',
        locationId: 'loc-3',
        onHand: 50, // 50 IN
        updatedAt: new Date('2024-01-16'),
    },
    {
        id: 'stock-7',
        itemId: 'item-7',
        locationId: 'loc-1',
        onHand: 15, // 15 IN today
        updatedAt: new Date('2026-01-25'),
    },
];

// Export all mock data
export const mockData = {
    categories: mockCategories,
    subcategories: mockSubcategories,
    locations: mockLocations,
    items: mockItems,
    movements: mockMovements,
    stockSnapshots: mockStockSnapshots,
};
