import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyActivity, submitVideo } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({
    meta: [
      { title: "Creator Center — SyncEarn" },
      { name: "description", content: "Submit your video links and earn Robux for every 100 approved views." },
      { property: "og:title", content: "Creator Center — SyncEarn" },
      { property: "og:description", content: "Submit your video links and earn Robux for every 100 approved views." },
    ],
  }),
  component: VideosPage,
});

const TONE = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
} as const;

function VideosPage() {
  const qc = useQueryClient();
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: () => getMyActivity() });
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("youtube");

  const submit = useMutation({
    mutationFn: () => submitVideo({ data: { title, url, platform } }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(res.message);
        setTitle("");
        setUrl("");
        qc.invalidateQueries({ queryKey: ["activity"] });
      } else toast.error(res.message);
    },
    onError: () => toast.error("Could not submit that video."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creator Center</h1>
        <p className="text-sm text-muted-foreground">
          Link a video that features SyncEarn. Once an admin approves it you earn Robux per 100
          views.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glow-card space-y-4 rounded-xl p-5">
          <h2 className="text-lg font-semibold">Submit a video</h2>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">Video link</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={() => submit.mutate()} disabled={submit.isPending}>
            Submit for review
          </Button>
        </div>

        <div className="glow-card rounded-xl p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Your submissions</h2>
          <div className="mt-3 divide-y divide-border/60">
            {(activity?.videos ?? []).map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.title}</p>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate text-xs text-primary hover:underline"
                  >
                    {v.url}
                  </a>
                  {v.admin_note && (
                    <p className="mt-1 text-xs text-muted-foreground">Note: {v.admin_note}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant={TONE[v.status]}>{v.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{v.views} views</p>
                </div>
              </div>
            ))}
            {!activity?.videos.length && (
              <p className="py-6 text-sm text-muted-foreground">No videos submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
