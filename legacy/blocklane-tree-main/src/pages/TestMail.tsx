import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TestMail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMagic = async () => {
    if (!email) return;
    
    setLoading(true);
    const SITE_URL =
      (import.meta.env.VITE_SITE_URL?.replace(/\/$/, "")) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    
    const emailRedirectTo = `${SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo }
    });
    
    console.log("[Auth] magic link result:", { data, error, emailRedirectTo });
    
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("Magic link requested; check inbox/spam.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Terug naar inloggen
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Magic Link Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input 
                placeholder="email@domain.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={sendMagic}
              disabled={loading || !email}
            >
              {loading ? "Versturen..." : "Send magic link"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Test of Supabase e-mails worden verzonden. Check de console en Auth → Logs in Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}