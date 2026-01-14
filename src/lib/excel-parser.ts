import * as XLSX from 'xlsx';
import { normalizeArabicDigits, parseMovementTypeArabic, parseFlexibleDate, calculateRowHash } from './arabic-utils';
import { ImportRowSchema, type ImportRow, type ColumnMapping } from './validators';

export interface ExcelSheet {
    name: string;
    headers: string[];
    rows: Record<string, unknown>[];
}

export interface ParsedExcelData {
    sheets: ExcelSheet[];
    selectedSheet: number;
}

export interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export interface ProcessedRow {
    data: ImportRow;
    hash: string;
    rowNumber: number;
}

export interface ImportResult {
    validRows: ProcessedRow[];
    errors: ValidationError[];
    totalRows: number;
}

/**
 * قراءة ملف Excel واستخراج البيانات
 */
export function parseExcelFile(buffer: ArrayBuffer): ParsedExcelData {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    const sheets: ExcelSheet[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            header: 1,
            raw: false,
            dateNF: 'yyyy-mm-dd',
        });

        if (jsonData.length === 0) {
            return { name, headers: [], rows: [] };
        }

        // أول صف هو العناوين
        const headers = (jsonData[0] as unknown[]).map((h) => String(h || '').trim());

        // تحويل باقي الصفوف إلى كائنات
        const rows = jsonData.slice(1).map((row) => {
            const rowArray = row as unknown[];
            const obj: Record<string, unknown> = {};
            headers.forEach((header, index) => {
                if (header) {
                    obj[header] = rowArray[index];
                }
            });
            return obj;
        }).filter((row) => Object.values(row).some((v) => v !== undefined && v !== ''));

        return { name, headers, rows };
    });

    return { sheets, selectedSheet: 0 };
}

/**
 * تطبيق تعيين الأعمدة وتحويل البيانات
 */
