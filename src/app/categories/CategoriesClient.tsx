'use client';

import { useState } from 'react';
import { AppLayout, GlassCard } from '@/components/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, FolderTree, ChevronDown, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    deleteSubcategory
} from '@/app/actions/categories';

interface Category {
    id: string;
    name: string;
    description: string | null;
    subcategories: { id: string; name: string }[];
    _count: { items: number };
}

interface CategoriesClientProps {
    initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [subcategoryName, setSubcategoryName] = useState('');

    const toggleExpand = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                toast.success('تم تحديث الفئة بنجاح');
            } else {
                await createCategory(formData);
                toast.success('تم إنشاء الفئة بنجاح');
            }
            setDialogOpen(false);
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

        try {
            await deleteCategory(id);
            toast.success('تم حذف الفئة بنجاح');
            setCategories(categories.filter((c) => c.id !== id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'حدث خطأ');
        }
    };

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId) return;
        setLoading(true);

        try {
            await createSubcategory({ name: subcategoryName, categoryId: selectedCategoryId });
            toast.success('تم إنشاء الفئة الفرعية بنجاح');
            setSubcategoryDialogOpen(false);
            setSubcategoryName('');
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubcategory = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفئة الفرعية؟')) return;

        try {
            await deleteSubcategory(id);
            toast.success('تم حذف الفئة الفرعية بنجاح');
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'حدث خطأ');
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">الفئات</h1>
                        <p className="text-white/60">إدارة فئات الأصناف والتصنيفات الفرعية</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="btn-rounded bg-primary hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة فئة
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-white/80">اسم الفئة</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="glass-input mt-1"
                                        placeholder="مثال: أجهزة كهربائية"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80">الوصف (اختياري)</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="glass-input mt-1"
                                        placeholder="وصف مختصر للفئة..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="border-white/20 text-white hover:bg-white/10"
                                    >
                                        إلغاء
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-primary">
                                        {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Subcategory Dialog */}
                <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                    <DialogContent className="glass-card border-white/10">
                        <DialogHeader>
                            <DialogTitle className="text-white">إضافة فئة فرعية</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSubcategory} className="space-y-4">
                            <div>
                                <Label className="text-white/80">اسم الفئة الفرعية</Label>
                                <Input
                                    value={subcategoryName}
                                    onChange={(e) => setSubcategoryName(e.target.value)}
                                    className="glass-input mt-1"
                                    placeholder="مثال: ثلاجات"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSubcategoryDialogOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-primary">
                                    {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Categories List */}
                {categories.length === 0 ? (
                    <GlassCard className="text-center py-12">
                        <FolderTree className="w-16 h-16 mx-auto mb-4 text-white/30" />
                        <h3 className="text-xl text-white/60 mb-2">لا توجد فئات</h3>
                        <p className="text-white/40">ابدأ بإضافة فئة جديدة</p>
                    </GlassCard>
                ) : (
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <GlassCard key={category.id} className="p-0 overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleExpand(category.id)}
                                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {expandedCategories.has(category.id) ? (
                                                <ChevronDown className="w-5 h-5 text-white/60" />
                                            ) : (
                                                <ChevronLeft className="w-5 h-5 text-white/60" />
                                            )}
                                        </button>
                                        <div>
                                            <h3 className="text-lg font-medium text-white">{category.name}</h3>
                                            <p className="text-sm text-white/50">
                                                {category._count.items} صنف • {category.subcategories.length} فئة فرعية
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedCategoryId(category.id);
                                                setSubcategoryDialogOpen(true);
                                            }}
                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleOpenDialog(category)}
                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {expandedCategories.has(category.id) && category.subcategories.length > 0 && (
                                    <div className="border-t border-white/10 bg-white/5 p-4">
                                        <div className="space-y-2">
                                            {category.subcategories.map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5"
                                                >
                                                    <span className="text-white/80">{sub.name}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteSubcategory(sub.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
