// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import VisualiserPage from "./pages/VisualiserPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          {/* Default route -> choose a default algorithm */}
          <Route path="/" element={<Navigate to="/visualiser/merge-sort" replace />} />

          {/* Algorithm routes */}
          <Route path="/visualiser/:algorithm" element={<VisualiserPage />} />

          {/* About */}
          <Route path="/about" element={<AboutPage />} />

          {/* Optional: catch-all */}
          <Route path="*" element={<Navigate to="/visualiser/merge-sort" replace />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;
