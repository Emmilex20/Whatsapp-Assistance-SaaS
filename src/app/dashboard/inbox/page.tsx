import {
  Bot,
  Clock,
  MapPin,
  MessageSquareText,
  PauseCircle,
  Phone,
  PlayCircle,
  UserRound,
} from "lucide-react";
import type {
  ConversationPriority,
  ConversationWorkflowStatus,
  Prisma,
} from "@/generated/prisma/client";
import { assignConversation } from "@/actions/assignments";
import { enableHumanTakeover, resumeBotAutomation } from "@/actions/inbox";
import { updateConversationInternalNotes } from "@/actions/internal-notes";
import { AISuggestionPanel } from "@/components/inbox/ai-suggestion-panel";
import { ConversationLabelsForm } from "@/components/inbox/conversation-labels-form";
import { ManualReplyForm } from "@/components/inbox/manual-reply-form";
import { VoiceTranscriptionCard } from "@/components/inbox/voice-transcription-card";
import { ConversationStatusForm } from "@/components/inbox/conversation-status-form";
import { EmptyState } from "@/components/shared/empty-state";
import { InternalNotesForm } from "@/components/shared/internal-notes-form";
import { AssignmentSelect } from "@/components/team/assignment-select";
import { Button } from "@/components/ui/button";
import { getRestaurantBilling } from "@/lib/billing";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { priorityStyles } from "@/lib/conversation-labels";
import { workflowStatusStyles } from "@/lib/conversation-status";
import {
  getConversationSlaStatus,
  getSlaBadgeClass,
} from "@/lib/conversation-sla";
import { prisma } from "@/lib/prisma";

