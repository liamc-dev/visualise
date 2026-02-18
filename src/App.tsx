// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import VisualiserPage from "./pages/VisualiserPage";
import AboutPage from "./pages/AboutPage";
import ThemeApplier from "./theme/ThemeApplier";

import MemoriseLayout from "./pages/memorise/MemoriseLayout";
import MemoriseHomePage from "./pages/memorise/MemoriseHomePage";
import MemorisePrimePage from "./pages/memorise/MemorisePrimePage";
import MemoriseSessionPage from "./pages/memorise/MemoriseSessionPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import RequireAuth from "./routes/RequireAuth";
import AccountPage from "./pages/auth/AccountPage";
import AuthBootstrap from "./routes/AuthBootstrap";

import ScenePage from "./pages/ScenePage";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ThemeApplier />
      {/* <AuthBootstrap> */}
        <AppShell>
          <Routes>
            {/* <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} /> */}

            {/* default */}
            <Route path="/" element={<Navigate to="/visualiser/merge-sort" replace />} />

            <Route path="/visualiser" element={<Navigate to="/visualiser/merge-sort" replace />} />
            <Route path="/visualiser/:algorithm" element={<VisualiserPage />} />

            {/* MEMORISE */}
          <Route path="/memorise" element={<MemoriseLayout />}>
            <Route
              index
              element={
                <RequireAuth>
                  <MemoriseHomePage />
                </RequireAuth>
              }
            />

            <Route
              path="prime/:algorithm"
              element={
                <RequireAuth>
                  <MemorisePrimePage />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="/scenes" element={<Navigate to="/scenes/file-upload-cdn" replace />} />
          <Route path="/scenes/:sceneId" element={<ScenePage />} />

          {/* Session stays full-screen */}
          <Route path="/memorise/session/:algorithm" element={<MemoriseSessionPage />} />

            <Route path="/about" element={<AboutPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/visualiser/quick-sort" replace />} />
          </Routes>
        </AppShell>
      {/* </AuthBootstrap> */}
    </Router>
  );
}

export default App;
