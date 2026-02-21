import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  Globe,
  Server,
  FolderKanban,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  ListChecks,
  RefreshCw,
  Headphones,
  Building2,
  Rocket,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { language } = useLanguage();
  const { signOut, isAdmin, isStaff, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = language === 'en' ? '/en' : '/bn';

  const clientMenuItems = [
    { 
      label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', 
      icon: LayoutDashboard, 
      href: `${basePath}/dashboard` 
    },
    { 
      label: language === 'bn' ? 'নতুন সেবা শুরু' : 'Get Started', 
      icon: Rocket, 
      href: `${basePath}/dashboard/onboarding` 
    },
    { 
      label: language === 'bn' ? 'ডোমেইন+হোস্টিং' : 'Domain+Hosting', 
      icon: Package, 
      href: `${basePath}/dashboard/bundle-checkout` 
    },
    { 
      label: language === 'bn' ? 'অর্ডারসমূহ' : 'Orders', 
      icon: ShoppingCart, 
      href: `${basePath}/dashboard/orders` 
    },
    { 
      label: language === 'bn' ? 'ইনভয়েস' : 'Invoices', 
      icon: FileText, 
      href: `${basePath}/dashboard/invoices` 
    },
    { 
      label: language === 'bn' ? 'পেমেন্ট' : 'Payments', 
      icon: CreditCard, 
      href: `${basePath}/dashboard/payments` 
    },
    { 
      label: language === 'bn' ? 'ডোমেইন' : 'Domains', 
      icon: Globe, 
      href: `${basePath}/dashboard/domains` 
    },
    { 
      label: language === 'bn' ? 'হোস্টিং' : 'Hosting', 
      icon: Server, 
      href: `${basePath}/dashboard/hosting` 
    },
    { 
      label: language === 'bn' ? 'প্রজেক্ট' : 'Projects', 
      icon: FolderKanban, 
      href: `${basePath}/dashboard/projects` 
    },
    { 
      label: language === 'bn' ? 'মাইলস্টোন' : 'Milestones', 
      icon: ListChecks, 
      href: `${basePath}/dashboard/milestones` 
    },
    { 
      label: language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions', 
      icon: RefreshCw, 
      href: `${basePath}/dashboard/subscriptions` 
    },
    { 
      label: language === 'bn' ? 'সাপোর্ট' : 'Support', 
      icon: Headphones, 
      href: `${basePath}/dashboard/support` 
    },
    { 
      label: language === 'bn' ? 'প্রোফাইল' : 'Profile', 
      icon: User, 
      href: `${basePath}/dashboard/profile` 
    },
    { 
      label: language === 'bn' ? 'অ্যাফিলিয়েট' : 'Affiliate', 
      icon: Users, 
      href: `${basePath}/dashboard/affiliate` 
    },
    { 
      label: language === 'bn' ? 'রিসেলার' : 'Reseller', 
      icon: Building2, 
      href: `${basePath}/dashboard/reseller` 
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
          'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!collapsed && (
              <Link to={basePath} className="flex items-center gap-2">
                <div className="gradient-button h-8 w-8 flex items-center justify-center rounded-lg font-bold text-lg">
                  D
                </div>
                <span className="font-bold text-lg">Digiwebdex</span>
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

          {/* Admin/Staff Badge */}
          {(isAdmin || isStaff) && !collapsed && (
            <div className="px-4 py-2">
              <Link
                to={`${basePath}/admin`}
                className="block rounded-lg bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/20"
              >
                {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {clientMenuItems.map((item) => {
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
          </nav>

          {/* User & Logout */}
          <div className="border-t p-4">
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
