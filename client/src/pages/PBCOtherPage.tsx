import { PBCLayout } from '@/components/PBCLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/pbcMockData';

export default function PBCOtherPage() {
  const handleOtherClick = () => {
    window.open(EXTERNAL_LINKS.sharepointIntakeForm, '_blank', 'noopener,noreferrer');
  };

  return (
    <PBCLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Other" 
          description="Submit additional PBC requests via SharePoint"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">SharePoint PBC Intake Form</h3>
              <p className="text-muted-foreground mb-6">
                Submit other PBC requests that are not covered by the automated control evidence system.
              </p>
              <Button onClick={handleOtherClick} size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open SharePoint Intake Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PBCLayout>
  );
}
