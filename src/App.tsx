// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import VisualiserPage from "./pages/VisualiserPage";
import AboutPage from "./pages/AboutPage";
import ThemeApplier from "./theme/ThemeApplier";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ThemeApplier />
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/visualiser/merge-sort" replace />} />
          <Route path="/visualiser/:algorithm" element={<VisualiserPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/visualiser/merge-sort" replace />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;