export function applyColumnMapping(
    rows: Record<string, unknown>[],
    mapping: ColumnMapping
): ImportResult {
    const validRows: ProcessedRow[] = [];
    const errors: ValidationError[] = [];

    rows.forEach((row, index) => {
        const rowNumber = index + 2; // +2 لأن الصف الأول عناوين والـindex يبدأ من 0

        try {
            // استخراج القيم حسب التعيين
            const rawDate = String(row[mapping.date] || '');
            const rawItemCode = String(row[mapping.itemCode] || '');
            const rawItemName = String(row[mapping.itemName] || '');
            const rawQuantity = String(row[mapping.quantity] || '');
            const rawMovementType = String(row[mapping.movementType] || '');
            const rawFromLocation = mapping.fromLocation ? String(row[mapping.fromLocation] || '') : '';
            const rawToLocation = mapping.toLocation ? String(row[mapping.toLocation] || '') : '';
            const rawCategory = mapping.category ? String(row[mapping.category] || '') : '';
            const rawSubcategory = mapping.subcategory ? String(row[mapping.subcategory] || '') : '';
            const rawNote = mapping.note ? String(row[mapping.note] || '') : '';

            // تحويل الأرقام العربية
            const normalizedQuantity = normalizeArabicDigits(rawQuantity);
            const quantity = parseFloat(normalizedQuantity);

            if (isNaN(quantity) || quantity <= 0) {
                errors.push({
                    row: rowNumber,
                    field: 'quantity',
                    message: `سطر ${rowNumber}: الكمية غير صحيحة "${rawQuantity}"`,
                });
                return;
            }

            // تحويل نوع الحركة
            const movementType = parseMovementTypeArabic(rawMovementType);
            if (!movementType) {
                errors.push({
                    row: rowNumber,
                    field: 'movementType',
                    message: `سطر ${rowNumber}: نوع الحركة غير معروف "${rawMovementType}"`,
                });
                return;
            }

            // تحليل التاريخ
            const date = parseFlexibleDate(rawDate);
            if (!date) {
                errors.push({
                    row: rowNumber,
                    field: 'date',
                    message: `سطر ${rowNumber}: تنسيق التاريخ غير صحيح "${rawDate}"`,
                });
                return;
            }

            // التحقق من كود الصنف
            const itemCode = normalizeArabicDigits(rawItemCode).trim();
            if (!itemCode) {
                errors.push({
                    row: rowNumber,
                    field: 'itemCode',
                    message: `سطر ${rowNumber}: كود الصنف مطلوب`,
                });
                return;
            }

            // التحقق من اسم الصنف
            const itemName = rawItemName.trim();
            if (!itemName) {
                errors.push({
                    row: rowNumber,
                    field: 'itemName',
                    message: `سطر ${rowNumber}: اسم الصنف مطلوب`,
                });
                return;
            }

            // التحقق من المواقع حسب نوع الحركة
            const fromLocation = rawFromLocation.trim();
            const toLocation = rawToLocation.trim();

            if (movementType === 'IN' && !toLocation) {
                errors.push({
                    row: rowNumber,
                    field: 'toLocation',
                    message: `سطر ${rowNumber}: موقع الوجهة مطلوب لحركة الوارد`,
                });
                return;
            }

            if (movementType === 'OUT' && !fromLocation) {
                errors.push({
                    row: rowNumber,
                    field: 'fromLocation',
                    message: `سطر ${rowNumber}: موقع المصدر مطلوب لحركة الصادر`,
                });
                return;
            }

            if (movementType === 'TRANSFER' && (!fromLocation || !toLocation)) {
                errors.push({
                    row: rowNumber,
                    field: 'locations',
                    message: `سطر ${rowNumber}: موقع المصدر والوجهة مطلوبان لحركة التحويل`,
                });
                return;
            }

            const importRow: ImportRow = {
                date: date.toISOString(),
                itemCode,
                itemName,
                quantity: Math.floor(quantity),
                movementType,
                fromLocation: fromLocation || undefined,
                toLocation: toLocation || undefined,
                category: rawCategory.trim() || undefined,
                subcategory: rawSubcategory.trim() || undefined,
                note: rawNote.trim() || undefined,
            };

            // التحقق بواسطة Zod
            const validation = ImportRowSchema.safeParse(importRow);
            if (!validation.success) {
                validation.error.errors.forEach((err) => {
                    errors.push({
                        row: rowNumber,
                        field: err.path.join('.'),
                        message: `سطر ${rowNumber}: ${err.message}`,
                    });
                });
                return;
            }

            // حساب hash للصف
            const hash = calculateRowHash({
                date: importRow.date,
                itemCode: importRow.itemCode,
                type: importRow.movementType,
                quantity: importRow.quantity,
                fromLocation: importRow.fromLocation,
                toLocation: importRow.toLocation,
            });

            validRows.push({
                data: validation.data,
                hash,
                rowNumber,
            });

        } catch (error) {
            errors.push({
                row: rowNumber,
                field: 'unknown',
                message: `سطر ${rowNumber}: خطأ غير متوقع في معالجة البيانات`,
            });
        }
    });

    return {
        validRows,
        errors,
        totalRows: rows.length,
    };
}

/**
 * اقتراح تعيين الأعمدة تلقائياً
 */
export function suggestColumnMapping(headers: string[]): Partial<ColumnMapping> {
    const mapping: Partial<ColumnMapping> = {};

    const patterns: Record<keyof ColumnMapping, RegExp[]> = {
        date: [/تاريخ/i, /date/i, /التاريخ/i],
        itemCode: [/كود/i, /رقم.*صنف/i, /code/i, /رقم/i],
        itemName: [/اسم.*صنف/i, /الصنف/i, /اسم/i, /name/i, /المنتج/i],
        quantity: [/كمية/i, /الكمية/i, /qty/i, /quantity/i, /عدد/i],
        movementType: [/نوع.*حرك/i, /نوع/i, /type/i, /الحركة/i],
        fromLocation: [/من.*موقع/i, /مصدر/i, /from/i, /خروج/i],
        toLocation: [/إلى.*موقع/i, /وجهة/i, /to/i, /دخول/i],
        category: [/فئة/i, /category/i, /تصنيف/i],
        subcategory: [/فئة.*فرع/i, /subcategory/i, /فرعي/i],
        note: [/ملاحظ/i, /note/i, /تعليق/i],
    };

    headers.forEach((header) => {
        const normalizedHeader = header.trim().toLowerCase();

        for (const [field, regexList] of Object.entries(patterns)) {
            if (!mapping[field as keyof ColumnMapping]) {
                for (const regex of regexList) {
                    if (regex.test(normalizedHeader)) {
                        mapping[field as keyof ColumnMapping] = header;
                        break;
                    }
                }
            }
        }
    });

    return mapping;
}
