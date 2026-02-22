// src/pages/AboutPage.tsx
import { Panel } from "../components/ui/Panel";
import { AsciiText } from "../components/ui/AsciiText";
import {
  ASCII_ALGORITHM_VISUALISER,
  ASCII_ALGORITHMS,
  ASCII_LANGUAGES,
  ASCII_CUSTOMISE,
} from "../ascii-art";

const S = ({ children }: { children: React.ReactNode }) => (
  <span className="text-tn-text font-[var(--st-fw-medium)]">{children}</span>
);

const AboutPage = () => {
  return (
    <Panel tone="glass" radius="2xl" className="max-w-2xl mx-auto p-5 md:p-7 space-y-6">
      <div>
        <AsciiText
          ascii={ASCII_ALGORITHM_VISUALISER}
          cssClass="tn-ascii-heading"
          ariaLabel="Algorithm Visualiser"
          fallback={
            <h2 className="text-title font-[var(--st-fw-semibold)] text-tn-text">
              Algorithm Visualiser
            </h2>
          }
        />
        <p className="mt-1 text-body text-tn-muted">
          Watch algorithms think, one step at a time.
        </p>
      </div>

      <div className="space-y-3 text-body text-tn-muted leading-relaxed">
        <p>
          Pick an algorithm, hit play, and see exactly what happens at every
          step — values moving, pointers shifting, trees rebalancing — with
          matching <S>code highlighting</S> and <S>plain-language narration</S> running
          in sync.
        </p>

        <p>
          Step through at your own pace or let it play automatically.
          Adjust speed, scrub to any frame, or turn on <S>predict mode</S> to
          test yourself before each step is revealed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-tn-muted">
        <div>
          <AsciiText
            ascii={ASCII_ALGORITHMS}
            cssClass="tn-ascii-label"
            ariaLabel="Algorithms"
            fallback={
              <h3 className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 font-[var(--st-fw-semibold)] mb-1.5">
                Algorithms
              </h3>
            }
          />
          <ul className="space-y-0.5">
            <li>Bubble Sort</li>
            <li>Insertion Sort</li>
            <li>Selection Sort</li>
            <li>Merge Sort</li>
            <li>Quick Sort</li>
            <li>Heap Sort</li>
            <li>Radix Sort</li>
            <li>Counting Sort</li>
          </ul>
        </div>

        <div>
          <AsciiText
            ascii={ASCII_LANGUAGES}
            cssClass="tn-ascii-label"
            ariaLabel="Languages"
            fallback={
              <h3 className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 font-[var(--st-fw-semibold)] mb-1.5">
                Languages
              </h3>
            }
          />
          <ul className="space-y-0.5">
            <li>Python, TypeScript, JavaScript</li>
            <li>Java, C++, Pseudocode</li>
          </ul>

          <AsciiText
            ascii={ASCII_CUSTOMISE}
            cssClass="tn-ascii-label"
            ariaLabel="Customise"
            fallback={
              <h3 className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 font-[var(--st-fw-semibold)] mt-3 mb-1.5">
                Customise
              </h3>
            }
          />
          <ul className="space-y-0.5">
            <li>4 colour themes, 4 style presets</li>
            <li>Custom input arrays</li>
            <li>Resizable visualisation panel</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-tn-muted/60">
        Built with React, TypeScript, and Tailwind CSS. More algorithms coming soon.
      </p>
    </Panel>
  );
};

export default AboutPage;
