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
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
    createLocation,
    updateLocation,
    deleteLocation
} from '@/app/actions/locations';

interface Location {
    id: string;
    name: string;
    description: string | null;
    _count: { stockSnapshots: number };
}

interface LocationsClientProps {
    initialLocations: Location[];
}

export default function LocationsClient({ initialLocations }: LocationsClientProps) {
    const [locations, setLocations] = useState(initialLocations);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleOpenDialog = (location?: Location) => {
        if (location) {
            setEditingLocation(location);
            setFormData({ name: location.name, description: location.description || '' });
        } else {
            setEditingLocation(null);
            setFormData({ name: '', description: '' });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingLocation) {
                await updateLocation(editingLocation.id, formData);
                toast.success('تم تحديث الموقع بنجاح');
            } else {
                await createLocation(formData);
                toast.success('تم إنشاء الموقع بنجاح');
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
        if (!confirm('هل أنت متأكد من حذف هذا الموقع؟')) return;

        try {
            await deleteLocation(id);
            toast.success('تم حذف الموقع بنجاح');
            setLocations(locations.filter((l) => l.id !== id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'حدث خطأ');
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">المواقع</h1>
                        <p className="text-foreground/60">إدارة المخازن والقاعات</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="btn-rounded bg-primary hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة موقع
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-primary/20">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">
                                    {editingLocation ? 'تعديل الموقع' : 'إضافة موقع جديد'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-foreground/80">اسم الموقع</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="glass-input mt-1"
                                        placeholder="مثال: المخزن الرئيسي"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-foreground/80">الوصف (اختياري)</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="glass-input mt-1"
                                        placeholder="وصف مختصر للموقع..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="border-primary/20 text-foreground hover:bg-primary/10"
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

                {/* Locations Grid */}
                {locations.length === 0 ? (
                    <GlassCard className="text-center py-12">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
                        <h3 className="text-xl text-foreground/60 mb-2">لا توجد مواقع</h3>
                        <p className="text-muted-foreground">ابدأ بإضافة موقع جديد</p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((location) => (
                            <GlassCard key={location.id} hover>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-3 rounded-xl bg-accent/20">
                                        <MapPin className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleOpenDialog(location)}
                                            className="text-foreground/60 hover:text-foreground hover:bg-primary/10 h-8 w-8 p-0"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(location.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-1">{location.name}</h3>
                                {location.description && (
                                    <p className="text-foreground/50 text-sm mb-2">{location.description}</p>
                                )}
                                <p className="text-muted-foreground text-sm">
                                    {location._count.stockSnapshots} صنف في هذا الموقع
                                </p>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
