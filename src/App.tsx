import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
              {/* Public Authentication Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/register" element={<SignUp />} />

              {/* Protected Agricultural Dashboard & Modules */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner"
                element={
                  <ProtectedRoute>
                    <CropPlanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/market"
                element={
                  <ProtectedRoute>
                    <Market />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute>
                    <CropDoctor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schemes"
                element={
                  <ProtectedRoute>
                    <Schemes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />

              {/* Smart Crop Protection & Insurance Assistant Routes */}
              <Route
                path="/crop-assistant"
                element={
                  <ProtectedRoute>
                    <CropAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather-alerts"
                element={
                  <ProtectedRoute>
                    <CropAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crop-protection"
                element={
                  <ProtectedRoute>
                    <CropAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insurance-assistant"
                element={
                  <ProtectedRoute>
                    <CropAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/damage-reporting"
                element={
                  <ProtectedRoute>
                    <CropAssistant />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
