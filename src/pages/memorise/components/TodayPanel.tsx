import { Btn } from "../../../components/ui/Btn";
import { Panel } from "../../../components/ui/Panel";
import { FieldLabel } from "../../../components/ui/FieldLabel";

export function TodayPanel({
    hasDeck,
    dueCount,
    todayKey,
    nextUpLabel,
    nextUpDueText,
    onStart,
}: {
    hasDeck: boolean;
    dueCount: number;
    todayKey: string | null;
    nextUpLabel?: string;
    nextUpDueText?: string;
    onStart: (key: string) => void;
}) {
    return (
        <Panel as="section" tone="glass" className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <FieldLabel>Today</FieldLabel>

                    <h1 className="mt-2 text-xl font-semibold tracking-tight">
                        {hasDeck ? (dueCount > 0 ? "You’re due for recall." : "You’re caught up.") : "Start your deck."}
                    </h1>

                    <p className="mt-1 text-sm text-tn-muted max-w-[70ch]">
                        {hasDeck ? (
                            dueCount > 0 ? (
                                <>
                                    {dueCount} algorithm{dueCount === 1 ? "" : "s"} ready now. Do one focused recall run — short, strict,
                                    and compounding.
                                </>
                            ) : (
                                <>Nothing due right now. Add a new algorithm, or run a practice if you feel like it.</>
                            )
                        ) : (
                            <>Add your first algorithm. After that, your deck schedules recall automatically based on due dates.</>
                        )}
                    </p>
                </div>

                <div className="shrink-0">
                    {hasDeck && todayKey && (
                        <Btn
                            className="h-11 px-4 text-sm font-semibold"
                            onClick={() => onStart(todayKey)}
                        >
                            {dueCount > 0 ? "Start Today’s Recall" : "Start Next Practice"}
                        </Btn>
                    )}
                </div>
            </div>

            {hasDeck && nextUpLabel && nextUpDueText && (
                <div className="mt-4 text-xs text-tn-muted">
                    Next up: <span className="text-tn-text/90">{nextUpLabel}</span> ·{" "}
                    <span className={dueCount > 0 ? "text-tn-warning" : ""}>{nextUpDueText}</span>
                </div>
            )}
        </Panel>
    );
}
