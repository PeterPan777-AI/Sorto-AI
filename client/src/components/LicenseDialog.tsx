import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface LicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseStatus: 'trial' | 'expired' | 'active' | 'invalid';
  daysRemaining?: number;
}

export function LicenseDialog({
  open,
  onOpenChange,
  licenseStatus,
  daysRemaining,
}: LicenseDialogProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const activateMutation = trpc.license.activateLicense.useMutation({
    onSuccess: () => {
      utils.license.getStatus.invalidate();
      utils.auth.me.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleActivate = () => {
    setError('');
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }
    activateMutation.mutate({ licenseKey: licenseKey.trim().toUpperCase() });
  };

  const getDialogContent = () => {
    if (licenseStatus === 'expired') {
      return {
        title: 'Trial Expired',
        description:
          'Your 7-day trial has ended. Activate a license to continue using Sorto.',
        icon: <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />,
        canClose: false,
      };
    }

    if (licenseStatus === 'trial') {
      return {
        title: 'Activate License',
        description: `You have ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in your trial. Activate a license for unlimited access.`,
        icon: <Clock className="h-12 w-12 text-primary mx-auto mb-4" />,
        canClose: true,
      };
    }

    return {
      title: 'Activate License',
      description: 'Enter your Gumroad license key to activate Sorto.',
      icon: <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />,
      canClose: true,
    };
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={content.canClose ? onOpenChange : undefined}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => !content.canClose && e.preventDefault()}
        onEscapeKeyDown={(e) => !content.canClose && e.preventDefault()}
      >
        <DialogHeader>
          {content.icon}
          <DialogTitle className="text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
              className="font-mono uppercase"
              maxLength={35}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Don't have a license yet?</p>
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => window.open('https://gumroad.com/l/sorto', '_blank')}
            >
              Purchase Sorto License →
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {content.canClose && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={activateMutation.isPending}
            >
              Later
            </Button>
          )}
          <Button
            onClick={handleActivate}
            disabled={activateMutation.isPending || !licenseKey.trim()}
            className="w-full sm:w-auto"
          >
            {activateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Activate License
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
