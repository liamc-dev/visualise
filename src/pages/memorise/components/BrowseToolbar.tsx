import { Panel } from "../../../components/ui/Panel";
import { Btn } from "../../../components/ui/Btn";
import { TextInput } from "../../../components/ui/TextInput";
import { FieldLabel } from "../../../components/ui/FieldLabel";
import FieldSelect from "../../../components/ui/portal-select/FieldSelect";
import type { PortalSelectOption } from "../../../components/ui/portal-select/PortalSelect";
import { SegmentedControl } from "../../../components/ui/SegmentedControl";

export function BrowseToolbar({
    q,
    setQ,
    scope,
    setScope,
    filter,
    setFilter,
    sort,
    setSort,
    summary,
}: {
    q: string;
    setQ: (v: string) => void;
    scope: "deck" | "browse";
    setScope: (v: "deck" | "browse") => void;
    filter: "DUE" | "ALL" | "NEW";
    setFilter: (v: "DUE" | "ALL" | "NEW") => void;
    sort: "DUE" | "NAME" | "STATUS";
    setSort: (v: "DUE" | "NAME" | "STATUS") => void;
    summary: string;
}) {
    const deckOnlyDisabled = scope !== "deck";

    type Filter = "DUE" | "ALL" | "NEW";
    const filterOptions: PortalSelectOption<Filter>[] = [
        { value: "DUE", label: "Due now" },
        { value: "ALL", label: "All" },
        { value: "NEW", label: "New" },
    ];

    return (
        <Panel as="section" tone="glass" className="p-4">
            <div className="grid gap-3 lg:[grid-template-columns:1fr_auto_auto_auto_auto] lg:items-center">
                {/* search */}
                <div className="min-w-0">
                    <FieldLabel>Search</FieldLabel>

                    <div className="relative mt-1">
                        <TextInput
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={scope === "deck" ? "Search your deck…" : "Search catalog…"}
                            className="pr-9"
                        />

                        {q.length > 0 && (
                            <Btn
                                variant="ghost"
                                size="icon"
                                aria-label="Clear search"
                                onClick={() => setQ("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-tn-muted hover:text-tn-text"
                            >
                                ✕
                            </Btn>
                        )}
                    </div>
                </div>

                {/* scope */}
                <div>
                    <FieldLabel>Scope</FieldLabel>
                    <SegmentedControl
                        value={scope}
                        onChange={setScope}
                        options={[
                            { value: "deck", label: "My Deck" },
                            { value: "browse", label: "Browse" },
                        ]}
                    />
                </div>

                {/* filter */}
                <div className={deckOnlyDisabled ? "opacity-40 pointer-events-none" : ""}>
                    <FieldLabel>Filter</FieldLabel>
                    <FieldSelect
                        value={filter}
                        options={filterOptions}
                        onChange={setFilter}
                    />
                </div>

                {/* sort */}
                <div className={deckOnlyDisabled ? "opacity-40 pointer-events-none" : ""}>
                    <FieldLabel>Sort</FieldLabel>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="
              mt-1 h-10 rounded-xl border border-tn-border bg-tn-surfaceSoft/55 px-3
              text-[12px] text-tn-text outline-none
              focus:ring-2 focus:ring-tn-accent/35
            "
                    >
                        <option value="DUE">Due date</option>
                        <option value="NAME">Name</option>
                        <option value="STATUS">Status</option>
                    </select>
                </div>
            </div>

            <div className="mt-3 text-label text-tn-muted">{summary}</div>
        </Panel>
    );
}
