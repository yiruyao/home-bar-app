import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import AddItem from "./pages/AddItem";
import ItemDetails from "./pages/ItemDetails";
import Mix from "./pages/Mix";
import Scan from "./pages/Scan";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import IOSTabBar from "./components/IOSTabBar";
import { useNativeIntegration } from "./hooks/useNativeIntegration";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Fix router state inconsistency between React Router and browser location
  useEffect(() => {
    if (!loading && location.pathname !== window.location.pathname) {
      navigate(window.location.pathname, { replace: true });
    }
  }, [location.pathname, loading, navigate]);
  
  // Show tab bar only on authenticated app pages
  const showTabBar = user && (['/', '/mix', '/scan', '/profile', '/add-item'].includes(location.pathname) || location.pathname.startsWith('/item/'));
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main route - handles both authenticated and unauthenticated states */}
        <Route path="/" element={<Index />} />
        
        {/* Protected routes - redirect to home if not authenticated */}
        <Route path="/profile" element={user ? <Profile /> : <Index />} />
        <Route path="/add-item" element={user ? <AddItem /> : <Index />} />
        <Route path="/item/:id" element={user ? <ItemDetails /> : <Index />} />
        <Route path="/mix" element={user ? <Mix /> : <Index />} />
        <Route path="/scan" element={user ? <Scan /> : <Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showTabBar && <IOSTabBar />}
    </>
  );
};

const App = () => {
  useNativeIntegration();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
