/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Prisma Client - provides in-memory database simulation
import {
    mockData,
    type MockCategory,
    type MockSubcategory,
    type MockLocation,
    type MockItem,
    type MockMovement,
    type MockStockSnapshot,
} from './mock-data';

// In-memory storage (cloned from mock data to allow mutations)
let categories = [...mockData.categories];
let subcategories = [...mockData.subcategories];
let locations = [...mockData.locations];
let items = [...mockData.items];
let movements = [...mockData.movements];
let stockSnapshots = [...mockData.stockSnapshots];

// Helper to generate IDs
let idCounter = 1000;
const generateId = () => `mock-${idCounter++}`;

// Helper to generate hash
const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return `hash-${hash}`;
};

// Mock Category Model
const categoryModel = {
    findMany: async (args?: any) => {
        let results = [...categories];

        if (args?.orderBy) {
            if (args.orderBy.name === 'asc') {
                results.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        if (args?.include) {
            return results.map((cat) => ({
                ...cat,
                subcategories: args.include.subcategories
                    ? subcategories.filter((sub) => sub.categoryId === cat.id)
                    : undefined,
                _count: args.include._count
                    ? { items: items.filter((item) => item.categoryId === cat.id).length }
                    : undefined,
            }));
        }

        return results;
    },

    findUnique: async (args: any) => {
        const category = categories.find((c) => c.id === args.where.id);
        if (!category) return null;

        if (args?.include) {
            return {
                ...category,
                subcategories: args.include.subcategories
                    ? subcategories.filter((sub) => sub.categoryId === category.id)
                    : undefined,
                items: args.include.items
                    ? items.filter((item) => item.categoryId === category.id)
                    : undefined,
            };
        }

        return category;
    },

    create: async (args: any) => {
        const newCategory: MockCategory = {
            id: generateId(),
            ...args.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        categories.push(newCategory);
        return newCategory;
    },

    update: async (args: any) => {
        const index = categories.findIndex((c) => c.id === args.where.id);
        if (index === -1) throw new Error('Category not found');

        categories[index] = {
            ...categories[index],
            ...args.data,
            updatedAt: new Date(),
        };
        return categories[index];
    },

    delete: async (args: any) => {
        const index = categories.findIndex((c) => c.id === args.where.id);
        if (index === -1) throw new Error('Category not found');

        const deleted = categories[index];
        categories.splice(index, 1);
        return deleted;
    },

    count: async () => categories.length,
};

// Mock Subcategory Model
const subcategoryModel = {
    create: async (args: any) => {
        const newSubcategory: MockSubcategory = {
            id: generateId(),
            ...args.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        subcategories.push(newSubcategory);
        return newSubcategory;
    },

    update: async (args: any) => {
        const index = subcategories.findIndex((s) => s.id === args.where.id);
        if (index === -1) throw new Error('Subcategory not found');

        subcategories[index] = {
            ...subcategories[index],
            ...args.data,
            updatedAt: new Date(),
        };
        return subcategories[index];
    },

    delete: async (args: any) => {
        const index = subcategories.findIndex((s) => s.id === args.where.id);
        if (index === -1) throw new Error('Subcategory not found');

        const deleted = subcategories[index];
        subcategories.splice(index, 1);
        return deleted;
    },
};

// Mock Location Model
const locationModel = {
    findMany: async (args?: any) => {
        let results = [...locations];

        if (args?.orderBy) {
            if (args.orderBy.name === 'asc') {
                results.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        if (args?.include) {
            return results.map((location) => ({
                ...location,
                _count: args.include._count
                    ? {
                        stockSnapshots: stockSnapshots.filter((s) => s.locationId === location.id).length
                    }
                    : undefined,
            }));
        }

        return results;
    },

    findUnique: async (args: any) => {
        const location = locations.find((l) => l.id === args.where.id);
        if (!location) return null;

        if (args?.include) {
            let stockSnapshotsData = stockSnapshots.filter((s) => s.locationId === location.id);

            // Handle nested includes for stockSnapshots
            if (args.include.stockSnapshots?.include?.item) {
                stockSnapshotsData = stockSnapshotsData.map((snapshot) => ({
                    ...snapshot,
                    item: items.find((i) => i.id === snapshot.itemId) || null,
                })) as any;
            }

            return {
                ...location,
                stockSnapshots: args.include.stockSnapshots
                    ? stockSnapshotsData
                    : undefined,
            };
        }

        return location;
    },

    create: async (args: any) => {
        const newLocation: MockLocation = {
            id: generateId(),
            ...args.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        locations.push(newLocation);
        return newLocation;
    },

    update: async (args: any) => {
        const index = locations.findIndex((l) => l.id === args.where.id);
        if (index === -1) throw new Error('Location not found');

        locations[index] = {
            ...locations[index],
            ...args.data,
            updatedAt: new Date(),
        };
        return locations[index];
    },

    delete: async (args: any) => {
        const index = locations.findIndex((l) => l.id === args.where.id);
        if (index === -1) throw new Error('Location not found');

        const deleted = locations[index];
        locations.splice(index, 1);
        return deleted;
    },

    count: async () => locations.length,
};

// Mock Item Model
const itemModel = {
    findMany: async (args?: any) => {
        let results = [...items];

        // Apply where filters
        if (args?.where) {
            if (args.where.categoryId) {
                results = results.filter((item) => item.categoryId === args.where.categoryId);
            }
            if (args.where.subcategoryId) {
                results = results.filter((item) => item.subcategoryId === args.where.subcategoryId);
            }
            if (args.where.code) {
                if (args.where.code.contains) {
                    results = results.filter((item) =>
                        item.code.toLowerCase().includes(args.where.code.contains.toLowerCase())
                    );
                }
            }
            if (args.where.name) {
                if (args.where.name.contains) {
                    results = results.filter((item) =>
                        item.name.toLowerCase().includes(args.where.name.contains.toLowerCase())
                    );
                }
            }
        }

        // Apply ordering
        if (args?.orderBy) {
            if (args.orderBy.name === 'asc') {
                results.sort((a, b) => a.name.localeCompare(b.name));
            } else if (args.orderBy.name === 'desc') {
                results.sort((a, b) => b.name.localeCompare(a.name));
            }
        }

        // Apply pagination
        if (args?.skip) {
            results = results.slice(args.skip);
        }
        if (args?.take) {
            results = results.slice(0, args.take);
        }

        // Apply includes
        if (args?.include) {
            return results.map((item) => {
                let stockSnapshotsData = stockSnapshots.filter((s) => s.itemId === item.id);

                // Handle nested includes for stockSnapshots
                if (args.include.stockSnapshots?.include?.location) {
                    stockSnapshotsData = stockSnapshotsData.map((snapshot) => ({
                        ...snapshot,
                        location: locations.find((l) => l.id === snapshot.locationId) || null,
                    })) as any;
                }

                return {
                    ...item,
                    category: args.include.category
                        ? categories.find((c) => c.id === item.categoryId) || null
                        : undefined,
                    subcategory: args.include.subcategory
                        ? subcategories.find((s) => s.id === item.subcategoryId) || null
                        : undefined,
                    stockSnapshots: args.include.stockSnapshots
                        ? stockSnapshotsData
                        : undefined,
                    _count: args.include._count
                        ? { movements: movements.filter((m) => m.itemId === item.id).length }
                        : undefined,
                };
            });
        }

        return results;
    },

    findUnique: async (args: any) => {
        let item = null;

        if (args.where.id) {
            item = items.find((i) => i.id === args.where.id);
        } else if (args.where.code) {
            item = items.find((i) => i.code === args.where.code);
        }

        if (!item) return null;

        if (args?.include) {
            let stockSnapshotsData = stockSnapshots.filter((s) => s.itemId === item.id);
            let movementsData = movements.filter((m) => m.itemId === item.id);

            // Handle stockSnapshots nested includes
            if (args.include.stockSnapshots?.include?.location) {
                stockSnapshotsData = stockSnapshotsData.map((snapshot) => ({
                    ...snapshot,
                    location: locations.find((l) => l.id === snapshot.locationId) || null,
                })) as any;
            }

            // Handle movements nested includes
            if (args.include.movements) {
                movementsData = movementsData.map((movement) => ({
                    ...movement,
                    fromLocation: args.include.movements.include?.fromLocation
                        ? locations.find((l) => l.id === movement.fromLocationId) || null
                        : undefined,
                    toLocation: args.include.movements.include?.toLocation
                        ? locations.find((l) => l.id === movement.toLocationId) || null
                        : undefined,
                })) as any;

                // Apply ordering
                if (args.include.movements.orderBy?.date === 'desc') {
                    movementsData.sort((a, b) => b.date.getTime() - a.date.getTime());
                }

                // Apply limit
                if (args.include.movements.take) {
                    movementsData = movementsData.slice(0, args.include.movements.take);
                }
            }

            // Apply orderBy for stockSnapshots
            if (args.include.stockSnapshots?.orderBy?.location?.name === 'asc') {
                stockSnapshotsData.sort((a: any, b: any) => {
                    const locA = a.location?.name || '';
                    const locB = b.location?.name || '';
                    return locA.localeCompare(locB);
                });
            }

            return {
                ...item,
                category: args.include.category
                    ? categories.find((c) => c.id === item.categoryId) || null
                    : undefined,
                subcategory: args.include.subcategory
                    ? subcategories.find((s) => s.id === item.subcategoryId) || null
                    : undefined,
                stockSnapshots: args.include.stockSnapshots
                    ? stockSnapshotsData
                    : undefined,
                movements: args.include.movements
                    ? movementsData
                    : undefined,
            };
        }

        return item;
    },

    create: async (args: any) => {
        const newItem: MockItem = {
            id: generateId(),
            ...args.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        items.push(newItem);
        return newItem;
    },

    update: async (args: any) => {
        const index = items.findIndex((i) => i.id === args.where.id);
        if (index === -1) throw new Error('Item not found');

        items[index] = {
            ...items[index],
            ...args.data,
            updatedAt: new Date(),
        };
        return items[index];
    },

    delete: async (args: any) => {
        const index = items.findIndex((i) => i.id === args.where.id);
        if (index === -1) throw new Error('Item not found');

        const deleted = items[index];
        items.splice(index, 1);
        return deleted;
    },

    count: async (args?: any) => {
        let results = [...items];

        if (args?.where) {
            if (args.where.categoryId) {
                results = results.filter((item) => item.categoryId === args.where.categoryId);
            }
        }

        return results.length;
    },
};

// Mock Movement Model
const movementModel = {
    findMany: async (args?: any) => {
        let results = [...movements];

        // Apply where filters
        if (args?.where) {
            if (args.where.itemId) {
                results = results.filter((m) => m.itemId === args.where.itemId);
            }
            if (args.where.type) {
                results = results.filter((m) => m.type === args.where.type);
            }
            if (args.where.date?.gte) {
                results = results.filter((m) => m.date >= args.where.date.gte);
            }
            if (args.where.date?.lte) {
                results = results.filter((m) => m.date <= args.where.date.lte);
            }
            if (args.where.createdAt?.gte) {
                results = results.filter((m) => m.createdAt >= args.where.createdAt.gte);
            }
        }

        // Apply ordering
        if (args?.orderBy) {
            if (args.orderBy.date === 'desc') {
                results.sort((a, b) => b.date.getTime() - a.date.getTime());
            } else if (args.orderBy.createdAt === 'desc') {
                results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            }
        }

        // Apply pagination
        if (args?.skip) {
            results = results.slice(args.skip);
        }
        if (args?.take) {
            results = results.slice(0, args.take);
        }

        // Apply includes
        if (args?.include) {
            return results.map((movement) => ({
                ...movement,
                item: args.include.item
                    ? items.find((i) => i.id === movement.itemId) || null
                    : undefined,
                fromLocation: args.include.fromLocation
                    ? locations.find((l) => l.id === movement.fromLocationId) || null
                    : undefined,
                toLocation: args.include.toLocation
                    ? locations.find((l) => l.id === movement.toLocationId) || null
                    : undefined,
            }));
        }

        return results;
    },

    findUnique: async (args: any) => {
        if (args.where.sourceRowHash) {
            return movements.find((m) => m.sourceRowHash === args.where.sourceRowHash) || null;
        }
        return movements.find((m) => m.id === args.where.id) || null;
    },

    create: async (args: any) => {
        const newMovement: MockMovement = {
            id: generateId(),
            ...args.data,
            sourceRowHash: args.data.sourceRowHash || null,
            createdAt: new Date(),
        };
        movements.push(newMovement);
        return newMovement;
    },

    count: async (args?: any) => {
        let results = [...movements];

        if (args?.where) {
            if (args.where.createdAt?.gte) {
                results = results.filter((m) => m.createdAt >= args.where.createdAt.gte);
            }
        }

        return results.length;
    },

    createMany: async (args: any) => {
        const created = args.data.map((data: any) => {
            const newMovement: MockMovement = {
                id: generateId(),
                ...data,
                sourceRowHash: data.sourceRowHash || generateHash(JSON.stringify(data)),
                createdAt: new Date(),
            };
            movements.push(newMovement);
            return newMovement;
        });

        return { count: created.length };
    },
};

// Mock Stock Snapshot Model
const stockSnapshotModel = {
    findUnique: async (args: any) => {
        if (args.where.itemId_locationId) {
            const { itemId, locationId } = args.where.itemId_locationId;
            return (
                stockSnapshots.find((s) => s.itemId === itemId && s.locationId === locationId) || null
            );
        }
        return stockSnapshots.find((s) => s.id === args.where.id) || null;
    },

    findMany: async (args?: any) => {
        let results = [...stockSnapshots];

        if (args?.where) {
            if (args.where.itemId) {
                results = results.filter((s) => s.itemId === args.where.itemId);
            }
        }

        if (args?.include) {
            return results.map((snapshot) => ({
                ...snapshot,
                location: args.include.location
                    ? locations.find((l) => l.id === snapshot.locationId) || null
                    : undefined,
            }));
        }

        return results;
    },

    create: async (args: any) => {
        const newSnapshot: MockStockSnapshot = {
            id: generateId(),
            ...args.data,
            updatedAt: new Date(),
        };
        stockSnapshots.push(newSnapshot);
        return newSnapshot;
    },

    update: async (args: any) => {
        const index = stockSnapshots.findIndex((s) => s.id === args.where.id);
        if (index === -1) throw new Error('Stock snapshot not found');

        stockSnapshots[index] = {
            ...stockSnapshots[index],
            ...args.data,
            updatedAt: new Date(),
        };
        return stockSnapshots[index];
    },

    upsert: async (args: any) => {
        const existing = await stockSnapshotModel.findUnique({ where: args.where });

        if (existing) {
            return stockSnapshotModel.update({
                where: args.where,
                data: args.update,
            });
        } else {
            return stockSnapshotModel.create({
                data: args.create,
            });
        }
    },
};

// Mock transaction handler
const mockTransaction = async (callback: (tx: any) => Promise<any>) => {
    // Create a transaction context with all models
    const tx = {
        category: categoryModel,
        subcategory: subcategoryModel,
        location: locationModel,
        item: itemModel,
        movement: movementModel,
        stockSnapshot: stockSnapshotModel,
    };

    return callback(tx);
};

// Export mock Prisma client
export const mockPrismaClient = {
    category: categoryModel,
    subcategory: subcategoryModel,
    location: locationModel,
    item: itemModel,
    movement: movementModel,
    stockSnapshot: stockSnapshotModel,
    $transaction: mockTransaction,
};

export type MockPrismaClient = typeof mockPrismaClient;
