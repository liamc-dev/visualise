// src/pages/AboutPage.tsx
const AboutPage = () => {
  return (
    <div className="rounded-st-md bg-tn-grid backdrop-blur-[var(--st-blur-sm)] p-4 md:p-5">
      <h2 className="text-title font-[var(--st-fw-semibold)] mb-4 text-tn-text">About</h2>

      <div className="space-y-3 text-body text-tn-muted">
        <p>
          <span className="text-tn-text font-[var(--st-fw-medium)]">What it does</span> —
          Interactive step-by-step visualisation of sorting algorithms with 
          synchronised code highlighting, tree/array views, and plain-language 
          explanations.
        </p>

        <p>
          <span className="text-tn-text font-[var(--st-fw-medium)]">How to use it</span> — 
          Step through manually or adjust playback speed. Switch between Java, 
          C++, Python, and TypeScript implementations.
        </p>

        <p>
          <span className="text-tn-text font-[var(--st-fw-medium)]">What's next</span> — 
          More algorithms and memorization features coming soon.
        </p>

      </div>
    </div>
  );
};

export default AboutPage;
