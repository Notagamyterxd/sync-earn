import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCpxWall } from "@/lib/cpx.functions";

export const Route = createFileRoute("/_authenticated/surveys")({
  head: () => ({
    meta: [
      { title: "Paid Surveys — SyncEarn" },
      { name: "description", content: "Complete CPX Research surveys and earn Robux instantly on SyncEarn." },
      { property: "og:title", content: "Paid Surveys — SyncEarn" },
      { property: "og:description", content: "Complete CPX Research surveys and earn Robux instantly on SyncEarn." },
    ],
  }),
  component: PaidSurveysPage,
});

function PaidSurveysPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cpx-wall"],
    queryFn: () => getCpxWall(),
    staleTime: 60_000,
  });
  const cpxUrl = data?.url ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="size-6 text-primary" />
          Paid Surveys
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete market research surveys — Robux is credited to your account automatically.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        <AlertCircle className="size-5 shrink-0" />
        <p>
          <span className="font-semibold">Heads up:</span> turn off any ad blocker and avoid VPNs,
          or CPX may reverse your rewards.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60">
          <div>
            <CardTitle className="text-lg text-primary">CPX Research</CardTitle>
            <p className="text-xs text-muted-foreground">
              Surveys usually take 2–20 minutes and pay out instantly on completion.
            </p>
          </div>
          {cpxUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={cpxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open in new tab <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[620px] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : cpxUrl ? (
            <iframe
              src={cpxUrl}
              title="CPX Research survey wall"
              className="min-h-[620px] w-full border-0 bg-background"
              allow="geolocation"
            />
          ) : (
            <div className="flex min-h-[620px] items-center justify-center text-sm text-muted-foreground">
              Survey wall is unavailable right now — please try again shortly.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
