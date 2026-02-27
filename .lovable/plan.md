

## ERP-Level Admin System Upgrade Plan

This is a large-scale upgrade across the entire admin panel. The work will be broken into focused implementation phases.

### Current State Assessment

**Already implemented (functional):**
- Orders: View, Edit status, Search, Due reminders
- Invoices: View, Edit status, Search (auto-generated via DB trigger)
- Customers: List, Detail view with tabs (orders/invoices/domains/hosting/payments/projects/tickets/subscriptions)
- Packages: Full CRUD (Add/Edit/Delete), Search
- Services: Full CRUD, Search
- Domains: Full CRUD with DNS editor, status control
- Hosting: Full CRUD with lifecycle actions (suspend/unsuspend)
- Leads: Full CRUD with status pipeline, stats, filters
- Notification Templates: Admin-editable
- Audit Logs: Insert logging exists
- Role system: user_roles table with has_role() function

**Missing across ALL modules:**
- Print view
- PDF download
- CSV/Excel export
- Delete for Orders/Invoices
- Bulk actions
- Status filter dropdowns (most modules)
- Customer edit/add from admin
- Order create from admin
- Invoice line items editing
- Granular permission system (only admin/client/staff roles exist, no per-action permissions)

---

### Implementation Plan

#### Phase 1: Shared Export/Print Utility
Create a reusable utility module `src/lib/exportUtils.ts` that provides:
- `exportToCSV(data, columns, filename)` - generates and downloads CSV
- `exportToPDF(data, columns, filename, title)` - generates printable PDF (using browser print with styled HTML)
- `printTable(data, columns, title)` - opens print dialog with formatted table

Create a reusable `ExportToolbar` component with Print, PDF, CSV buttons that all admin tables can use.

#### Phase 2: DataTable Enhancement
Upgrade the shared `DataTable` component to support:
- Status filter dropdown prop (`filterKey`, `filterOptions`)
- Bulk selection with bulk action toolbar (delete, export, status change)
- Export toolbar integration (Print/PDF/CSV buttons in header)

#### Phase 3: Customer Module Upgrade
- Add **Create Customer** button (creates auth user via `admin-create-user` edge function + profile)
- Add **Edit Customer** modal (edit profile fields: name, phone, company, address, city)
- Add **Delete Customer** with confirmation
- Add export buttons to customer list
- Add export buttons inside customer detail tabs

#### Phase 4: Order Module Upgrade
- Add **Create Order** from admin (select customer, service, package, set pricing)
- Add **Delete Order** with confirmation dialog
- Add **Print Order** button in detail modal
- Add **Download PDF** button in detail modal
- Add status filter dropdown in list view
- Add CSV export to orders list

#### Phase 5: Invoice Module Upgrade
- Add **Edit Invoice** (edit subtotal, discount, tax, notes, due date)
- Add **Delete Invoice** with confirmation
- Add **Print Invoice** as formatted invoice document
- Add **Download Invoice PDF** using styled print-to-PDF
- Add **Add Manual Payment** button linking to payment form
- Add customer name column (fetch from profiles)
- Add status filter dropdown
- Add CSV export

#### Phase 6: Domain & Hosting Module Upgrades
- Add Print/PDF/CSV export to both modules
- Add status filter dropdowns
- Add history view (domain_logs, renewal_logs) in detail modals

#### Phase 7: Leads, Payments, Subscriptions Export
- Add Print/PDF/CSV export buttons to AdminLeads, AdminPaymentVerification, AdminSubscriptions

#### Phase 8: Audit Log Enhancements
- Ensure all admin CRUD operations log to `audit_logs` table
- Add a utility function `logAuditAction(action, entityType, entityId, oldValues, newValues)` used across all admin pages
- Add export to audit logs page

#### Phase 9: Data Integrity (Database)
- Add database trigger: prevent order deletion if paid invoices exist
- Add database trigger: prevent hosting without domain validation
- Add unique constraint check for customer phone/email to prevent duplicates
- orderService `createOrder` already links customer via `user_id`

#### Phase 10: Permission System Enhancement
Database migration to add:
- `permissions` table with `role`, `module`, `action` columns (view/edit/delete/export/financial)
- New roles: `support` added to `app_role` enum
- A `has_permission(user_id, module, action)` function
- Admin UI page to configure permissions per role

---

### Technical Details

**Export Utility Architecture:**
```text
src/lib/exportUtils.ts
  ├── exportToCSV()     → Blob download as .csv
  ├── printView()       → window.print() with styled HTML
  └── exportToPDF()     → Same as print but triggers save

src/components/admin/common/ExportToolbar.tsx
  └── <ExportToolbar data={} columns={} filename="" />
       ├── [Print] button
       ├── [PDF] button  
       └── [CSV] button
```

**Audit Logging Utility:**
```text
src/lib/auditLog.ts
  └── logAudit(action, entityType, entityId, oldVals, newVals)
       → INSERT into audit_logs via supabase
```

**Files to Create:**
- `src/lib/exportUtils.ts`
- `src/components/admin/common/ExportToolbar.tsx`
- `src/lib/auditLog.ts`

**Files to Modify (major):**
- `src/components/admin/common/DataTable.tsx` (filter, bulk actions)
- `src/pages/admin/AdminOrders.tsx` (create, delete, print, PDF, filter, export)
- `src/pages/admin/AdminInvoices.tsx` (edit, delete, print, PDF, filter, export, customer info)
- `src/pages/admin/AdminCustomers.tsx` (add, edit, delete, export)
- `src/pages/admin/AdminDomains.tsx` (export, history)
- `src/pages/admin/AdminHosting.tsx` (export, history)
- `src/pages/admin/AdminLeads.tsx` (export)
- `src/pages/admin/AdminPaymentVerification.tsx` (export)
- `src/pages/admin/AdminSubscriptions.tsx` (export)

**Database Migrations:**
- Add `support` to `app_role` enum
- Create `role_permissions` table
- Create `has_permission()` function
- Add data integrity triggers

This is a very large scope. I recommend implementing in the phases above, starting with Phases 1-2 (shared utilities) then 3-5 (core modules) as they provide the most value.

