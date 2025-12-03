import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Key } from 'lucide-react';
import { LicenseDialog } from './LicenseDialog';

export function LicenseStatus() {
  const [showDialog, setShowDialog] = useState(false);
  const { data: licenseInfo, isLoading } = trpc.license.getStatus.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!licenseInfo) return null;

  const getStatusBadge = () => {
    switch (licenseInfo.status) {
      case 'active':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'trial':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Trial
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (licenseInfo.status === 'active') {
      return 'You have full access to all Sorto features.';
    }
    if (licenseInfo.status === 'trial') {
      return `${licenseInfo.daysRemaining} day${licenseInfo.daysRemaining === 1 ? '' : 's'} remaining in your trial.`;
    }
    if (licenseInfo.status === 'expired') {
      return 'Your trial has expired. Activate a license to continue using Sorto.';
    }
    return 'Status unknown';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>License Status</CardTitle>
              <CardDescription className="mt-1">{getStatusMessage()}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {licenseInfo.licenseKey && (
              <div className="flex items-center gap-2 text-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {licenseInfo.licenseKey}
                </code>
              </div>
            )}

            {licenseInfo.status !== 'active' && (
              <Button onClick={() => setShowDialog(true)} className="w-full">
                {licenseInfo.status === 'expired' ? 'Activate License' : 'Activate Now'}
              </Button>
            )}

            {licenseInfo.status === 'trial' && (
              <p className="text-xs text-muted-foreground text-center">
                Need more time?{' '}
                <a
                  href="https://gumroad.com/l/sorto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get a license
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <LicenseDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        licenseStatus={licenseInfo.status}
        daysRemaining={licenseInfo.daysRemaining}
      />
    </>
  );
}
