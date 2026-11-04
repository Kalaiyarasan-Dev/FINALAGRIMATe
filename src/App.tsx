import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CropPlanner from "./pages/CropPlanner";
import Market from "./pages/Market";
import CropDoctor from "./pages/CropDoctor";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Schemes from "./pages/Schemes";
import Calculator from "./pages/Calculator";
import Community from "./pages/Community";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CropAssistant from "./pages/CropAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/planner" element={<CropPlanner />} />
              <Route path="/market" element={<Market />} />
              <Route path="/doctor" element={<CropDoctor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/community" element={<Community />} />
              {/* Smart Crop Protection & Insurance Assistant Routes */}
              <Route path="/crop-assistant" element={<CropAssistant />} />
              <Route path="/weather-alerts" element={<CropAssistant />} />
              <Route path="/crop-protection" element={<CropAssistant />} />
              <Route path="/insurance-assistant" element={<CropAssistant />} />
              <Route path="/damage-reporting" element={<CropAssistant />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
