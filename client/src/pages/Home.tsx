import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, FolderSearch, Search, Sparkles, Tags } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: stats } = trpc.documents.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: recentDocs } = trpc.documents.list.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 text-white text-4xl font-bold mb-4">
              S
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
            <p className="text-xl text-gray-600">Your Documents, Sorted.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Welcome to {APP_TITLE}</CardTitle>
              <CardDescription>
                AI-powered document organization that actually works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Automatic AI Tagging</p>
                    <p className="text-sm text-muted-foreground">
                      Let AI understand and categorize your documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FolderSearch className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Smart Organization</p>
                    <p className="text-sm text-muted-foreground">
                      Find any file in seconds with powerful search
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Duplicate Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically find and manage duplicate files
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Start Free Trial (7 Days)
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                No credit card required • Full features • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold">{APP_TITLE}</h1>
              <p className="text-xs text-muted-foreground">Your Documents, Sorted</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.licenseStatus === "trial" && `${user?.daysRemaining} days left in trial`}
                {user?.licenseStatus === "active" && "Active subscription"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="Search your documents..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Document Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(stats?.byType || {}).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Duplicates Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently scanned files</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocs && recentDocs.length > 0 ? (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground truncate">{doc.filePath}</p>
                    </div>
                    {doc.documentType && (
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                        {doc.documentType}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents yet</p>
                <p className="text-sm">Scan a folder to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/documents">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FolderSearch className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Scan Folder</CardTitle>
                    <CardDescription>Add documents to organize</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/duplicates">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Tags className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Review Duplicates</CardTitle>
                    <CardDescription>Clean up duplicate files</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
