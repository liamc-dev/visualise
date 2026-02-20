import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth-service";
import { userService, MeResponse } from "../../api/user-service";
import { useAuthStore } from "../../stores/useAuthStore";
import { api } from "../../api/http";
import { Btn } from "../../components/ui/Btn";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

function LinkRow({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full text-left rounded-lg px-2 py-2",
        "hover:bg-tn-surfaceSoft/70 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-tn-accent/30",
      ].join(" ")}
    >
      <div className="text-ui text-tn-link group-hover:underline">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-button text-tn-muted leading-snug">
          {subtitle}
        </div>
      ) : null}
    </button>
  );
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-body font-[var(--st-fw-semibold)] text-tn-text">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-body text-tn-muted max-w-[760px]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border bg-tn-surfaceSoft/50 px-3 py-1">
      <div className="text-micro tracking-[0.18em] uppercase text-tn-subtle/70">
        {label}
      </div>
      <div className="text-ui font-[var(--st-fw-semibold)] text-tn-text">{value}</div>
    </div>
  );
}

export default function AccountPage() {
  const nav = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const token = useAuthStore((s) => s.accessToken);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setMe(null);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) {
        setLoading(false);
        setMe(null);
        return;
      }

      setErr(null);
      setLoading(true);
      try {
        const data = await userService.me();
        if (!cancelled) setMe(data);
      } catch (e) {
        if (!cancelled) setErr(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onLogout() {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      delete api.defaults.headers.common.Authorization;
      nav("/login", { replace: true });
    }
  }

  const signedInLine = loading
    ? "Loading…"
    : err
    ? err
    : `Signed in as ${me?.email ?? "Unknown"}`;

  const avatarLetter = (me?.username?.[0] ?? me?.email?.[0] ?? "U").toUpperCase();

  // Placeholder stats until you wire real values from your recall/progress store/API
  const stats = useMemo(
    () => [
      { label: "Decks", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Streak", value: "—" },
    ],
    []
  );

  return (
    <div className="h-full min-h-0 text-tn-text">
      <div className="mx-auto w-full max-w-[1040px] px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-label tracking-[0.22em] uppercase text-tn-subtle/70">
              Account
            </div>

            <h1 className="mt-2 text-2xl font-[var(--st-fw-semibold)] tracking-tight leading-tight">
              Profile, playback, and recall settings
            </h1>

            <div className="mt-2 text-ui text-tn-muted">{signedInLine}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {stats.map((s) => (
                <StatPill key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <div className="h-16 w-16 rounded-full bg-tn-card border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
              <span className="text-sm font-[var(--st-fw-semibold)] text-tn-text/80">
                {avatarLetter}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-7 border-t border-tn-divider/10" />

        {!loading && err ? (
          <div className="mt-5 rounded-st-sm border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-tn-danger/30 bg-tn-danger/10 px-3 py-3 text-sm text-tn-text">
            {err}
          </div>
        ) : null}

        <div className="mt-6 space-y-10">
          {/* Profile */}
          <section>
            <SectionTitle
              title="Profile"
              subtitle="Your identity in the app and where your progress is stored."
            />

            <div className="mt-4 rounded-st-md border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border bg-tn-surface/60 p-4">
              <div className="text-button text-tn-muted">Signed in</div>
              <div className="mt-1 text-ui font-[var(--st-fw-medium)]">
                {me?.email ?? "Unknown"}
              </div>
              {me?.username ? (
                <div className="mt-1 text-button text-tn-muted">
                  Username: <span className="text-tn-text/90">{me.username}</span>
                </div>
              ) : null}
              <div className="mt-1 text-button text-tn-muted">
                Role: <span className="text-tn-text/90">{me?.role ?? "USER"}</span>
              </div>

              <div className="mt-4 space-y-1">
                <LinkRow
                  title="Edit profile"
                  subtitle="Update display name and profile details."
                  onClick={() => nav("/account/profile")}
                />
                <LinkRow
                  title="Security"
                  subtitle="Password and active sessions."
                  onClick={() => nav("/account/security")}
                />
                <LinkRow
                  title="Connected apps"
                  subtitle="Manage external integrations."
                  onClick={() => nav("/account/apps")}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-tn-divider/10" />

          {/* Learning & progress */}
          <section>
            <SectionTitle
              title="Learning & progress"
              subtitle="Track how you’re progressing through algorithms and visual playback."
            />

            <div className="mt-4 space-y-1">
              <LinkRow
                title="View progress"
                subtitle="See mastery per algorithm and overall learning curve."
                onClick={() => nav("/account/progress")}
              />
              <LinkRow
                title="History"
                subtitle="Recently watched algorithms and playback sessions."
                onClick={() => nav("/account/history")}
              />
              <LinkRow
                title="Reset progress"
                subtitle="Clear algorithm mastery and start fresh."
                onClick={() => nav("/account/reset-progress")}
              />
            </div>
          </section>

          <div className="border-t border-tn-divider/10" />

          {/* Memory recall */}
          <section>
            <SectionTitle
              title="Memory recall"
              subtitle="Spaced repetition settings for your Anki-inspired algorithm decks."
            />

            <div className="mt-4 space-y-1">
              <LinkRow
                title="Recall settings"
                subtitle="Daily review limits, intervals, and grading steps."
                onClick={() => nav("/account/recall")}
              />
              <LinkRow
                title="Manage decks"
                subtitle="Create, rename, and organize your algorithm decks."
                onClick={() => nav("/memorise")}
              />
              <LinkRow
                title="Import / export decks"
                subtitle="Back up or transfer your decks and recall data."
                onClick={() => nav("/account/decks")}
              />
            </div>
          </section>

          <div className="border-t border-tn-divider/10" />

          {/* Playback defaults */}
          <section>
            <SectionTitle
              title="Playback defaults"
              subtitle="How code highlighting and step playback behaves by default."
            />

            <div className="mt-4 space-y-1">
              <LinkRow
                title="Playback settings"
                subtitle="Speed, auto-step, and step controls."
                onClick={() => nav("/account/playback")}
              />
              <LinkRow
                title="Editor & highlight settings"
                subtitle="Highlight style, focus mode, and code visibility."
                onClick={() => nav("/account/editor")}
              />
              <LinkRow
                title="Keyboard shortcuts"
                subtitle="Customize stepping, rewind, and recall hotkeys."
                onClick={() => nav("/account/shortcuts")}
              />
            </div>
          </section>

          <div className="border-t border-tn-divider/10" />

          {/* Data & privacy */}
          <section>
            <SectionTitle
              title="Data & privacy"
              subtitle="Control what’s stored and exported from your learning."
            />

            <div className="mt-4 space-y-1">
              <LinkRow
                title="Export my data"
                subtitle="Download progress, decks, and settings."
                onClick={() => nav("/account/export")}
              />
              <LinkRow
                title="Clear history"
                subtitle="Remove watched/played algorithm history."
                onClick={() => nav("/account/clear-history")}
              />
              <LinkRow
                title="Delete account"
                subtitle="Permanently remove your account and all data."
                onClick={() => nav("/account/delete")}
              />
            </div>
          </section>

          <div className="border-t border-tn-divider/10" />

          {/* Logout */}
          <section>
            <SectionTitle
              title="Session"
              subtitle="Sign out from this device."
            />

            <div className="mt-5">
              <Btn variant="soft" size="md" onClick={onLogout} className="rounded-full">
                Log out
              </Btn>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
