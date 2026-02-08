import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Globe,
  Server,
  FolderKanban,
  Users,
  Settings,
  FileEdit,
  Bell,
  BarChart3,
  Tag,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  UserPlus,
  FileCheck,
  RefreshCcw,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { language } = useLanguage();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = language === 'en' ? '/en' : '/bn';

  const menuSections = [
    {
      title: language === 'bn' ? 'মূল মেনু' : 'Main',
      items: [
        { label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard, href: `${basePath}/admin` },
        { label: language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: BarChart3, href: `${basePath}/admin/analytics` },
        { label: language === 'bn' ? 'লিডস' : 'Leads', icon: UserPlus, href: `${basePath}/admin/leads` },
        { label: language === 'bn' ? 'প্রস্তাবনা' : 'Proposals', icon: FileCheck, href: `${basePath}/admin/proposals` },
      ],
    },
    {
      title: language === 'bn' ? 'সার্ভিস' : 'Services',
      items: [
        { label: language === 'bn' ? 'সার্ভিস ম্যানেজ' : 'Services', icon: Package, href: `${basePath}/admin/services` },
        { label: language === 'bn' ? 'প্যাকেজ/প্রাইসিং' : 'Packages', icon: Tag, href: `${basePath}/admin/packages` },
      ],
    },
    {
      title: language === 'bn' ? 'অর্ডার ও বিলিং' : 'Orders & Billing',
      items: [
        { label: language === 'bn' ? 'অর্ডারসমূহ' : 'Orders', icon: ShoppingCart, href: `${basePath}/admin/orders` },
        { label: language === 'bn' ? 'ইনভয়েস' : 'Invoices', icon: FileText, href: `${basePath}/admin/invoices` },
        { label: language === 'bn' ? 'পেমেন্ট' : 'Payments', icon: CreditCard, href: `${basePath}/admin/payments` },
        { label: language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions', icon: RefreshCcw, href: `${basePath}/admin/subscriptions` },
      ],
    },
    {
      title: language === 'bn' ? 'পণ্য/সেবা' : 'Products',
      items: [
        { label: language === 'bn' ? 'ডোমেইন' : 'Domains', icon: Globe, href: `${basePath}/admin/domains` },
        { label: language === 'bn' ? 'হোস্টিং' : 'Hosting', icon: Server, href: `${basePath}/admin/hosting` },
        { label: language === 'bn' ? 'প্রজেক্ট' : 'Projects', icon: FolderKanban, href: `${basePath}/admin/projects` },
      ],
    },
    {
      title: language === 'bn' ? 'কন্টেন্ট' : 'Content',
      items: [
        { label: language === 'bn' ? 'ব্লগ' : 'Blog', icon: FileEdit, href: `${basePath}/admin/blog` },
        { label: language === 'bn' ? 'SEO সেটিংস' : 'SEO', icon: Search, href: `${basePath}/admin/seo` },
      ],
    },
    {
      title: language === 'bn' ? 'সাপোর্ট' : 'Support',
      items: [
        { label: language === 'bn' ? 'টিকেট' : 'Tickets', icon: Headphones, href: `${basePath}/admin/tickets` },
      ],
    },
    {
      title: language === 'bn' ? 'ব্যবস্থাপনা' : 'Management',
      items: [
        { label: language === 'bn' ? 'ব্যবহারকারী' : 'Users', icon: Users, href: `${basePath}/admin/users` },
        { label: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications', icon: Bell, href: `${basePath}/admin/notifications` },
        { label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings, href: `${basePath}/admin/settings` },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = basePath;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card overflow-y-auto transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4 sticky top-0 bg-card z-10">
            {!collapsed && (
              <Link to={basePath} className="flex items-center gap-2">
                <img src={logo} alt="DigiWebDex" className="h-8 w-auto" />
                <span className="font-bold text-lg">Admin</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={collapsed ? 'mx-auto' : ''}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Back to Site */}
          <div className="px-3 py-2 border-b">
            <Link
              to={basePath}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
                collapsed && 'justify-center px-2'
              )}
            >
              <Home className="h-5 w-5 shrink-0" />
              {!collapsed && (language === 'bn' ? 'সাইটে ফিরুন' : 'Back to Site')}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {!collapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t p-4 sticky bottom-0 bg-card">
            {!collapsed && user && (
              <div className="mb-2 text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            <Button
              variant="ghost"
              className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && (language === 'bn' ? 'লগআউট' : 'Logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container-custom py-8">{children}</div>
      </main>
    </div>
  );
}
