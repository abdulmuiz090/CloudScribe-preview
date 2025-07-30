
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EnhancedCreateTemplateDialog } from "@/components/templates/EnhancedCreateTemplateDialog";

const OwnerTemplatesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Templates Management</h2>
            <p className="text-muted-foreground">
              Create and manage templates for users
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create New Template
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
            <CardDescription>
              Manage all templates on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Template management content will be displayed here.</p>
          </CardContent>
        </Card>
      </div>

      <EnhancedCreateTemplateDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          // TODO: Refresh templates list
        }}
      />
    </DashboardLayout>
  );
};

export default OwnerTemplatesPage;
