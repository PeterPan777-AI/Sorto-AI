import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, FolderSearch, Copy, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: licenseStatus } = trpc.license.status.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const { data: stats } = trpc.documents.stats.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const { data: scanHistory } = trpc.scanHistory.list.useQuery({ limit: 5 }, {
    enabled: isAuthenticated
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderSearch className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription className="text-base">
              Intelligent document organization powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Automatically scan and tag documents
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Detect duplicates and versions
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Smart search and filtering
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                7-day free trial included
              </p>
            </div>
            <Button className="w-full" size="lg" asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* License Status Alert */}
        {licenseStatus && (licenseStatus.status === 'trial' || licenseStatus.status === 'expired') && (
          <Alert variant={licenseStatus.status === 'expired' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {licenseStatus.message}
              {licenseStatus.status === 'expired' && (
                <Button variant="link" className="ml-2 h-auto p-0" asChild>
                  <Link href="/settings">Upgrade Now</Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground mt-2">
            Manage and organize your documents with AI-powered intelligence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all folders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Document Types</CardTitle>
              <FolderSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.byType ? Object.keys(stats.byType).length : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Different categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duplicates Found</CardTitle>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Needs review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/documents">
                <FileText className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Browse Documents</div>
                  <div className="text-xs text-muted-foreground">View and search all documents</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/duplicates">
                <Copy className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Review Duplicates</div>
                  <div className="text-xs text-muted-foreground">Find and manage duplicate files</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        {scanHistory && scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest folder scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{scan.folderPath}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{scan.filesProcessed} files</p>
                      <p className="text-xs text-muted-foreground capitalize">{scan.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
