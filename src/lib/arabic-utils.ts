// دوال مساعدة للتعامل مع البيانات العربية

/**
 * تحويل الأرقام العربية/الهندية إلى أرقام إنجليزية
 */
export function normalizeArabicDigits(str: string): string {
    if (!str) return str;

    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const hindiDigits = '۰۱۲۳۴۵۶۷۸۹';

    let result = str;

    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
        result = result.replace(new RegExp(hindiDigits[i], 'g'), i.toString());
    }

    return result;
}

/**
 * قاموس أنواع الحركات بالعربية
 */
const MOVEMENT_TYPE_MAP: Record<string, 'IN' | 'OUT' | 'TRANSFER'> = {
    // وارد
    'وارد': 'IN',
    'إضافة': 'IN',
    'استلام': 'IN',
    'دخول': 'IN',
    'شراء': 'IN',
    'إدخال': 'IN',
    'in': 'IN',

    // صادر
    'صادر': 'OUT',
    'صرف': 'OUT',
    'خروج': 'OUT',
    'بيع': 'OUT',
    'إخراج': 'OUT',
    'out': 'OUT',

    // تحويل
    'تحويل': 'TRANSFER',
    'نقل': 'TRANSFER',
    'transfer': 'TRANSFER',
};

/**
 * تحويل نص نوع الحركة العربي إلى enum
 */
export function parseMovementTypeArabic(type: string): 'IN' | 'OUT' | 'TRANSFER' | null {
    if (!type) return null;

    const normalized = type.trim().toLowerCase();

    for (const [key, value] of Object.entries(MOVEMENT_TYPE_MAP)) {
        if (normalized === key || normalized.includes(key)) {
            return value;
        }
    }

    return null;
}

/**
 * تحويل نوع الحركة إلى نص عربي
 */
export function movementTypeToArabic(type: 'IN' | 'OUT' | 'TRANSFER'): string {
    const map: Record<string, string> = {
        'IN': 'وارد',
        'OUT': 'صادر',
        'TRANSFER': 'تحويل',
    };
    return map[type] || type;
}

/**
 * حساب hash للصف لمنع التكرار
 */
export function calculateRowHash(row: {
    date: string;
    itemCode: string;
    type: string;
    quantity: number;
    fromLocation?: string;
    toLocation?: string;
}): string {
    const str = `${row.date}|${row.itemCode}|${row.type}|${row.quantity}|${row.fromLocation || ''}|${row.toLocation || ''}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDateArabic(date: Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/**
 * تنسيق التاريخ قصير
 */
export function formatDateShort(date: Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

/**
 * تنسيق الأرقام بالعربية
 */
export function formatNumberArabic(num: number): string {
    return new Intl.NumberFormat('ar-EG').format(num);
}

/**
 * تحليل التاريخ من صيغ متعددة
 */
export function parseFlexibleDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // تحويل الأرقام العربية
    const normalized = normalizeArabicDigits(dateStr.trim());

    // محاولة التحليل المباشر
    const directParse = new Date(normalized);
    if (!isNaN(directParse.getTime())) {
        return directParse;
    }

    // صيغ شائعة: DD/MM/YYYY, DD-MM-YYYY
    const patterns = [
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // DD/MM/YYYY
        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, // YYYY/MM/DD
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
            const [, a, b, c] = match;

            // DD/MM/YYYY
            if (pattern === patterns[0]) {
                const date = new Date(parseInt(c), parseInt(b) - 1, parseInt(a));
                if (!isNaN(date.getTime())) return date;
            }

            // YYYY/MM/DD
            if (pattern === patterns[1]) {
                const date = new Date(parseInt(a), parseInt(b) - 1, parseInt(c));
                if (!isNaN(date.getTime())) return date;
            }
        }
    }

    return null;
}
