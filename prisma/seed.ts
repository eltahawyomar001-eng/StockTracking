import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('بدء إضافة البيانات التجريبية...');

    // إنشاء الفئات
    const electronics = await prisma.category.upsert({
        where: { name: 'أجهزة كهربائية' },
        update: {},
        create: {
            name: 'أجهزة كهربائية',
            description: 'جميع الأجهزة الكهربائية والإلكترونية',
        },
    });

    const furniture = await prisma.category.upsert({
        where: { name: 'أثاث مكتبي' },
        update: {},
        create: {
            name: 'أثاث مكتبي',
            description: 'الأثاث والمفروشات المكتبية',
        },
    });

    const supplies = await prisma.category.upsert({
        where: { name: 'مستلزمات مكتبية' },
        update: {},
        create: {
            name: 'مستلزمات مكتبية',
            description: 'القرطاسية والمستلزمات المكتبية',
        },
    });

    console.log('تم إنشاء الفئات ✓');

    // إنشاء الفئات الفرعية
    await prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'حواسيب', categoryId: electronics.id } },
        update: {},
        create: { name: 'حواسيب', categoryId: electronics.id },
    });

    await prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'طابعات', categoryId: electronics.id } },
        update: {},
        create: { name: 'طابعات', categoryId: electronics.id },
    });

    await prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'مكاتب', categoryId: furniture.id } },
        update: {},
        create: { name: 'مكاتب', categoryId: furniture.id },
    });

    await prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'كراسي', categoryId: furniture.id } },
        update: {},
        create: { name: 'كراسي', categoryId: furniture.id },
    });

    console.log('تم إنشاء الفئات الفرعية ✓');

    // إنشاء المواقع
    const mainWarehouse = await prisma.location.upsert({
        where: { name: 'المخزن الرئيسي' },
        update: {},
        create: {
            name: 'المخزن الرئيسي',
            description: 'المخزن الرئيسي للشركة',
        },
    });

    const branchA = await prisma.location.upsert({
        where: { name: 'فرع أ' },
        update: {},
        create: {
            name: 'فرع أ',
            description: 'فرع المنطقة الشرقية',
        },
    });

    const branchB = await prisma.location.upsert({
        where: { name: 'فرع ب' },
        update: {},
        create: {
            name: 'فرع ب',
            description: 'فرع المنطقة الغربية',
        },
    });

    console.log('تم إنشاء المواقع ✓');

    console.log('تمت إضافة البيانات التجريبية بنجاح!');
}

main()
    .catch((e) => {
        console.error('خطأ:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
