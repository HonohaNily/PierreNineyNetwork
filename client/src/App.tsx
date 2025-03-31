import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { NineyModeContext } from "@/hooks/use-niney-mode";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [nineyMode, setNineyMode] = useState(false);
  const [nineyCounter, setNineyCounter] = useState(0);

  return (
    <NineyModeContext.Provider value={{ nineyMode, setNineyMode, nineyCounter, setNineyCounter }}>
      <AuthProvider>
        <div className="dark-theme">
          <Router />
        </div>
      </AuthProvider>
    </NineyModeContext.Provider>
  );
}

export default App;
