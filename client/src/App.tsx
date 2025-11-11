import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WeeklyGoals from "@/pages/weekly-goals";
import ProgressTracker from "@/pages/progress-tracker";
import ReflectArchive from "@/pages/reflect-archive";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={WeeklyGoals} />
        <Route path="/progress" component={ProgressTracker} />
        <Route path="/reflect" component={ReflectArchive} />
      </Switch>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
