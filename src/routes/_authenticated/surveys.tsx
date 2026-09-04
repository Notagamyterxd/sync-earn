import { createFileRoute } from "@tanstack/react-router";
import { getCpxWall } from "@/lib/cpx.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/surveys")({
  component: PaidSurveysComponent,
});

function PaidSurveysComponent() {
  const fallbackUserId = "sync_user_production";
  const cpxUrl = getCpxWall(fallbackUserId);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="bg-[#1a2e1a] border border-[#2e5c2e] text-[#a3e6a3] px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
        <AlertCircle className="h-5 w-5 text-[#4ade80] shrink-0" />
        <p><span className="font-bold">⚠️ Notice:</span> Ensure your AdBlocker is completely turned off to process rewards.</p>
      </div>

      <Card className="border-[#2e5c2e] bg-[#0c140c] text-white overflow-hidden shadow-xl">
        <CardHeader className="bg-[#142414] border-b border-[#2e5c2e] flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle className="text-xl font-bold text-[#4ade80]">Earn Robux via Surveys</CardTitle>
          </div>
          {cpxUrl && (
            <Button asChild variant="outline" className="border-[#2e5c2e] text-[#4ade80]">
              <a href={cpxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open in new tab <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 min-h-[750px] bg-[#080d08]">
          {cpxUrl && (
            <iframe src={cpxUrl} title="CPX Survey Wall" className="w-full min-h-[750px] border-0" allow="geolocation" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
