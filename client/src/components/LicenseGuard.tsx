import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { LicenseDialog } from './LicenseDialog';
import { Loader2 } from 'lucide-react';

interface LicenseGuardProps {
  children: React.ReactNode;
  /**
   * If true, shows loading state while checking license
   * If false, renders children immediately and shows dialog if needed
   */
  blocking?: boolean;
}

/**
 * LicenseGuard - Protects features behind license validation
 * 
 * Usage:
 * <LicenseGuard>
 *   <ProtectedFeature />
 * </LicenseGuard>
 */
export function LicenseGuard({ children, blocking = false }: LicenseGuardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { data: accessCheck, isLoading } = trpc.license.canAccessFeatures.useQuery();

  useEffect(() => {
    if (accessCheck && !accessCheck.canAccess) {
      setShowDialog(true);
    }
  }, [accessCheck]);

  if (isLoading && blocking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Checking license...</p>
        </div>
      </div>
    );
  }

  // If user can't access and we're in blocking mode, don't render children
  if (accessCheck && !accessCheck.canAccess && blocking) {
    return (
      <LicenseDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        licenseStatus="expired"
        daysRemaining={0}
      />
    );
  }

  return (
    <>
      {children}
      {accessCheck && !accessCheck.canAccess && (
        <LicenseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          licenseStatus="expired"
          daysRemaining={0}
        />
      )}
    </>
  );
}
