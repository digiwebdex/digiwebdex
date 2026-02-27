import React from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  RefreshCcw,
  BarChart3,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড', path: '/admin' },
  { icon: Users, labelEn: 'Customers', labelBn: 'কাস্টমার', path: '/admin/customers' },
  { icon: ShoppingCart, labelEn: 'Orders', labelBn: 'অর্ডার', path: '/admin/orders' },
  { icon: FileText, labelEn: 'Invoices', labelBn: 'ইনভয়েস', path: '/admin/invoices' },
  { icon: CreditCard, labelEn: 'Payments', labelBn: 'পেমেন্ট', path: '/admin/payments' },
  { icon: RefreshCcw, labelEn: 'Subscriptions', labelBn: 'সাবস্ক্রিপশন', path: '/admin/subscriptions' },
  { icon: BarChart3, labelEn: 'Reports', labelBn: 'রিপোর্ট', path: '/admin/analytics' },
  { icon: Settings, labelEn: 'Settings', labelBn: 'সেটিংস', path: '/admin/settings' },
];

function AdminSidebar() {
  const { language } = useLanguage();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const basePath = language === 'en' ? '/en' : '/bn';

  const handleSignOut = async () => {
    await signOut();
    window.location.href = basePath;
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <img src={logo} alt="DigiWebDex" className="h-7 w-auto shrink-0" />
          {!collapsed && <span className="font-bold text-base">Admin</span>}
        </div>

        {/* Back to site */}
        <div className="px-2 pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to={basePath} end className="hover:bg-muted/50 text-muted-foreground" activeClassName="">
                  <Home className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{language === 'bn' ? 'সাইটে ফিরুন' : 'Back to Site'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {/* Main Menu */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`${basePath}${item.path}`}
                      end={item.path === '/admin'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && (language === 'bn' ? 'লগআউট' : 'Logout')}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-2">
            <SidebarTrigger />
          </header>
          <main className="flex-1">
            <div className="container-custom py-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
