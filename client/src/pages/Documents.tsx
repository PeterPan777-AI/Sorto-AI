import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Search,
  FolderPlus,
  Loader2,
  File,
  FileSpreadsheet,
  Presentation,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Documents() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated }
  );

  const scanMutation = trpc.scan.startScan.useMutation({
    onSuccess: (data) => {
      toast.success(`Scan started! Scan ID: ${data.scanId}`);
      setIsScanning(false);
      setFolderPath("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Scan failed: ${error.message}`);
      setIsScanning(false);
    }
  });

  const handleScan = () => {
    if (!folderPath.trim()) {
      toast.error("Please enter a folder path");
      return;
    }

    setIsScanning(true);
    scanMutation.mutate({
      folderPath: folderPath.trim()
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'docx':
      case 'doc':
        return <File className="h-4 w-4" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredDocuments = documents?.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.extractedText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Browse, search, and manage your documents
          </p>
        </div>

        {/* Scan New Folder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Scan New Folder
            </CardTitle>
            <CardDescription>
              Enter a folder path to scan for documents (Word, PowerPoint, Excel)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., D:\My Documents\Projects"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                disabled={isScanning}
                className="flex-1"
              />
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Scan Folder
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: This will scan all subfolders recursively. Large folders may take several minutes.
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>
              {filteredDocuments?.length || 0} document{filteredDocuments?.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.filePath}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.documentType && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.documentType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {doc.categories && Array.isArray(doc.categories) && (doc.categories as any[]).slice(0, 3).map((cat: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      <p>{new Date(doc.modifiedAt).toLocaleDateString()}</p>
                      <p>{(doc.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan a folder to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
