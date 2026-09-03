import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Global Chat — SyncEarn" },
      { name: "description", content: "Chat live with other SyncEarn earners." },
      { property: "og:title", content: "Global Chat — SyncEarn" },
      { property: "og:description", content: "Chat live with other SyncEarn earners." },
    ],
  }),
  component: ChatPage,
});

type Message = {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
};

function ChatPage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data: rows }) => {
        if (!cancelled) setMessages((rows ?? []) as Message[]);
      });

    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => setMessages((prev) => [...prev, payload.new as Message].slice(-200)),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    const profile = data?.profile;
    if (!body || !profile) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({
      user_id: profile.id,
      username: profile.username,
      content: body.slice(0, 300),
    });
    if (error) toast.error("Message failed to send.");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Global Chat</h1>
        <p className="text-sm text-muted-foreground">Be nice — admins moderate this room.</p>
      </div>

      <div className="glow-card flex h-[65vh] flex-col rounded-xl">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span
                className={
                  m.user_id === data?.profile?.id
                    ? "font-semibold text-primary"
                    : "font-semibold text-accent"
                }
              >
                {m.username}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(m.created_at).toLocaleTimeString()}
              </span>
              <p className="text-foreground/90">{m.content}</p>
            </div>
          ))}
          {!messages.length && (
            <p className="text-sm text-muted-foreground">No messages yet — say hello!</p>
          )}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={300}
          />
          <Button type="submit" size="icon" aria-label="Send">
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
