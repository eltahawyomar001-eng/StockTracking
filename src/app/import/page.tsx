'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout, GlassCard } from '@/components/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileSpreadsheet,
    Upload,
    Check,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    parseExcelFile,
    applyColumnMapping,
    suggestColumnMapping,
    type ExcelSheet,
    type ValidationError,
    type ProcessedRow
} from '@/lib/excel-parser';
import type { ColumnMapping } from '@/lib/validators';
import { importExcelData } from '@/app/actions/import';
import { formatNumberArabic, movementTypeToArabic } from '@/lib/arabic-utils';

type Step = 'upload' | 'mapping' | 'preview' | 'result';

const REQUIRED_FIELDS: (keyof ColumnMapping)[] = [
    'date', 'itemCode', 'itemName', 'quantity', 'movementType'
];

const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
    date: 'تاريخ الحركة',
    itemCode: 'كود الصنف',
    itemName: 'اسم الصنف',
    quantity: 'الكمية',
    movementType: 'نوع الحركة',
    fromLocation: 'الموقع المصدر',
    toLocation: 'الموقع الوجهة',
    category: 'الفئة',
    subcategory: 'الفئة الفرعية',
    note: 'ملاحظات',
};

export default function ImportPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('upload');
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');

    // Excel data
    const [sheets, setSheets] = useState<ExcelSheet[]>([]);
    const [selectedSheet, setSelectedSheet] = useState(0);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<Record<string, unknown>[]>([]);

    // Column mapping
    const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});

    // Validation results
    const [validRows, setValidRows] = useState<ProcessedRow[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);

    // Import result
    const [importResult, setImportResult] = useState<{
        itemsCreated: number;
        movementsCreated: number;
        errors: string[];
    } | null>(null);

    // Handle file upload
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            toast.error('يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)');
            return;
        }

        setLoading(true);
        setFileName(file.name);

        try {
            const buffer = await file.arrayBuffer();
            const data = parseExcelFile(buffer);

            if (data.sheets.length === 0 || data.sheets[0].rows.length === 0) {
                toast.error('الملف فارغ أو لا يحتوي على بيانات صالحة');
                return;
            }

            setSheets(data.sheets);
            setSelectedSheet(0);

            const sheet = data.sheets[0];
            setHeaders(sheet.headers);
            setRows(sheet.rows);

            // Auto-suggest mapping
            const suggested = suggestColumnMapping(sheet.headers);
            setMapping(suggested);

            setStep('mapping');
            toast.success(`تم قراءة ${sheet.rows.length} صف من الملف`);
        } catch (error) {
            toast.error('خطأ في قراءة الملف');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle sheet change
    const handleSheetChange = (index: string) => {
        const idx = parseInt(index);
        setSelectedSheet(idx);
        const sheet = sheets[idx];
        setHeaders(sheet.headers);
        setRows(sheet.rows);
        setMapping(suggestColumnMapping(sheet.headers));
    };

    // Update mapping
    const updateMapping = (field: keyof ColumnMapping, value: string) => {
        setMapping((prev) => ({
            ...prev,
            [field]: value === 'none' ? undefined : value,
        }));
    };

    // Validate mapping
    const isMappingValid = () => {
        return REQUIRED_FIELDS.every((field) => mapping[field]);
    };

    // Apply mapping and validate
    const handleApplyMapping = () => {
        if (!isMappingValid()) {
            toast.error('يجب تعيين جميع الحقول المطلوبة');
            return;
        }

        setLoading(true);

        try {
            const result = applyColumnMapping(rows, mapping as ColumnMapping);
            setValidRows(result.validRows);
            setErrors(result.errors);
            setStep('preview');

            if (result.errors.length > 0) {
                toast.warning(`تم العثور على ${result.errors.length} خطأ في البيانات`);
            } else {
                toast.success('تم التحقق من البيانات بنجاح');
            }
        } catch (error) {
            toast.error('خطأ في معالجة البيانات');
        } finally {
            setLoading(false);
        }
    };

    // Import data
    const handleImport = async () => {
        if (validRows.length === 0) {
            toast.error('لا توجد بيانات صالحة للاستيراد');
            return;
        }

        setLoading(true);

        try {
            const result = await importExcelData(validRows, fileName);
            setImportResult(result);
            setStep('result');
            toast.success('تم الاستيراد بنجاح');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'خطأ في الاستيراد');
        } finally {
            setLoading(false);
        }
    };

    // Reset and start over
    const handleReset = () => {
        setStep('upload');
        setFileName('');
        setSheets([]);
        setHeaders([]);
        setRows([]);
        setMapping({});
        setValidRows([]);
        setErrors([]);
        setImportResult(null);
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">استيراد بيانات Excel</h1>
                    <p className="text-white/60">رفع ملف Excel واستيراد حركات المخزون</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2">
                    {(['upload', 'mapping', 'preview', 'result'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === s
                                    ? 'bg-primary text-white'
                                    : ['upload', 'mapping', 'preview', 'result'].indexOf(step) > i
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 text-white/40'
                                }
              `}>
                                {['upload', 'mapping', 'preview', 'result'].indexOf(step) > i ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {i < 3 && (
                                <div className={`w-12 h-0.5 mx-1 ${['upload', 'mapping', 'preview', 'result'].indexOf(step) > i
                                        ? 'bg-green-500'
                                        : 'bg-white/10'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <GlassCard className="text-center py-12">
                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h2 className="text-xl font-semibold text-white mb-2">رفع ملف Excel</h2>
                        <p className="text-white/60 mb-6">
                            اختر ملف Excel (.xlsx) يحتوي على بيانات حركات المخزون
                        </p>

                        <label className="inline-block">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={loading}
                            />
                            <Button
                                className="bg-primary btn-rounded cursor-pointer"
                                disabled={loading}
                                asChild
                            >
                                <span>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 ml-2" />
                                    )}
                                    اختيار ملف
                                </span>
                            </Button>
                        </label>
                    </GlassCard>
                )}

                {/* Step 2: Column Mapping */}
                {step === 'mapping' && (
                    <GlassCard>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">تعيين الأعمدة</h2>
                                <p className="text-white/60 text-sm">
                                    طابق أعمدة الملف مع الحقول المطلوبة
                                </p>
                            </div>
                            {sheets.length > 1 && (
                                <Select value={selectedSheet.toString()} onValueChange={handleSheetChange}>
                                    <SelectTrigger className="w-48 glass-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        {sheets.map((sheet, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {sheet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map((field) => (
                                <div key={field}>
                                    <Label className="text-white/80 flex items-center gap-2">
                                        {FIELD_LABELS[field]}
                                        {REQUIRED_FIELDS.includes(field) && (
                                            <span className="text-red-400 text-xs">مطلوب</span>
                                        )}
                                    </Label>
                                    <Select
                                        value={mapping[field] || 'none'}
                                        onValueChange={(v) => updateMapping(field, v)}
                                    >
                                        <SelectTrigger className="glass-input mt-1">
                                            <SelectValue placeholder="اختر العمود" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10">
                                            <SelectItem value="none">-- غير محدد --</SelectItem>
                                            {headers.map((header) => (
                                                <SelectItem key={header} value={header}>
                                                    {header}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleApplyMapping}
                                disabled={!isMappingValid() || loading}
                                className="bg-primary btn-rounded"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                ) : (
                                    <ChevronLeft className="w-4 h-4 ml-2" />
                                )}
                                التالي
                            </Button>
                        </div>
                    </GlassCard>
                )}

                {/* Step 3: Preview */}
                {step === 'preview' && (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <GlassCard className="text-center">
                                <p className="text-3xl font-bold text-white">
                                    {formatNumberArabic(rows.length)}
                                </p>
                                <p className="text-white/60">إجمالي الصفوف</p>
                            </GlassCard>
                            <GlassCard className="text-center">
                                <p className="text-3xl font-bold text-green-400">
                                    {formatNumberArabic(validRows.length)}
                                </p>
                                <p className="text-white/60">صفوف صالحة</p>
                            </GlassCard>
                            <GlassCard className="text-center">
                                <p className="text-3xl font-bold text-red-400">
                                    {formatNumberArabic(errors.length)}
                                </p>
                                <p className="text-white/60">أخطاء</p>
                            </GlassCard>
                        </div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <GlassCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <h3 className="text-lg font-semibold text-white">الأخطاء</h3>
                                </div>
                                <ScrollArea className="h-48">
                                    <div className="space-y-2">
                                        {errors.slice(0, 50).map((error, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                                            >
                                                {error.message}
                                            </div>
                                        ))}
                                        {errors.length > 50 && (
                                            <p className="text-white/40 text-sm text-center">
                                                ... و {errors.length - 50} خطأ آخر
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </GlassCard>
                        )}

                        {/* Preview Table */}
                        {validRows.length > 0 && (
                            <GlassCard>
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    معاينة البيانات (أول 20 صف)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-right py-2 px-3 text-white/60">#</th>
                                                <th className="text-right py-2 px-3 text-white/60">التاريخ</th>
                                                <th className="text-right py-2 px-3 text-white/60">الكود</th>
                                                <th className="text-right py-2 px-3 text-white/60">الصنف</th>
                                                <th className="text-right py-2 px-3 text-white/60">النوع</th>
                                                <th className="text-right py-2 px-3 text-white/60">الكمية</th>
                                                <th className="text-right py-2 px-3 text-white/60">من</th>
                                                <th className="text-right py-2 px-3 text-white/60">إلى</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validRows.slice(0, 20).map((row) => (
                                                <tr key={row.rowNumber} className="border-b border-white/5">
                                                    <td className="py-2 px-3 text-white/40">{row.rowNumber}</td>
                                                    <td className="py-2 px-3 text-white/80">
                                                        {new Date(row.data.date).toLocaleDateString('ar-EG')}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <code className="text-primary bg-primary/10 px-1 rounded">
                                                            {row.data.itemCode}
                                                        </code>
                                                    </td>
                                                    <td className="py-2 px-3 text-white">{row.data.itemName}</td>
                                                    <td className="py-2 px-3">
                                                        <Badge className={
                                                            row.data.movementType === 'IN'
                                                                ? 'badge-in'
                                                                : row.data.movementType === 'OUT'
                                                                    ? 'badge-out'
                                                                    : 'badge-transfer'
                                                        }>
                                                            {movementTypeToArabic(row.data.movementType)}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-3 text-white font-medium">
                                                        {formatNumberArabic(row.data.quantity)}
                                                    </td>
                                                    <td className="py-2 px-3 text-white/60">
                                                        {row.data.fromLocation || '-'}
                                                    </td>
                                                    <td className="py-2 px-3 text-white/60">
                                                        {row.data.toLocation || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setStep('mapping')}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                <ChevronRight className="w-4 h-4 ml-2" />
                                السابق
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validRows.length === 0 || loading}
                                className="bg-primary btn-rounded"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4 ml-2" />
                                )}
                                اعتماد الاستيراد ({formatNumberArabic(validRows.length)} صف)
                            </Button>
                        </div>
                    </>
                )}

                {/* Step 4: Result */}
                {step === 'result' && importResult && (
                    <GlassCard className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">تم الاستيراد بنجاح</h2>
                        <p className="text-white/60 mb-6">تمت معالجة البيانات وحفظها في قاعدة البيانات</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                            <div className="glass-card-light rounded-xl p-4">
                                <p className="text-2xl font-bold text-primary">
                                    {formatNumberArabic(importResult.itemsCreated)}
                                </p>
                                <p className="text-white/60 text-sm">أصناف جديدة</p>
                            </div>
                            <div className="glass-card-light rounded-xl p-4">
                                <p className="text-2xl font-bold text-green-400">
                                    {formatNumberArabic(importResult.movementsCreated)}
                                </p>
                                <p className="text-white/60 text-sm">حركة تم إنشاؤها</p>
                            </div>
                            <div className="glass-card-light rounded-xl p-4">
                                <p className="text-2xl font-bold text-red-400">
                                    {formatNumberArabic(importResult.errors.length)}
                                </p>
                                <p className="text-white/60 text-sm">أخطاء</p>
                            </div>
                        </div>

                        {importResult.errors.length > 0 && (
                            <div className="max-w-2xl mx-auto mb-6">
                                <ScrollArea className="h-32">
                                    <div className="space-y-2 text-right">
                                        {importResult.errors.map((error, i) => (
                                            <div
                                                key={i}
                                                className="p-2 rounded bg-red-500/10 text-red-300 text-sm"
                                            >
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                استيراد ملف آخر
                            </Button>
                            <Button
                                onClick={() => router.push('/items')}
                                className="bg-primary btn-rounded"
                            >
                                عرض الأصناف
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    );
}
