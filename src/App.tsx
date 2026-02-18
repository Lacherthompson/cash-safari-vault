import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import { usePageTracking } from "@/hooks/usePageTracking";
import { InstallPrompt } from "@/components/InstallPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import HowToUse from "./pages/HowToUse";
import SavingsGuide from "./pages/SavingsGuide";
import EarnMore from "./pages/EarnMore";
import NotFound from "./pages/NotFound";
import VaultStarter from "./pages/VaultStarter";
import VaultStarterSuccess from "./pages/VaultStarterSuccess";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const PageTracker = () => {
  usePageTracking();
  return null;
};

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SettingsProvider>
              <Toaster />
              <Sonner />
              <InstallPrompt />
              <BrowserRouter>
                <PageTracker />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/vault/:id" element={<Vault />} />
                  <Route path="/how-to-use" element={<HowToUse />} />
                  <Route path="/savings-guide" element={<SavingsGuide />} />
                  <Route path="/earn-more" element={<EarnMore />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/vault-starter" element={<VaultStarter />} />
                  <Route path="/vault-starter/success" element={<VaultStarterSuccess />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SettingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
