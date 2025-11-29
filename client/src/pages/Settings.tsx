import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Settings as SettingsIcon, Key, AlertCircle, CheckCircle, Crown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [licenseKey, setLicenseKey] = useState("");

  const { data: licenseStatus, refetch } = trpc.license.status.useQuery();

  const activateMutation = trpc.license.activate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setLicenseKey("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleActivate = () => {
    if (!licenseKey.trim()) {
      toast.error("Please enter a license key");
      return;
    }

    activateMutation.mutate({ licenseKey: licenseKey.trim() });
  };

  const getStatusBadge = () => {
    if (!licenseStatus) return null;

    switch (licenseStatus.status) {
      case 'trial':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Free Trial - {licenseStatus.daysRemaining} day{licenseStatus.daysRemaining !== 1 ? 's' : ''} remaining
            </AlertDescription>
          </Alert>
        );
      case 'active':
        return (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Active Subscription - {licenseStatus.message}
            </AlertDescription>
          </Alert>
        );
      case 'expired':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {licenseStatus.message}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and subscription
          </p>
        </div>

        {/* License Status */}
        {getStatusBadge()}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Account Type</label>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role || 'User'}</p>
            </div>
          </CardContent>
        </Card>

        {/* License Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              License Management
            </CardTitle>
            <CardDescription>
              Activate a license key to unlock full access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenseStatus?.status === 'active' && licenseStatus.licenseKey && (
              <div>
                <label className="text-sm font-medium">Current License Key</label>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{licenseStatus.licenseKey}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter License Key</label>
              <div className="flex gap-2">
                <Input
                  placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  disabled={activateMutation.isPending}
                  className="font-mono"
                />
                <Button
                  onClick={handleActivate}
                  disabled={activateMutation.isPending || !licenseKey.trim()}
                >
                  {activateMutation.isPending ? 'Activating...' : 'Activate'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Section */}
        {(licenseStatus?.status === 'trial' || licenseStatus?.status === 'expired') && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Get unlimited access to all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Pro Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Unlimited document scanning</li>
                  <li>Advanced AI tagging and classification</li>
                  <li>Duplicate detection and management</li>
                  <li>Priority support</li>
                  <li>Regular updates and new features</li>
                </ul>
              </div>
              <Button className="w-full" size="lg">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Now - $9.99/month
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Payment integration coming soon
              </p>
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Document Organizer v1.0.0</p>
            <p>Intelligent document management powered by AI</p>
            <p className="text-xs">© 2025 All rights reserved</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
