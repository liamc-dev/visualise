// src/pages/memorise/MemoriseHomePage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlgorithmCatalog } from "../../api/queries/catalog-queries";
import { useAddToDeck, useMyDeck, useRemoveFromDeck } from "../../api/queries/memorise-queries";
import type { AlgorithmDto } from "../../services/dto/algorithm-dto";

import { TodayPanel } from "./components/TodayPanel";
import { BrowseToolbar } from "./components/BrowseToolbar";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { Panel } from "../../components/ui/Panel";
import { Btn } from "../../components/ui/Btn";
import { FieldLabel } from "../../components/ui/FieldLabel";

type CardStatus = "NEW" | "LEARNING" | "REVIEW";

type Group = {
  id: string;
  name: string;
  items: AlgorithmDto[];
};

type DeckItem = {
  algorithmKey: string;
  status: CardStatus;
  dueAt: string;
  name?: string;
};

function fmtDue(dueAtIso: string) {
  const due = new Date(dueAtIso);
  const now = new Date();

  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dd = startOf(due) - startOf(now);
  const dayMs = 24 * 60 * 60 * 1000;

  if (dd === 0) return "Due today";
  if (dd === dayMs) return "Due tomorrow";
  if (dd < 0) return "Overdue";
  return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function isDue(dueAtIso: string) {
  return new Date(dueAtIso).getTime() <= Date.now();
}

export default function MemoriseHomePage() {
  const navigate = useNavigate();

  const { data: algorithms = [], isLoading, isError, error, refetch } = useAlgorithmCatalog();
  const { data: deckRaw = [], isLoading: deckLoading } = useMyDeck();

  const deck = deckRaw as unknown as DeckItem[];

  const addToDeck = useAddToDeck();
  const removeFromDeck = useRemoveFromDeck();

  const [mutatingKey, setMutatingKey] = useState<string | null>(null);

  // ---- toolbar state ----
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"deck" | "browse">("deck");
  const [filter, setFilter] = useState<"DUE" | "ALL" | "NEW">("DUE");
  const [sort, setSort] = useState<"DUE" | "NAME" | "STATUS">("DUE");

  // ---- derived maps ----
  const deckMap = useMemo(() => {
    const m = new Map<string, { status: CardStatus; dueAt: string; name?: string }>();
    for (const d of deck) m.set(d.algorithmKey, { status: d.status, dueAt: d.dueAt, name: d.name });
    return m;
  }, [deck]);

  const hasDeck = !deckLoading && deck.length > 0;

  const dueDeck = useMemo(() => {
    return deck
      .slice()
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .filter((d) => isDue(d.dueAt));
  }, [deck]);

  const nextUp = useMemo(() => {
    return (
      deck
        .slice()
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0] ?? null
    );
  }, [deck]);

  // ---- group catalog by category (many-to-many) ----
  const groups: Group[] = useMemo(() => {
    const byCat = new Map<string, Group>();

    for (const a of algorithms) {
      const cats = a.categories ?? [];

      if (cats.length === 0) {
        const uncId = "__uncategorised__";
        const g = byCat.get(uncId) ?? { id: uncId, name: "Uncategorised", items: [] };
        g.items.push(a);
        byCat.set(uncId, g);
        continue;
      }

      for (const c of cats) {
        const catId = (c as any).id ?? (c as any).key ?? (c as any).name;
        const catName = (c as any).name ?? (c as any).key ?? "Category";
        if (!catId) continue;

        const key = String(catId);
        const g = byCat.get(key) ?? { id: key, name: String(catName), items: [] };
        g.items.push(a);
        byCat.set(key, g);
      }
    }

    const arr = Array.from(byCat.values()).map((g) => ({
      ...g,
      items: g.items.slice().sort((x, y) => x.name.localeCompare(y.name)),
    }));

    arr.sort((a, b) => {
      if (a.id === "__uncategorised__") return 1;
      if (b.id === "__uncategorised__") return -1;
      return a.name.localeCompare(b.name);
    });

    return arr;
  }, [algorithms]);

  // ---- toolbar filtering (deck) ----
  const filteredDeck = useMemo(() => {
    const nq = norm(q);

    let items = deck.slice();

    if (filter === "DUE") items = items.filter((d) => isDue(d.dueAt));
    if (filter === "NEW") items = items.filter((d) => d.status === "NEW");

    if (nq) {
      items = items.filter((d) => {
        const name = d.name ?? d.algorithmKey;
        return norm(name).includes(nq) || norm(d.algorithmKey).includes(nq);
      });
    }

    const statusRank: Record<CardStatus, number> = { NEW: 0, LEARNING: 1, REVIEW: 2 };

    if (sort === "DUE") {
      items.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    } else if (sort === "NAME") {
      items.sort((a, b) => (a.name ?? a.algorithmKey).localeCompare(b.name ?? b.algorithmKey));
    } else {
      items.sort((a, b) => statusRank[a.status] - statusRank[b.status]);
    }

    return items;
  }, [deck, q, filter, sort]);

  // ---- toolbar filtering (browse) ----
  const filteredGroups = useMemo(() => {
    const nq = norm(q);
    if (!nq) return groups;

    const out: Group[] = [];
    for (const g of groups) {
      const items = g.items.filter((a) => norm(a.name).includes(nq) || norm(a.key).includes(nq));
      if (items.length) out.push({ ...g, items });
    }
    return out;
  }, [groups, q]);

  // ---- actions ----
  function startKey(key: string) {
    navigate(`/memorise/prime/${key}`);
  }

  function handleAdd(key: string) {
    if (mutatingKey) return;
    setMutatingKey(key);
    addToDeck.mutate(key, { onSettled: () => setMutatingKey(null) });
  }

  function handleRemove(key: string) {
    if (mutatingKey) return;
    setMutatingKey(key);
    removeFromDeck.mutate(key, { onSettled: () => setMutatingKey(null) });
  }

  // ---- states ----
  if (isLoading) return <div className="p-4 text-tn-text">Loading…</div>;

  if (isError) {
    return (
      <div>
        <h1 className="mt-2 text-xl font-semibold">Can’t load algorithms</h1>
        <p className="mt-2 text-sm text-tn-muted max-w-[70ch]">
          {(error as any)?.message || "Something went wrong while loading the catalog."}
        </p>

        <div className="mt-4 flex gap-2">
          <Btn onClick={() => refetch()}>Retry</Btn>
          <Btn onClick={() => navigate(-1)} className="bg-transparent">
            Go back
          </Btn>
        </div>
      </div>
    );
  }

  const dueCount = dueDeck.length;
  const todayKey = (dueDeck[0] ?? nextUp)?.algorithmKey ?? null;

  const toolbarSummary =
    scope === "deck"
      ? `Showing ${filteredDeck.length} item${filteredDeck.length === 1 ? "" : "s"} in your deck.`
      : `Searching catalog across ${filteredGroups.length} categor${filteredGroups.length === 1 ? "y" : "ies"}.`;

  return (
    <div className="space-y-4">
      <div className="tn-focus-surface">
        <TodayPanel
          hasDeck={hasDeck}
          dueCount={dueCount}
          todayKey={todayKey}
          nextUpLabel={nextUp ? nextUp.name ?? nextUp.algorithmKey : undefined}
          nextUpDueText={nextUp ? fmtDue(nextUp.dueAt) : undefined}
          onStart={startKey}
        />
      </div>

      <BrowseToolbar
        q={q}
        setQ={setQ}
        scope={scope}
        setScope={setScope}
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        summary={toolbarSummary}
      />

      {/* MY DECK */}
      <section style={{ display: scope === "deck" ? "block" : "none" }}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel>My Deck</FieldLabel>
          <div className="text-label text-tn-muted">
            {deckLoading ? "Loading…" : `${deck.length} item${deck.length === 1 ? "" : "s"}`}
          </div>
        </div>

        {!hasDeck ? (
          <Panel as="div" tone="glass" className="mt-3 p-4">
            <div className="text-sm font-medium">No algorithms yet</div>
            <div className="mt-1 text-xs text-tn-muted">
              Add 1–3 algorithms to begin. Keep your deck small so recall stays consistent.
            </div>
          </Panel>
        ) : filteredDeck.length === 0 ? (
          <Panel as="div" tone="glass" className="mt-3 p-4">
            <div className="text-sm font-medium">No matches</div>
            <div className="mt-1 text-xs text-tn-muted">Try a different search or switch the filter to “All”.</div>
          </Panel>
        ) : (
          <div className="mt-3 space-y-2">
            {filteredDeck.map((d) => {
              const rowPending =
                mutatingKey === d.algorithmKey && (addToDeck.isPending || removeFromDeck.isPending);

              return (
                <Panel
                  key={d.algorithmKey}
                  tone="soft"
                  className="group px-3 py-2 hover:bg-tn-surfaceSoft/60 hover:border-tn-border/90 transition"
                >
                  <div
                    className="
                      grid items-center gap-3
                      [grid-template-columns:1fr_auto]
                      sm:[grid-template-columns:1fr_auto_auto_auto]
                    "
                  >
                    <div className="min-w-0">
                      <div className="text-ui font-semibold truncate">{d.name ?? d.algorithmKey}</div>
                      <div className="mt-0.5 text-label text-tn-muted">{fmtDue(d.dueAt)}</div>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={d.status} />
                    </div>

                    <Btn
                      onClick={() => startKey(d.algorithmKey)}
                      disabled={rowPending}
                      variant="soft"
                      title={d.status === "NEW" ? "Prime (first run)" : "Start recall"}
                    >
                      {rowPending ? "…" : d.status === "NEW" ? "Prime" : "Start"}
                    </Btn>

                    <Btn
                      onClick={() => handleRemove(d.algorithmKey)}
                      disabled={rowPending}
                      variant="dangerGhost"
                      title="Remove from deck"
                    >
                      Remove
                    </Btn>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </section>

      {/* BROWSE */}
      <section id="browse" style={{ display: scope === "browse" ? "block" : "none" }}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel>Browse Algorithms</FieldLabel>
          <div className="text-label text-tn-muted">Add to deck</div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {filteredGroups.map((g) => (
            <Panel key={g.id} tone="glass" className="p-4">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-label text-tn-muted">
                  {g.items.length} item{g.items.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {g.items.map((a) => {
                  const inDeck = deckMap.has(a.key);
                  const rowPending =
                    mutatingKey === a.key && (addToDeck.isPending || removeFromDeck.isPending);

                  return (
                    <Panel
                      key={a.id}
                      tone="soft"
                      className="px-3 py-2 hover:bg-tn-surfaceSoft/55 hover:border-tn-border/90 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-ui font-semibold truncate">{a.name}</div>
                          <div className="text-label text-tn-muted truncate">
                            {inDeck ? "In deck" : "Add to schedule recall"}
                          </div>
                        </div>

                        {!inDeck ? (
                          <Btn
                            onClick={() => handleAdd(a.key)}
                            disabled={rowPending}
                            className="bg-tn-surface/60 hover:bg-tn-surfaceSoft/80"
                          >
                            {rowPending ? "…" : "Add"}
                          </Btn>
                        ) : (
                          <div className="text-label text-tn-success/90">✓</div>
                        )}
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </Panel>
          ))}

          {algorithms.length === 0 && (
            <div className="text-xs text-tn-muted p-2">No algorithms available in this build.</div>
          )}

          {algorithms.length > 0 && filteredGroups.length === 0 && (
            <div className="text-xs text-tn-muted p-2">No matching algorithms for “{q}”.</div>
          )}
        </div>
      </section>
    </div>
  );
}
