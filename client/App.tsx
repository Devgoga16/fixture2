import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TournamentView from "./pages/TournamentView";
import { TeamPlayers } from "./pages/TeamPlayers";
import ManageMatch from "./pages/ManageMatch";
import DelegateLogin from "./pages/DelegateLogin";
import DelegateDashboard from "./pages/DelegateDashboard";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new" element={<TournamentView />} />
          <Route path="/tournament/:id" element={<TournamentView />} />
          <Route path="/tournament/:tournamentId/match/:matchId" element={<ManageMatch />} />
          <Route path="/team/:teamId/players" element={<TeamPlayers />} />
          <Route path="/delegate-login" element={<DelegateLogin />} />
          <Route path="/delegate-dashboard" element={<DelegateDashboard />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
