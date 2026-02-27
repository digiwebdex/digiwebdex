

## ERP-Level Admin System Upgrade Plan

### ✅ COMPLETED PHASES

#### Phase 1: Shared Export/Print Utility ✅
- Created `src/lib/exportUtils.ts` with `exportToCSV()`, `printTable()`, `exportToPDF()`
- Created `src/components/admin/common/ExportToolbar.tsx` with Print, PDF, CSV buttons

#### Phase 2: DataTable Enhancement ✅
- Added status filter dropdown (`filterKey`, `filterOptions`)
- Added bulk selection with bulk action toolbar (delete, status change)
- Added export toolbar integration (Print/PDF/CSV)
- Added `exportValue` function per column for clean export data

#### Phase 3: Customer Module Upgrade ✅
- Add Customer button (creates via `admin-create-user` edge function)
- Edit Customer modal (name, phone, company, city, address)
- Delete Customer with confirmation
- Export buttons (CSV/Print/PDF) on customer list

#### Phase 4: Order Module Upgrade ✅
- Delete Order with confirmation dialog
- Print Order button in detail modal
- Status filter dropdown in list view
- CSV/Print/PDF export
- Bulk selection and bulk delete
- Audit logging on update/delete

#### Phase 5: Invoice Module Upgrade ✅
- Full Edit Invoice (subtotal, discount, tax, notes, due date, auto-recalculate total)
- Delete Invoice with confirmation
- Print Invoice button
- Customer name column (fetched from profiles)
- Status filter dropdown
- CSV/Print/PDF export
- Bulk selection and bulk delete
- Audit logging on update/delete

#### Phase 6: Domain & Hosting Module Upgrades ✅
- Print/PDF/CSV export added to both modules
- Status filter dropdowns added

#### Phase 7: Leads, Payments, Subscriptions Export ✅
- ExportToolbar added to AdminLeads
- ExportToolbar added to AdminPaymentVerification
- ExportToolbar added to AdminSubscriptions

#### Phase 8: Audit Log Utility ✅
- Created `src/lib/auditLog.ts` with `logAudit()` function
- Integrated into Orders, Invoices, Customers modules

#### Phase 9: Data Integrity (Database) ✅
- Trigger: prevent order deletion if paid invoices exist
- Auto-cleanup: unpaid invoices deleted when order deleted
- Auto-invoice generation on order creation (previous migration)

#### Phase 10: Permission System ✅
- Added `support` role to `app_role` enum
- Created `role_permissions` table with RLS
- Created `has_permission()` function
- Seeded default permissions for admin, staff, support roles

### REMAINING (Future Phases)
- Admin UI page to configure permissions per role
- Domain/Hosting history view in detail modals
- Order create from admin panel
- Admin audit log viewer with export
