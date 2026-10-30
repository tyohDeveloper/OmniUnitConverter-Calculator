import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";

// Single page, no routing: the artifact must render from any URL path
// (file://, a hosted sub-path, or the apex), so nothing depends on location.
function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Home />
    </TooltipProvider>
  );
}

export default App;
