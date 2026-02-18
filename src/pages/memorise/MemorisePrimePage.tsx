// src/pages/memorise/MemorisePrimePage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";
import { Btn } from "../../components/ui/Btn";
import { FieldLabel } from "../../components/ui/FieldLabel";
import { useAlgorithmCatalog } from "../../api/queries/catalog-queries";

export default function MemorisePrimePage() {
  const { algorithm } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const { data: algorithms = [], isLoading, isError } = useAlgorithmCatalog();

  const algoKey = algorithm ?? "";
  const algorithmDto = algorithms.find((a) => a.key === algoKey);
  const title = algorithmDto?.name ?? (algoKey ? algoKey : "Algorithm");

  const canStart = Boolean(algoKey) && Boolean(algorithmDto);

  function goBack() {
    navigate(-1);
  }

  function beginPrime() {
    if (!algoKey) return;
    navigate(`/memorise/session/${encodeURIComponent(algoKey)}?prime=1`);
  }

  if (isLoading) {
    return <div className="p-4 text-tn-text">Loading…</div>;
  }

  if (isError || !algoKey) {
    return (
      <div className="space-y-4">
        <div>
          <FieldLabel>Prime</FieldLabel>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Algorithm not found</h1>
          <p className="mt-1 text-sm text-tn-muted max-w-[70ch]">
            This algorithm key doesn’t exist in the catalog.
          </p>
        </div>

        <Btn onClick={goBack} className="px-3 py-2 bg-transparent">
          Back
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Prime</FieldLabel>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-tn-muted max-w-[70ch]">
          You’ve studied this algorithm.
          Prime is your first recall attempt.

          Try to write it from memory once before seeing the reference again.
        </p>
      </div>

      <Panel as="section" tone="glass" className="p-4">
        <div className="text-sm font-semibold">Rules (Prime)</div>
        <ul className="mt-2 space-y-2 text-sm text-tn-muted list-disc list-inside">
          <li>
            Try a full recall attempt first.{" "}
            <span className="text-tn-text/90 font-medium">No visualiser until you try.</span>
          </li>
          <li>
            If you need help, request{" "}
            <span className="text-tn-text/90 font-medium">minimal hints</span> (progressive).
          </li>
          <li>
            Compare only when earned — then do a{" "}
            <span className="text-tn-text/90 font-medium">repair rewrite</span>.
          </li>
          <li>Keep it strict. Short sessions compound.</li>
        </ul>
      </Panel>

      <Panel as="section" tone="soft" className="p-4">
        <div className="text-sm font-semibold">What happens after</div>
        <p className="mt-2 text-sm text-tn-muted max-w-[70ch]">
          Once you complete Prime, this card moves into your schedule. Future runs show up as “Due now”
          based on your review timing.
        </p>
      </Panel>

      <div className="flex items-center gap-2">
        <Btn onClick={goBack} className="px-3 py-2 bg-transparent">
          Back
        </Btn>
        <Btn onClick={beginPrime} disabled={!canStart} className="px-3 py-2">
          Start First Recall
        </Btn>
      </div>

      {!algorithmDto && (
        <div className="text-xs text-tn-warning">
          Note: this key isn’t in the catalog right now, so Prime is disabled.
        </div>
      )}
    </div>
  );
}
