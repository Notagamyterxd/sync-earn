import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth"; // Adjust this import path if your auth hook is located elsewhere
import { getCpxWall } from "@/lib/cpx.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/surveys")({
  component: PaidSurveysComponent,
});

function PaidSurveysComponent() {
  const { user } = useAuth();
  
  // Fetch the hardcoded CPX link securely matching the user's ID
  const cpxUrl = user?.id ? getCpxWall(user.id) : "";

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Green Notice Banner */}
      <div className="bg-[#1a2e1a] border border-[#2e5c2e] text-[#a3e6a3] px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
        <AlertCircle className="h-5 w-5 text-[#4ade80] shrink-0" />
        <p>
          <span className="font-bold">⚠️ Notice:</span> Ensure your AdBlocker or Brave Shields are completely turned off before earning. Active blockers will result in an automatic withdrawal freeze by the administrator.
        </p>
      </div>

      {/* Main Container */}
      <Card className="border-[#2e5c2e] bg-[#0c140c] text-white overflow-hidden shadow-xl">
        <CardHeader className="bg-[#142414] border-b border-[#2e5c2e] flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle className="text-xl font-bold text-[#4ade80]">Earn Robux via Surveys</CardTitle>
            <CardDescription className="text-gray-400 mt-1">Complete premium market research surveys to fund your account instantly.</CardDescription>
          </div>
          {cpxUrl && (
            <Button 
              asChild 
              variant="outline" 
              className="border-[#2e5c2e] text-[#4ade80] hover:bg-[#1a2e1a] hover:text-white"
            >
              <a href={cpxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open in new tab <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 min-h-[750px] relative bg-[#080d08]">
          {cpxUrl ? (
            <iframe
              src={cpxUrl}
              title="CPX Research Survey Wall"
              className="w-full min-h-[750px] border-0"
              allow="geolocation"
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-400">
              Loading user account details...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
