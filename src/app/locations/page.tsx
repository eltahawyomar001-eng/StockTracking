import { getLocations } from '@/app/actions/locations';
import LocationsClient from './LocationsClient';

export const dynamic = 'force-dynamic';

export default async function LocationsPage() {
    const locations = await getLocations();

    return <LocationsClient initialLocations={locations} />;
}
