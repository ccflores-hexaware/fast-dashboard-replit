import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import FASTPage from "@/pages/FASTPage";
import SubAssetsPage from "@/pages/SubAssetsPage";
import TPIPage from "@/pages/TPIPage";
import BTOPage from "@/pages/BTOPage";
import CMDBPage from "@/pages/CMDBPage";
import ReconPage from "@/pages/ReconPage";
import PBCAutomationPage from "@/pages/PBCAutomationPage";
import { UserProvider } from "@/lib/userContext";

function Router() {
  return (
    <Switch>
      <Route path="/">
         <Redirect to="/pbc" />
      </Route>
      <Route path="/pbc">
        <PBCAutomationPage />
      </Route>
      <Route path="/sub-assets">
        <SubAssetsPage />
      </Route>
      <Route path="/tpi">
        <TPIPage />
      </Route>
      <Route path="/bto">
        <BTOPage />
      </Route>
      <Route path="/cmdb">
        <CMDBPage />
      </Route>
      <Route path="/recon">
        <ReconPage />
      </Route>
      <Route path="/fast">
        <FASTPage />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
