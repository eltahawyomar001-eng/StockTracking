# نظام تتبع المخزون

تطبيق ويب عربي لإدارة وتتبع حركات المخزون مع واجهة Glassmorphism حديثة.

## المميزات

- استيراد بيانات من ملفات Excel مع نظام تعيين أعمدة ذكي
- إدارة الأصناف والفئات والمواقع
- تتبع حركات المخزون (وارد/صادر/تحويل)
- حساب الرصيد التلقائي لكل موقع
- واجهة عربية RTL بالكامل
- تصميم Glassmorphism عصري

## التقنيات المستخدمة

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- Prisma ORM
- PostgreSQL

## التشغيل المحلي

### 1. تثبيت الاعتماديات

```bash
npm install
```

### 2. إعداد قاعدة البيانات

أنشئ قاعدة بيانات PostgreSQL (يُنصح باستخدام [Supabase](https://supabase.com) أو [Neon](https://neon.tech)).

انسخ ملف `.env.example` إلى `.env` وأضف رابط قاعدة البيانات:

```bash
cp .env.example .env
```

ثم عدّل ملف `.env`:

```
DATABASE_URL="postgresql://..."
```

### 3. تشغيل Migrations

```bash
npx prisma generate
npx prisma db push
```

### 4. (اختياري) إضافة بيانات تجريبية

```bash
npx prisma db seed
```

### 5. تشغيل الخادم

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## النشر على Vercel

1. ارفع المشروع على GitHub
2. اربط المستودع بـ Vercel
3. أضف متغير البيئة `DATABASE_URL` في إعدادات Vercel
4. انشر!

## هيكل المشروع

```
src/
├── app/
│   ├── page.tsx           # لوحة التحكم
│   ├── import/            # استيراد Excel
│   ├── items/             # الأصناف
│   ├── categories/        # الفئات
│   ├── locations/         # المواقع
│   └── actions/           # Server Actions
├── components/
│   ├── ui/                # shadcn/ui
│   └── app/               # مكونات التطبيق
└── lib/
    ├── db.ts              # Prisma client
    ├── arabic-utils.ts    # دوال عربية
    ├── validators.ts      # Zod schemas
    └── excel-parser.ts    # قراءة Excel
```

## الترخيص

MIT
