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
