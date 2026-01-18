import { useParams, Navigate } from "react-router-dom";
import Visualiser from "../components/visualizers/Visualiser";
import AlgoInfoPanel from "../components/AlgoInfoPanel";
import { ALGORITHMS, type Algorithm } from "../algorithms/registry";
import { useThemeStore } from "../stores/useThemeStore";

export default function VisualiserPage() {
  const { algorithm } = useParams<{ algorithm: string }>();
  const theme = useThemeStore((s) => s.theme);

  if (!algorithm || !(algorithm in ALGORITHMS)) {
    return <Navigate to="/visualiser/merge-sort" replace />;
  }

  const algoKey = algorithm as Algorithm;
  const def = ALGORITHMS[algoKey];

  const logoSrc =
    def.logos?.[theme] ??
    def.logos?.dark ??
    def.logos?.light;

  return (
    <div className="px-0 py-0 text-tn-text">
      <div className="
  grid
  gap-y-8
  gap-x-14
  2xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]
  items-start
">
        <Visualiser algorithm={algoKey} />

        <AlgoInfoPanel
          logoSrc={logoSrc}
          logoAlt={`${def.label} Artwork`}
          title={def.label}
          description={
            def.description ?? (
              <>
                No description yet for <strong>{def.label}</strong>.
              </>
            )
          }
          bullets={def.bullets}
        />
      </div>
    </div>
  );
}
