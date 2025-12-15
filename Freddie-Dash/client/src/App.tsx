import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/Dashboard";
import { UserProvider } from "@/lib/userContext";

function Router() {
  return (
    <Switch>
      <Route path="/">
         <Redirect to="/assets" />
      </Route>
      <Route path="/assets">
        <DashboardPage type="assets" />
      </Route>
      <Route path="/tpi">
        <DashboardPage type="tpi" />
      </Route>
      <Route path="/bto">
        <DashboardPage type="bto" />
      </Route>
      <Route path="/cmdb">
        <DashboardPage type="cmdb" />
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
