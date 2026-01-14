import { getCategories } from '@/app/actions/categories';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    const categories = await getCategories();

    return <CategoriesClient initialCategories={categories} />;
}