type InboxPageProps = {
  searchParams: Promise<{
    conversation?: string;
    assigned?: string;
    priority?: string;
    sla?: string;
    workflow?: string;
  }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = await searchParams;
  const assignedFilter = params.assigned || "all";
  const slaFilter = params.sla || "all";
  const workflowOptions: ("all" | ConversationWorkflowStatus)[] = [
    "all",
    "OPEN",
    "PENDING",
    "RESOLVED",
  ];
  const rawWorkflowFilter = params.workflow || "all";
  const workflowFilter = workflowOptions.includes(
    rawWorkflowFilter as "all" | ConversationWorkflowStatus
  )
    ? rawWorkflowFilter
    : "all";
  const priorityOptions: ("all" | ConversationPriority)[] = [
    "all",
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
  ];
  const rawPriorityFilter = params.priority || "all";
  const priorityFilter = priorityOptions.includes(
    rawPriorityFilter as "all" | ConversationPriority
  )
    ? rawPriorityFilter
    : "all";
  const restaurant = await getOrCreateCurrentRestaurant();
  const subscription = restaurant
    ? await getRestaurantBilling(restaurant.id)
    : null;
  const currentPlan = subscription?.plan || "starter";

  const teamMembers = restaurant
    ? await prisma.teamMember.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const conversationWhere: Prisma.ConversationWhereInput = {
    restaurantId: restaurant?.id || "",
    ...(assignedFilter === "unassigned"
      ? { assignedTeamMemberId: null }
      : assignedFilter !== "all"
        ? { assignedTeamMemberId: assignedFilter }
        : {}),
    ...(priorityFilter !== "all"
      ? { priority: priorityFilter as ConversationPriority }
      : {}),
    ...(workflowFilter !== "all"
      ? { workflowStatus: workflowFilter as ConversationWorkflowStatus }
      : {}),
  };

  const conversations = restaurant
    ? await prisma.conversation.findMany({
        where: conversationWhere,
        orderBy: { updatedAt: "desc" },
        include: {
          assignedTeamMember: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              voiceTranscription: true,
            },
          },
        },
      })
    : [];

  const filteredConversations = conversations.filter((conversation) => {
    if (slaFilter === "all") return true;

    const sla = getConversationSlaStatus({
      messages: conversation.messages,
      plan: currentPlan,
      priority: conversation.priority,
    });

    if (slaFilter === "needs_reply") {
      return sla.status === "WAITING" || sla.status === "OVERDUE";
    }

    if (slaFilter === "overdue") {
      return sla.status === "OVERDUE";
    }

    if (slaFilter === "replied") {
      return sla.status === "REPLIED";
    }

    return true;
  });

  const selectedConversationId =
    params.conversation || filteredConversations[0]?.id || "";

  const selectedConversation =
    selectedConversationId && restaurant
      ? await prisma.conversation.findFirst({
          where: {
            id: selectedConversationId,
            restaurantId: restaurant.id,
          },
          include: {
            assignedTeamMember: true,
            messages: {
              orderBy: { createdAt: "asc" },
              include: {
                voiceTranscription: true,
              },
            },
          },
      })
    : null;

  const isHumanTakeover = selectedConversation?.status === "HUMAN_TAKEOVER";
  const selectedSla = selectedConversation
    ? getConversationSlaStatus({
        messages: selectedConversation.messages,
        plan: currentPlan,
        priority: selectedConversation.priority,
      })
    : null;

  const slaSummary = {
    needsReply: conversations.filter((conversation) => {
      const sla = getConversationSlaStatus({
        messages: conversation.messages,
        plan: currentPlan,
        priority: conversation.priority,
      });
      return sla.status === "WAITING" || sla.status === "OVERDUE";
    }).length,
    overdue: conversations.filter((conversation) => {
      const sla = getConversationSlaStatus({
        messages: conversation.messages,
        plan: currentPlan,
        priority: conversation.priority,
      });
      return sla.status === "OVERDUE";
    }).length,
    replied: conversations.filter((conversation) => {
      const sla = getConversationSlaStatus({
        messages: conversation.messages,
        plan: currentPlan,
        priority: conversation.priority,
      });
      return sla.status === "REPLIED";
    }).length,
  };

  function inboxFilterHref(assigned: string) {
    const nextParams = new URLSearchParams();

    if (assigned !== "all") nextParams.set("assigned", assigned);
    if (priorityFilter !== "all") nextParams.set("priority", priorityFilter);
    if (slaFilter !== "all") nextParams.set("sla", slaFilter);
    if (workflowFilter !== "all") nextParams.set("workflow", workflowFilter);

    const query = nextParams.toString();

    return query ? `/dashboard/inbox?${query}` : "/dashboard/inbox";
  }

  function priorityFilterHref(priority: string) {
    const nextParams = new URLSearchParams();

    if (assignedFilter !== "all") nextParams.set("assigned", assignedFilter);
    if (priority !== "all") nextParams.set("priority", priority);
    if (slaFilter !== "all") nextParams.set("sla", slaFilter);
    if (workflowFilter !== "all") nextParams.set("workflow", workflowFilter);

    const query = nextParams.toString();

    return query ? `/dashboard/inbox?${query}` : "/dashboard/inbox";
  }

  function slaFilterHref(sla: string) {
    const nextParams = new URLSearchParams();

    if (assignedFilter !== "all") nextParams.set("assigned", assignedFilter);
    if (priorityFilter !== "all") nextParams.set("priority", priorityFilter);
    if (sla !== "all") nextParams.set("sla", sla);
    if (workflowFilter !== "all") nextParams.set("workflow", workflowFilter);

    const query = nextParams.toString();

    return query ? `/dashboard/inbox?${query}` : "/dashboard/inbox";
  }

  function workflowFilterHref(workflow: string) {
    const nextParams = new URLSearchParams();

    if (assignedFilter !== "all") nextParams.set("assigned", assignedFilter);
    if (priorityFilter !== "all") nextParams.set("priority", priorityFilter);
    if (slaFilter !== "all") nextParams.set("sla", slaFilter);
    if (workflow !== "all") nextParams.set("workflow", workflow);

    const query = nextParams.toString();

    return query ? `/dashboard/inbox?${query}` : "/dashboard/inbox";
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Customer inbox</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            WhatsApp conversations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Monitor customer messages, see assistant replies, and take over manually when needed.
          </p>
        </div>

        {selectedConversation && (
          <form action={isHumanTakeover ? resumeBotAutomation : enableHumanTakeover}>
            <input
              type="hidden"
              name="conversationId"
              value={selectedConversation.id}
            />

            <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
              {isHumanTakeover ? (
                <>
                  <PlayCircle className="mr-2" size={16} />
                  Resume bot
                </>
              ) : (
                <>
                  <PauseCircle className="mr-2" size={16} />
                  Take over chat
                </>
              )}
            </Button>
          </form>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Needs reply",
            value: slaSummary.needsReply,
          },
          {
            label: "Overdue",
            value: slaSummary.overdue,
          },
          {
            label: "Replied",
            value: slaSummary.replied,
          },
          {
            label: "Plan SLA",
            value:
              currentPlan === "premium"
                ? "5m base"
                : currentPlan === "growth"
                  ? "15m base"
                  : "30m base",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="action-row">
          <a
            href={inboxFilterHref("all")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              assignedFilter === "all"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            All chats
          </a>

          <a
            href={inboxFilterHref("unassigned")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              assignedFilter === "unassigned"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Unassigned
          </a>

          {teamMembers.map((member) => (
            <a
              key={member.id}
              href={inboxFilterHref(member.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                assignedFilter === member.id
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {member.name || member.email}
            </a>
          ))}
        </div>

        <div className="action-row mt-3">
          {priorityOptions.map((priority) => (
            <a
              key={priority}
              href={priorityFilterHref(priority)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                priorityFilter === priority
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {priority === "all" ? "All priorities" : priority.toLowerCase()}
            </a>
          ))}
        </div>

        <div className="action-row mt-3">
          {[
            { label: "All SLA", value: "all" },
            { label: "Needs reply", value: "needs_reply" },
            { label: "Overdue", value: "overdue" },
            { label: "Replied", value: "replied" },
          ].map((item) => (
            <a
              key={item.value}
              href={slaFilterHref(item.value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                slaFilter === item.value
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="action-row mt-3">
          {workflowOptions.map((status) => (
            <a
              key={status}
              href={workflowFilterHref(status)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                workflowFilter === status
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {status === "all" ? "All statuses" : status.toLowerCase()}
            </a>
          ))}
        </div>
      </section>

      {filteredConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No conversations found"
          description="No conversations match these filters. Incoming WhatsApp messages will appear here once your webhook is connected."
          actionLabel="Open WhatsApp settings"
          actionHref="/dashboard/settings/whatsapp"
        />
      ) : (
        <section className="grid min-h-170 gap-4 xl:grid-cols-[0.75fr_1.35fr_0.75fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/3 p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Customers</h2>
              <p className="text-sm text-zinc-500">Recent WhatsApp chats</p>
            </div>

            <div className="space-y-3">
              {filteredConversations.map((conversation) => {
                const active = conversation.id === selectedConversation?.id;
                const lastMessage = conversation.messages.at(-1)?.content;
                const needsHuman = conversation.status === "HUMAN_TAKEOVER";
                const sla = getConversationSlaStatus({
                  messages: conversation.messages,
                  plan: currentPlan,
                  priority: conversation.priority,
                });

                return (
                  <a
                    key={conversation.id}
                    href={`/dashboard/inbox?conversation=${conversation.id}`}
                    className={`block rounded-2xl border p-4 transition ${
                      active
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : "border-white/10 bg-zinc-900/70 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                          <UserRound size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {conversation.customerName ||
                              conversation.customerPhone}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {conversation.customerPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-1 text-sm text-zinc-400">
                      {lastMessage || "No message preview"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          needsHuman
                            ? "bg-blue-400/10 text-blue-300"
                            : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {needsHuman ? "Human takeover" : "Bot active"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          priorityStyles[conversation.priority]
                        }`}
                      >
                        {conversation.priority}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${getSlaBadgeClass(
                          sla.status
                        )}`}
                      >
                        {sla.label}
                        {sla.minutesWaiting > 0
                          ? ` · ${sla.minutesWaiting}m`
                          : ""}
                        {` / target ${sla.targetMinutes}m`}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          workflowStatusStyles[conversation.workflowStatus]
                        }`}
                      >
                        {conversation.workflowStatus}
                      </span>
                    </div>

                    {conversation.resolvedAt && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Resolved {conversation.resolvedAt.toLocaleDateString()}
                      </p>
                    )}

                    {conversation.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {conversation.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {conversation.assignedTeamMember && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Assigned to{" "}
                        {conversation.assignedTeamMember.name ||
                          conversation.assignedTeamMember.email}
                      </p>
                    )}

                    {conversation.internalNotes && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                        Note: {conversation.internalNotes}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>
          </aside>

          <main className="flex rounded-3xl border border-white/10 bg-white/3">
            <div className="flex min-h-full w-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {selectedConversation?.customerName ||
                        selectedConversation?.customerPhone}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {selectedConversation?.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      isHumanTakeover
                        ? "bg-blue-400/10 text-blue-300"
                        : "bg-emerald-400/10 text-emerald-300"
                    }`}
                  >
                    {isHumanTakeover ? "Human takeover" : "Bot active"}
                  </span>

                  {selectedConversation && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        priorityStyles[selectedConversation.priority]
                      }`}
                    >
                      {selectedConversation.priority}
                    </span>
                  )}

                  {selectedSla && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${getSlaBadgeClass(
                        selectedSla.status
                      )}`}
                    >
                      {selectedSla.label}
                      {selectedSla.minutesWaiting > 0
                        ? ` · ${selectedSla.minutesWaiting}m`
                        : ""}
                      {` / target ${selectedSla.targetMinutes}m`}
                    </span>
                  )}

                  {selectedConversation && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        workflowStatusStyles[
                          selectedConversation.workflowStatus
                        ]
                      }`}
                    >
                      {selectedConversation.workflowStatus}
                    </span>
                  )}

                  <form
                    action={assignConversation}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="conversationId"
                      value={selectedConversation?.id || ""}
                    />

                    <AssignmentSelect
                      name="teamMemberId"
                      defaultValue={selectedConversation?.assignedTeamMemberId}
                      teamMembers={teamMembers}
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                    >
                      Assign
                    </Button>
                  </form>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="mx-auto w-fit rounded-full bg-white/4 px-3 py-1 text-xs text-zinc-500">
                  Conversation
                </div>

                {selectedConversation?.messages.map((chat) => {
                  const isCustomer = chat.senderType === "CUSTOMER";
                  const isBot = chat.senderType === "BOT";

                  return (
                    <div
                      key={chat.id}
                      className={`flex ${
                        isCustomer ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isCustomer
                            ? "bg-zinc-800 text-zinc-200"
                            : isBot
                              ? "bg-emerald-500 text-white"
                              : "bg-blue-500 text-white"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          {isCustomer ? (
                            <UserRound size={14} />
                          ) : isBot ? (
                            <Bot size={14} />
                          ) : (
                            <UserRound size={14} />
                          )}

                          <span className="text-[11px] opacity-80">
                            {isCustomer
                              ? selectedConversation.customerName || "Customer"
                              : isBot
                                ? "Assistant"
                                : "Human"}
                          </span>
                        </div>

                        <p>{chat.content}</p>

                        {chat.voiceTranscription && (
                          <VoiceTranscriptionCard
                            transcription={{
                              id: chat.voiceTranscription.id,
                              transcript: chat.voiceTranscription.transcript,
                              correctedText:
                                chat.voiceTranscription.correctedText,
                              confidence:
                                chat.voiceTranscription.confidence,
                              status: chat.voiceTranscription.status,
                              mimeType: chat.voiceTranscription.mimeType,
                              audioSize: chat.voiceTranscription.audioSize,
                              audioAvailable: Boolean(
                                chat.voiceTranscription.audioData
                              ),
                            }}
                          />
                        )}

                        <p className="mt-1 text-right text-[11px] opacity-70">
                          {chat.createdAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 p-4">
                <div
                  className={`mb-3 rounded-2xl border p-3 ${
                    isHumanTakeover
                      ? "border-blue-400/20 bg-blue-400/10"
                      : "border-yellow-400/20 bg-yellow-400/10"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isHumanTakeover ? "text-blue-100" : "text-yellow-100"
                    }`}
                  >
                    {isHumanTakeover
                      ? "Human takeover is active. Manual replies can now be sent."
                      : "Bot is active. Take over this chat before sending manual replies."}
                  </p>
                </div>

                {selectedConversation && (
                  <ManualReplyForm
                    conversationId={selectedConversation.id}
                    disabled={!isHumanTakeover}
                  />
                )}
              </div>
            </div>
          </main>

          <aside className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <h2 className="text-base font-semibold text-white">
              Customer details
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Useful information for manual replies.
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  icon: UserRound,
                  label: "Name",
                  value:
                    selectedConversation?.customerName || "Unknown customer",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: selectedConversation?.customerPhone || "No phone",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Not collected yet",
                },
                {
                  icon: Clock,
                  label: "Status",
                  value: isHumanTakeover ? "Human takeover" : "Bot active",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-emerald-400" />
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
              <div className="flex items-center gap-3">
                <MessageSquareText size={16} className="text-emerald-400" />
                <p className="text-sm font-medium text-white">
                  Conversation summary
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Summary AI is not connected yet. For now, use this panel to quickly inspect customer details.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <h3 className="text-sm font-semibold text-white">
                Order collection
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                If a customer says &quot;I want...&quot; or &quot;order...&quot;, ServeFlow can create a draft order from the conversation.
              </p>
            </div>

            <div className="mt-5 rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
              <h2 className="text-base font-semibold text-white">SLA rules</h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Current plan: {currentPlan}. Base SLA is{" "}
                {currentPlan === "premium"
                  ? "5 minutes"
                  : currentPlan === "growth"
                    ? "15 minutes"
                    : "30 minutes"}
                . High and urgent chats become overdue faster.
              </p>
            </div>

            <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
              <h2 className="text-base font-semibold text-white">
                AI auto-reply safety
              </h2>
              <p className="mt-2 text-sm leading-6 text-yellow-100">
                AI auto-reply will not run during human takeover. Messages
                about refunds, complaints, wrong orders, sickness, fraud, or
                cancellation are blocked and should be handled manually.
              </p>
            </div>

            {selectedConversation && (
              <>
                <div className="mt-5">
                  <ConversationStatusForm
                    conversationId={selectedConversation.id}
                    workflowStatus={selectedConversation.workflowStatus}
                  />
                </div>

                <div className="mt-5">
                  <ConversationLabelsForm
                    conversationId={selectedConversation.id}
                    priority={selectedConversation.priority}
                    tags={selectedConversation.tags}
                  />
                </div>

                <div className="mt-5">
                  <AISuggestionPanel conversationId={selectedConversation.id} />
                </div>

                <div className="mt-5">
                  <InternalNotesForm
                    action={updateConversationInternalNotes}
                    hiddenFieldName="conversationId"
                    hiddenFieldValue={selectedConversation.id}
                    defaultValue={selectedConversation.internalNotes}
                    title="Internal conversation notes"
                    description="Private notes visible only to staff and agents."
                  />
                </div>
              </>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
