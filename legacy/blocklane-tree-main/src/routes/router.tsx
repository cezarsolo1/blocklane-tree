import { createBrowserRouter, RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/lib/auth-guards";
import { AppShell } from "@/components/AppShell";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import TestMail from "@/pages/TestMail";
import AuthCallback from "@/pages/AuthCallback";
import Wizard from "@/pages/Wizard";
import End from "@/pages/End";
import Logout from "@/pages/Logout";
import NotFound from "@/pages/NotFound";

import Level from "@/pages/Level";
import Review from "@/pages/Review";
import Dankuwel from "@/pages/Dankuwel";
import MeldingVoltooid from "@/pages/MeldingVoltooid";

export const routeConfig: RouteObject[] = [
  { path: "/", element: <AppShell><Index /></AppShell> },
  { path: "/auth", element: <Auth /> },
  { path: "/auth/test-mail", element: <TestMail /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { 
    path: "/wizard", 
    element: <AppShell><ProtectedRoute><Wizard /></ProtectedRoute></AppShell>
  },
  { path: "/level", element: <AppShell><Level /></AppShell> },
  { path: "/review", element: <AppShell><Review /></AppShell> },
  { path: "/dankuwel", element: <AppShell><Dankuwel /></AppShell> },
  { path: "/meldingvoltooid", element: <AppShell><MeldingVoltooid /></AppShell> },
  { 
    path: "/end/:type", 
    element: <ProtectedRoute><End /></ProtectedRoute>
  },
  { path: "/logout", element: <Logout /> },
  { path: "*", element: <AppShell><NotFound /></AppShell> },
];

export const router = createBrowserRouter(routeConfig);
export default router;