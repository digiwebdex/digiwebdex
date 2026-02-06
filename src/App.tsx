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

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

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
          <Route path="/bn/contact" element={<Contact />} />
          <Route path="/bn/auth/login" element={<Login />} />
          <Route path="/bn/auth/register" element={<Register />} />
          <Route path="/bn/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/bn/auth/reset-password" element={<ResetPassword />} />
          <Route path="/bn/auth/verify-email" element={<VerifyEmail />} />
          
          {/* Bangla - Protected Dashboard Routes */}
          <Route path="/bn/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bn/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/bn/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/bn/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Bangla - Protected Admin Routes */}
          <Route path="/bn/admin" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/bn/admin/*" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          
          {/* English routes */}
          <Route path="/en" element={<Home />} />
          <Route path="/en/pricing" element={<Pricing />} />
          <Route path="/en/contact" element={<Contact />} />
          <Route path="/en/auth/login" element={<Login />} />
          <Route path="/en/auth/register" element={<Register />} />
          <Route path="/en/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/en/auth/reset-password" element={<ResetPassword />} />
          <Route path="/en/auth/verify-email" element={<VerifyEmail />} />
          
          {/* English - Protected Dashboard Routes */}
          <Route path="/en/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/en/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/en/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/en/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* English - Protected Admin Routes */}
          <Route path="/en/admin" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/en/admin/*" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
          
          {/* Catch-all routes for both languages */}
          <Route path="/bn/*" element={<Home />} />
          <Route path="/en/*" element={<Home />} />
          
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
