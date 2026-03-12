

# Admin Product CRUD Modals + Unimplemented Features

## What's Missing

1. **Products page**: "Add Product" button does nothing, Edit button does nothing — need add/edit modal with form validation
2. **Orders page**: No status update capability — admin should be able to change order status
3. **Orders page**: No order detail view — admin can't see order items
4. **Users page**: No actions — bare table with no role management or detail view
5. **Delete confirmation**: Uses browser `confirm()` — should use a proper AlertDialog

## Implementation Plan

### 1. Product Add/Edit Modal (`src/components/admin/ProductFormDialog.tsx`)

A Dialog with a zod-validated form containing:
- Name (required, max 100 chars)
- Description (optional textarea)
- Price (required, positive integer)
- Original price (optional, for showing discounts)
- Image URL (required)
- Category (select: Hoodies, T-Shirts, Pants, Caps, Sneakers, Accessories)
- Sizes (multi-select checkboxes: XS, S, M, L, XL, XXL)
- Badge (optional: New, Sale, Hot, Limited)
- In stock (switch toggle)

On submit: insert or update via Supabase, invalidate `["products"]` query, close modal, toast success.

The "Add Product" button and Edit row button will both open this dialog (edit pre-fills values).

### 2. Order Status Update (`AdminOrders.tsx`)

Add a Select dropdown per order row to change status between: pending, processing, shipped, delivered, cancelled. On change: update via Supabase, invalidate queries, toast.

Add an expandable row or detail dialog to show order items (product name, size, quantity, price).

### 3. Delete Confirmation Dialog (`src/components/admin/DeleteConfirmDialog.tsx`)

Replace browser `confirm()` with a shadcn AlertDialog for product deletion — styled with the gold/black theme.

### 4. Updated `AdminProducts.tsx`

Wire up Add button → opens ProductFormDialog in create mode.
Wire up Edit button → opens ProductFormDialog in edit mode with product data.
Wire up Delete button → opens DeleteConfirmDialog.

### 5. Updated `AdminOrders.tsx`

Add status dropdown per row.
Add expandable order items view.
Add customer info (phone, address) display.

### File Changes

| File | Action |
|------|--------|
| `src/components/admin/ProductFormDialog.tsx` | Create — add/edit product modal |
| `src/components/admin/DeleteConfirmDialog.tsx` | Create — reusable delete confirmation |
| `src/components/admin/OrderDetailDialog.tsx` | Create — order items detail view |
| `src/pages/admin/AdminProducts.tsx` | Update — wire modals, remove confirm() |
| `src/pages/admin/AdminOrders.tsx` | Update — add status updates + detail view |

No database changes needed — existing schema and RLS policies already support all CRUD operations for admin users.

