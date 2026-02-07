import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Domains from "./pages/Domains";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import Locations from "./pages/Locations";
import LandingPage from "./pages/LandingPage";

// SEO Landing Pages
import { BestHostingBangladesh, WebDesignDhaka, ERPSoftwareBangladesh } from "./pages/landing";

// Service Pages
import DomainHostingPage from "./pages/services/DomainHosting";
import WebDevelopmentPage from "./pages/services/WebDevelopment";
import SoftwareDevelopmentPage from "./pages/services/SoftwareDevelopment";
import DigitalMarketingPage from "./pages/services/DigitalMarketing";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/dashboard/Orders";
import Invoices from "./pages/dashboard/Invoices";
import Payments from "./pages/dashboard/Payments";
import PaymentSubmit from "./pages/dashboard/PaymentSubmit";
import AffiliateDashboard from "./pages/dashboard/AffiliateDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPaymentVerification from "./pages/admin/AdminPaymentVerification";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminServices from "./pages/admin/AdminServices";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminDomains from "./pages/admin/AdminDomains";
import AdminHosting from "./pages/admin/AdminHosting";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminSEO from "./pages/admin/AdminSEO";

const queryClient = new QueryClient();

// Language wrapper to provide context
const LanguageRoutes = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Default redirect to Bangla */}
          <Route path="/" element={<Navigate to="/bn" replace />} />
          
          {/* Bangla routes */}
          <Route path="/bn" element={<Home />} />
          <Route path="/bn/pricing" element={<Pricing />} />
          <Route path="/bn/domains" element={<Domains />} />
          <Route path="/bn/contact" element={<Contact />} />
          <Route path="/bn/blog" element={<Blog />} />
          <Route path="/bn/blog/:slug" element={<BlogPostPage />} />
          <Route path="/bn/blog/category/:categorySlug" element={<Blog />} />
          <Route path="/bn/blog/tag/:tagSlug" element={<Blog />} />
          <Route path="/bn/locations" element={<Locations />} />
          <Route path="/bn/locations/:slug" element={<Locations />} />
          
          {/* Bangla - SEO Landing Pages */}
          <Route path="/bn/best-hosting-in-bangladesh" element={<BestHostingBangladesh />} />
          <Route path="/bn/web-design-company-in-dhaka" element={<WebDesignDhaka />} />
          <Route path="/bn/erp-software-bangladesh" element={<ERPSoftwareBangladesh />} />
          {/* Bangla - Service Pages */}
          <Route path="/bn/services/domain-hosting" element={<DomainHostingPage />} />
          <Route path="/bn/services/web-development" element={<WebDevelopmentPage />} />
          <Route path="/bn/services/software-development" element={<SoftwareDevelopmentPage />} />
          <Route path="/bn/services/digital-marketing" element={<DigitalMarketingPage />} />
          
          <Route path="/bn/auth/login" element={<Login />} />
          <Route path="/bn/auth/register" element={<Register />} />
          <Route path="/bn/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/bn/auth/reset-password" element={<ResetPassword />} />
          <Route path="/bn/auth/verify-email" element={<VerifyEmail />} />
          
          {/* Bangla - Protected Dashboard Routes */}
          <Route path="/bn/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bn/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/bn/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/bn/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/bn/dashboard/payment/submit" element={<ProtectedRoute><PaymentSubmit /></ProtectedRoute>} />
          <Route path="/bn/dashboard/affiliate" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
          <Route path="/bn/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Bangla - Protected Admin Routes */}
          <Route path="/bn/admin" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/bn/admin/analytics" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/bn/admin/payments" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminPaymentVerification /></ProtectedRoute>} />
          <Route path="/bn/admin/services" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminServices /></ProtectedRoute>} />
          <Route path="/bn/admin/packages" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminPackages /></ProtectedRoute>} />
          <Route path="/bn/admin/orders" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminOrders /></ProtectedRoute>} />
          <Route path="/bn/admin/invoices" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminInvoices /></ProtectedRoute>} />
          <Route path="/bn/admin/domains" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDomains /></ProtectedRoute>} />
          <Route path="/bn/admin/hosting" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminHosting /></ProtectedRoute>} />
          <Route path="/bn/admin/projects" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminProjects /></ProtectedRoute>} />
          <Route path="/bn/admin/users" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/bn/admin/blog" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminBlog /></ProtectedRoute>} />
          <Route path="/bn/admin/seo" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminSEO /></ProtectedRoute>} />
          <Route path="/bn/admin/*" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          
          {/* English routes */}
          <Route path="/en" element={<Home />} />
          <Route path="/en/pricing" element={<Pricing />} />
          <Route path="/en/domains" element={<Domains />} />
          <Route path="/en/contact" element={<Contact />} />
          <Route path="/en/blog" element={<Blog />} />
          <Route path="/en/blog/:slug" element={<BlogPostPage />} />
          <Route path="/en/blog/category/:categorySlug" element={<Blog />} />
          <Route path="/en/blog/tag/:tagSlug" element={<Blog />} />
          <Route path="/en/locations" element={<Locations />} />
          <Route path="/en/locations/:slug" element={<Locations />} />
          
          {/* English - SEO Landing Pages */}
          <Route path="/en/best-hosting-in-bangladesh" element={<BestHostingBangladesh />} />
          <Route path="/en/web-design-company-in-dhaka" element={<WebDesignDhaka />} />
          <Route path="/en/erp-software-bangladesh" element={<ERPSoftwareBangladesh />} />
          
          {/* English - Service Pages */}
          <Route path="/en/services/domain-hosting" element={<DomainHostingPage />} />
          <Route path="/en/services/web-development" element={<WebDevelopmentPage />} />
          <Route path="/en/services/software-development" element={<SoftwareDevelopmentPage />} />
          <Route path="/en/services/digital-marketing" element={<DigitalMarketingPage />} />
          
          <Route path="/en/auth/login" element={<Login />} />
          <Route path="/en/auth/register" element={<Register />} />
          <Route path="/en/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/en/auth/reset-password" element={<ResetPassword />} />
          <Route path="/en/auth/verify-email" element={<VerifyEmail />} />
          
          {/* English - Protected Dashboard Routes */}
          <Route path="/en/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/en/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/en/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/en/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/en/dashboard/payment/submit" element={<ProtectedRoute><PaymentSubmit /></ProtectedRoute>} />
          <Route path="/en/dashboard/affiliate" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
          <Route path="/en/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* English - Protected Admin Routes */}
          <Route path="/en/admin" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/en/admin/analytics" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/en/admin/payments" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminPaymentVerification /></ProtectedRoute>} />
          <Route path="/en/admin/services" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminServices /></ProtectedRoute>} />
          <Route path="/en/admin/packages" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminPackages /></ProtectedRoute>} />
          <Route path="/en/admin/orders" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminOrders /></ProtectedRoute>} />
          <Route path="/en/admin/invoices" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminInvoices /></ProtectedRoute>} />
          <Route path="/en/admin/domains" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDomains /></ProtectedRoute>} />
          <Route path="/en/admin/hosting" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminHosting /></ProtectedRoute>} />
          <Route path="/en/admin/projects" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminProjects /></ProtectedRoute>} />
          <Route path="/en/admin/users" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/en/admin/blog" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminBlog /></ProtectedRoute>} />
          <Route path="/en/admin/seo" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminSEO /></ProtectedRoute>} />
          <Route path="/en/admin/*" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          
          {/* Dynamic Landing Pages - must be before catch-all */}
          <Route path="/bn/:slug" element={<LandingPage />} />
          <Route path="/en/:slug" element={<LandingPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
