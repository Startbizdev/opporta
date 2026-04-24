"use client";

import { startTransition, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getClientAuthHeader } from "@/lib/auth-header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessagesPageSkeleton } from "@/components/messages/MessagesPageSkeleton";
import { Inbox, MessageSquare, MousePointer2, Send } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Conversation {
  id: string;
  postId: string;
  post: { title: string };
  userA: { username: string };
  userB: { username: string };
  messages: Array<{ content: string; createdAt: Date }>;
  updatedAt: Date;
}

interface Message {
  id: string;
  content: string;
  sender: { username: string; id: string };
  createdAt: Date;
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = searchParams.get("conversation");
    if (!c || conversations.length === 0) return;
    if (!conversations.some((conv) => conv.id === c)) return;
    startTransition(() => setSelectedConversation(c));
  }, [searchParams, conversations]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations", {
          headers: getClientAuthHeader(),
        });
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const conversation = conversations.find(
        (c) => c.id === selectedConversation
      );
      if (!conversation) return;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getClientAuthHeader(),
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage,
          postId: conversation.postId,
        }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        toast.error(
          typeof b.error === "string" ? b.error : "Envoi impossible"
        );
        return;
      }

      setNewMessage("");
      toast.success("Message envoyé");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur réseau");
    }
  };

  if (loading) {
    return <MessagesPageSkeleton />;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-notion border border-border bg-field shadow-sm">
          <EmptyState
            icon={Inbox}
            title="Aucune conversation"
            description="Répondez à une annonce pour démarrer un échange."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-4 ${
                selectedConversation === conv.id
                  ? "ring-2 ring-accent/30 ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              <p className="line-clamp-2 text-sm font-medium text-foreground">
                {conv.post.title}
              </p>
              <p className="mt-1 text-2xs text-text-tertiary">
                {new Date(conv.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex min-h-[420px] flex-col lg:col-span-2">
        {selectedConversation ? (
          <Card className="flex flex-1 flex-col">
            <div className="mb-4 border-b border-border pb-4">
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {
                  conversations.find((c) => c.id === selectedConversation)
                    ?.post.title
                }
              </h3>
            </div>

            <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const myId = localStorage.getItem("userId");
                  const mine = myId ? msg.sender.id === myId : false;
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-notion border px-3 py-2.5 text-sm ${
                        mine
                          ? "ml-auto border-accent/25 bg-accent-muted text-foreground"
                          : "mr-auto border-border bg-field text-foreground"
                      }`}
                    >
                      <p className="mb-1 text-2xs font-medium text-text-tertiary">
                        {msg.sender.username}
                      </p>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  size="compact"
                  icon={MessageSquare}
                  title="Pas encore de messages"
                  description="Soyez le premier à écrire dans cette conversation."
                />
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row"
            >
              <Input
                placeholder="Écrire un message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" className="sm:w-auto">
                <Send className="size-4" strokeWidth={1.75} />
                Envoyer
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={MousePointer2}
              title="Sélectionnez une conversation"
              description="Choisissez un fil dans la liste pour afficher les messages."
            />
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageSkeleton />}>
      <MessagesPageInner />
    </Suspense>
  );
}
