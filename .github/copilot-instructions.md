# Stock Tracker - AI Agent Instructions

## Project Overview
An **Arabic-first inventory management system** for tracking stock movements across locations. Built with Next.js 15 (App Router), TypeScript, Prisma, and PostgreSQL. Features a glassmorphism UI with full RTL support.

## Architecture & Data Flow

### Core Domain Model
- **Items** (أصناف): Products with unique codes, organized by categories/subcategories
- **Locations** (مواقع/قاعات): Storage locations (warehouses, halls, etc.)
- **Movements** (حركات): Stock transactions (IN/OUT/TRANSFER) that modify inventory
- **StockSnapshots**: Materialized view for efficient balance queries per item×location

### Critical Flow: Movement → Balance Update
When creating movements via `createMovement()` in `src/app/actions/movements.ts`:
1. **Atomic transaction**: Movement creation + balance updates must occur together
2. **Stock validation**: OUT/TRANSFER operations check `StockSnapshot.onHand` before deduction
3. **Balance calculation**: `updateStock()` upserts `StockSnapshot` by adding/subtracting delta
4. **Duplicate prevention**: `sourceRowHash` ensures Excel imports don't create duplicate movements

### Prisma Custom Output Path
⚠️ **Critical**: Prisma client generates to `src/generated/prisma/` (NOT default `node_modules`)
- Always import from `@/generated/prisma`, never `@prisma/client`
- Custom output configured in `prisma/schema.prisma` generator block
- Run `npx prisma generate` after schema changes

## Arabic Data Handling

### Text Normalization Pipeline
`src/lib/arabic-utils.ts` provides critical utilities:
- **`normalizeArabicDigits()`**: Converts ٠-٩ (Arabic) and ۰-۹ (Hindi) to 0-9
- **`parseMovementTypeArabic()`**: Maps Arabic text ("وارد", "صادر", "تحويل") to enum values
- **`parseFlexibleDate()`**: Handles DD/MM/YYYY and YYYY/MM/DD with Arabic digit support

⚠️ **Always normalize user input** from Excel/forms before validation or DB operations.

### RTL Layout Convention
- `dir="rtl"` set at `<html>` level in `src/app/layout.tsx`
- Tailwind logical properties: Use `me-*`/`ms-*` instead of `ml-*`/`mr-*`
- Cairo font loaded with Arabic subset via `next/font/google`

## Excel Import System

### Three-Phase Import Flow (`src/app/import/page.tsx`)
1. **Upload & Parse**: `parseExcelFile()` extracts sheets and headers using `xlsx` library
2. **Column Mapping**: `suggestColumnMapping()` auto-matches columns via fuzzy Arabic/English matching
3. **Validation & Transform**: `applyColumnMapping()` validates rows with Zod schemas, normalizes data

### Deduplication Strategy
- **Hash generation**: `calculateRowHash()` creates unique identifier from date+item+type+quantity+locations
- Stored in `Movement.sourceRowHash` with unique constraint
- Import transaction skips existing hashes to prevent duplicates

### Required vs Optional Columns
**Required** (enforced by `ImportRowSchema` in `src/lib/validators.ts`):
- `date`, `itemCode`, `itemName`, `quantity`, `movementType`

**Conditional Requirements** (validated via Zod refine):
- `movementType: 'IN'` → requires `toLocation`
- `movementType: 'OUT'` → requires `fromLocation`  
- `movementType: 'TRANSFER'` → requires both locations

## Development Workflows

### Database Commands
```bash
# Generate Prisma client (required after schema changes)
npx prisma generate

# Push schema to DB (development)
npx prisma db push

# Seed test data
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Build & Run
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build (auto-runs prisma generate)
npm run postinstall  # Runs prisma generate (CI/CD)
```

### Environment Setup
Required: `DATABASE_URL` in `.env` (PostgreSQL connection string)
- Recommended providers: Neon, Supabase (serverless-compatible)
- Uses `@neondatabase/serverless` with `PrismaNeon` adapter in `src/lib/db.ts`

## UI Component Patterns

### GlassCard Component (`src/components/app/GlassCard.tsx`)
Custom glassmorphism wrapper using:
- `backdrop-blur-xl` + semi-transparent backgrounds
- Consistent border + shadow system
- Used extensively for cards, modals, sidebar

### Server Actions Pattern
All mutations use Next.js 15 Server Actions (`'use server'`) in `src/app/actions/`:
- `revalidatePath()` called after mutations for cache invalidation
- Return structured data (never serialize Prisma objects directly)
- Error messages in Arabic for user-facing exceptions

### Client-Side State Management
Uses React hooks + Next.js router for navigation:
- No global state library (Redux, Zustand)
- Form state via `react-hook-form` with Zod resolvers
- Toast notifications via `sonner` library

## Code Conventions

### File Naming
- **Server Actions**: `src/app/actions/{domain}.ts` (e.g., `items.ts`, `movements.ts`)
- **Page Routes**: `src/app/{route}/page.tsx` (Next.js App Router convention)
- **Client Components**: PascalCase files ending in `Client.tsx` (e.g., `ItemsClient.tsx`)

### Import Aliases
- `@/` maps to `src/` (configured in `tsconfig.json`)
- Prefer absolute imports over relative paths

### Arabic Comments
Schema files and core utilities have Arabic comments for domain clarity. Use when describing business logic specific to Arabic contexts.

## Common Pitfalls

1. **Forgetting Prisma generate**: Always run after schema changes (build script includes it)
2. **Wrong import path**: Use `@/generated/prisma` not `@prisma/client`
3. **Missing normalization**: User inputs with Arabic digits will fail validation if not normalized first
4. **RTL margin mix-up**: Use `me-4` (margin-end) not `ml-4` in RTL layouts
5. **StockSnapshot staleness**: Movements update snapshots atomically; never query movements to calculate current stock

## Testing Strategy
⚠️ No test suite currently exists. When implementing tests:
- Focus on `arabic-utils.ts` normalization functions (critical path)
- Test movement transaction atomicity (balance consistency)
- Validate Excel import edge cases (malformed dates, mixed encodings)

## Deployment Notes
- **Vercel-optimized**: Uses serverless-compatible database adapter
- **Build-time safety**: `src/lib/db.ts` returns proxy if `DATABASE_URL` unset during build
- **Static generation**: Dashboard uses `export const dynamic = 'force-dynamic'` for fresh data
