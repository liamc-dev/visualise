// src/pages/AboutPage.tsx
const AboutPage = () => {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 backdrop-blur-sm p-4 md:p-5">
      <h2 className="text-lg font-semibold mb-2">About this demo</h2>
      <p className="text-sm text-neutral-400">
        This is a React + TypeScript + Tailwind visualiser playground using an
        app-shell layout: sidebar, top bar, and routed content area. It’s set up
        so you can bolt on more visualisations and tooling without rewriting
        layout.
      </p>
    </div>
  );
};

export default AboutPage;
