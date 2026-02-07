
# Complete Admin Panel & Data Setup Plan

## Overview
DigiWebDex প্ল্যাটফর্মের জন্য সম্পূর্ণ অ্যাডমিন প্যানেল CRUD পেজ এবং ডাটাবেজ সিড ডাটা তৈরি করা হবে।

## Current Status
- 3 admin pages exist: Dashboard, Analytics, Payment Verification
- 39 database tables ready (most empty)
- Domain pricing has data (10 TLDs)
- Services and service_packages tables are empty

---

## Phase 1: Database Seed Data

### 1.1 Service Categories
```text
+------------------+----------------------+
| English          | Bengali              |
+------------------+----------------------+
| Domain Services  | ডোমেইন সেবা          |
| Web Hosting      | ওয়েব হোস্টিং         |
| Web Development  | ওয়েব ডেভেলপমেন্ট     |
| Software Dev     | সফটওয়্যার ডেভেলপমেন্ট |
| Digital Marketing| ডিজিটাল মার্কেটিং     |
+------------------+----------------------+
```

### 1.2 Services (5 main services)
- Domain Registration
- Web Hosting (Shared, VPS, Dedicated)
- Web Development
- Software Development
- Digital Marketing (SEO, Social Media, PPC)

### 1.3 Service Packages (15+ packages)
**Hosting Packages:**
- Starter (1999 BDT/year)
- Business (3999 BDT/year)
- Enterprise (7999 BDT/year)

**Web Development:**
- Basic (15,000 BDT)
- Professional (35,000 BDT)
- E-commerce (75,000 BDT)

**Software Development:**
- Custom App (100,000+ BDT)
- Enterprise Solution (500,000+ BDT)

**Digital Marketing:**
- SEO Basic (5,000 BDT/month)
- Social Media (8,000 BDT/month)
- Complete Package (15,000 BDT/month)

---

## Phase 2: Admin CRUD Pages (10 pages)

### 2.1 Services Management (`/admin/services`)
**Features:**
- List all services with status badges
- Create/Edit service modal with bilingual fields
- Toggle active/inactive status
- Drag-drop sorting

**Fields:**
- name_en, name_bn (required)
- description_en, description_bn
- service_type (enum: domain, hosting, web_development, etc.)
- category_id (relation)
- features_en, features_bn (JSON array)
- is_active, sort_order

### 2.2 Packages Management (`/admin/packages`)
**Features:**
- List packages grouped by service
- Create/Edit with pricing details
- Mark as popular
- Copy package functionality

**Fields:**
- name_en, name_bn
- price, setup_fee
- billing_type (one_time, recurring, milestone)
- billing_cycle_months
- features_en, features_bn (JSON)
- is_popular, is_active

### 2.3 Orders Management (`/admin/orders`)
**Features:**
- List with filters (status, date range, service type)
- View order details
- Update order status
- Add admin notes
- Link to invoice and payment

**Status Flow:**
pending -> paid -> processing -> active/completed

### 2.4 Invoices Management (`/admin/invoices`)
**Features:**
- List with status filters
- View invoice details
- Update status (paid, overdue, cancelled)
- Print/Download PDF
- Send reminder (future)

### 2.5 Domains Management (`/admin/domains`)
**Features:**
- List all customer domains
- View DNS records, nameservers
- Update status
- Renewal tracking
- WHOIS lookup integration

### 2.6 Hosting Management (`/admin/hosting`)
**Features:**
- List hosting accounts with server info
- View credentials (encrypted)
- Suspend/Unsuspend
- Upgrade package
- Resource usage stats

### 2.7 Projects Management (`/admin/projects`)
**Features:**
- Kanban board view (pending/in_progress/review/completed)
- Assign staff to project
- Milestone tracking
- File attachments
- Client communication log

### 2.8 Users Management (`/admin/users`)
**Features:**
- List all users with roles
- View user profile and orders
- Change role (client/staff/admin)
- Disable/Enable account
- View login history

### 2.9 Blog CMS (`/admin/blog`)
**Features:**
- List posts with publish status
- Rich text editor (TipTap or similar)
- Category and tag management
- Featured image upload
- SEO fields (meta title, description)
- Schedule publishing

### 2.10 SEO Settings (`/admin/seo`)
**Features:**
- Page-wise SEO settings
- Schema markup editor
- Sitemap management
- Robots.txt editor

---

## Phase 3: File Structure

```text
src/pages/admin/
  AdminDashboard.tsx (existing)
  AdminAnalytics.tsx (existing)
  AdminPaymentVerification.tsx (existing)
  AdminServices.tsx (new)
  AdminPackages.tsx (new)
  AdminOrders.tsx (new)
  AdminInvoices.tsx (new)
  AdminDomains.tsx (new)
  AdminHosting.tsx (new)
  AdminProjects.tsx (new)
  AdminUsers.tsx (new)
  AdminBlog.tsx (new)
  AdminSEO.tsx (new)

src/components/admin/
  common/
    DataTable.tsx (reusable table with sorting/filtering)
    StatusBadge.tsx
    DeleteConfirmDialog.tsx
    FormModal.tsx
  services/
    ServiceForm.tsx
    PackageForm.tsx
  orders/
    OrderDetailModal.tsx
    StatusUpdateDropdown.tsx
  blog/
    BlogEditor.tsx
    CategoryManager.tsx
```

---

## Phase 4: Route Configuration

Add to `App.tsx`:
```text
/admin/services     -> AdminServices
/admin/packages     -> AdminPackages
/admin/orders       -> AdminOrders
/admin/invoices     -> AdminInvoices
/admin/domains      -> AdminDomains
/admin/hosting      -> AdminHosting
/admin/projects     -> AdminProjects
/admin/users        -> AdminUsers
/admin/blog         -> AdminBlog
/admin/seo          -> AdminSEO
```

---

## Technical Details

### Reusable Components
1. **DataTable** - Generic table with:
   - Column sorting
   - Search/filter
   - Pagination
   - Row selection
   - Bulk actions

2. **FormModal** - Generic form dialog with:
   - Bilingual field support
   - Validation (zod)
   - Loading states

3. **StatusBadge** - Consistent status display

### API Pattern
Each admin page follows:
```typescript
// Fetch data
const { data, loading, refetch } = useQuery(...)

// Create/Update
const handleSave = async (formData) => {
  await supabase.from('table').upsert(formData)
  refetch()
  toast.success('Saved!')
}

// Delete
const handleDelete = async (id) => {
  await supabase.from('table').delete().eq('id', id)
  refetch()
}
```

### RLS Considerations
All admin tables already have RLS policies for admin/staff access.

---

## Implementation Order

1. **Day 1**: Seed data + reusable components
2. **Day 2**: Services + Packages pages
3. **Day 3**: Orders + Invoices pages
4. **Day 4**: Domains + Hosting pages
5. **Day 5**: Users + Projects pages
6. **Day 6**: Blog CMS + SEO pages
7. **Day 7**: Testing + Polish

---

## Expected Outcome

After implementation:
- 10 new admin pages (full CRUD)
- 5 service categories in database
- 5 main services with descriptions
- 15+ pricing packages
- Complete management workflow
- Bilingual support (EN/BN)

