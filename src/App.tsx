
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProfileProvider } from "./context/ProfileContext";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Visualization from "./pages/Visualization";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Initialize API URL from localStorage if available
const initializeApiUrl = () => {
  const savedApiUrl = localStorage.getItem('api_base_url');
  if (savedApiUrl) {
    console.log('Loading saved API URL from localStorage:', savedApiUrl);
    (window as any).API_BASE_URL = savedApiUrl;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// This component initializes the API URL before the app renders
const ApiInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initializeApiUrl();
  }, []);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApiInitializer>
      <ProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton={true} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/callback" element={<Landing />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/visualization" element={<Visualization />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </ApiInitializer>
  </QueryClientProvider>
);

export default App;
