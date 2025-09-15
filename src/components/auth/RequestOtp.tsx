import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Zap } from 'lucide-react';

export const RequestOtp = () => {
  const { bypassAuth } = useAuth();

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Maintenance Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Click below to access the maintenance system
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={bypassAuth}
            >
              <Zap className="w-4 h-4" />
              Enter Maintenance System
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Only authorized users can access this system.</p>
              <p>If you need access, contact <strong>contact@blocklane.nl</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
