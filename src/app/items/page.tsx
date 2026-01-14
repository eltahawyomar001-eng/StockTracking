import { getItems } from '@/app/actions/items';
import { getCategories } from '@/app/actions/categories';
import ItemsClient from './ItemsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

export default async function ItemsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const search = params.search || '';
    const categoryId = params.category || '';
    const page = parseInt(params.page || '1');

    const [items, categories] = await Promise.all([
        getItems({ search, categoryId, page }),
        getCategories(),
    ]);

    return (
        <ItemsClient
            initialItems={items}
            categories={categories}
            initialSearch={search}
            initialCategory={categoryId}
        />
    );
}
