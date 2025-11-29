import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Copy, Loader2, FileText, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Duplicates() {
  const { isAuthenticated } = useAuth();

  const { data: duplicateGroups, isLoading, refetch } = trpc.duplicates.list.useQuery(
    { includeResolved: false },
    { enabled: isAuthenticated }
  );

  const resolveMutation = trpc.duplicates.resolve.useMutation({
    onSuccess: () => {
      toast.success("Duplicate group marked as resolved");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to resolve: ${error.message}`);
    }
  });

  const handleResolve = (groupId: number) => {
    resolveMutation.mutate({ groupId });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Duplicate Documents</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage duplicate or similar documents
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Loading duplicates...</p>
              </div>
            </CardContent>
          </Card>
        ) : duplicateGroups && duplicateGroups.length > 0 ? (
          <div className="space-y-4">
            {duplicateGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5" />
                        {group.groupType === 'exact' ? 'Exact Duplicates' : 'Similar Versions'}
                      </CardTitle>
                      <CardDescription>
                        {group.documents.length} document{group.documents.length !== 1 ? 's' : ''} in this group
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(group.id)}
                      disabled={resolveMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <FileText className="h-4 w-4 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground truncate">{doc.filePath}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {doc.similarityScore}% similar
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(doc.fileSize / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          <p>{new Date(doc.modifiedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Copy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No duplicates found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your documents are well organized!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
