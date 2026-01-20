import { PBCLayout } from '@/components/PBCLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/pbcMockData';

export default function PBCDocumentationPage() {
  const handleDocumentationClick = () => {
    window.open(EXTERNAL_LINKS.documentCentral, '_blank', 'noopener,noreferrer');
  };

  return (
    <PBCLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Documentation" 
          description="Access reference materials and documentation"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">EO+T Document Central</h3>
              <p className="text-muted-foreground mb-6">
                Access documentation and reference materials for PBC controls and evidence requirements.
              </p>
              <Button onClick={handleDocumentationClick} size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Document Central
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PBCLayout>
  );
}
