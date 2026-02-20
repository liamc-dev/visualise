import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authService } from "../../api/auth-service";
import { useAuthStore } from "../../stores/useAuthStore";
import { useField } from "../../hooks/use-field";
import { AuthInput } from "../../components/ui/AuthInput";
import { emailValidator, passwordValidator } from "../../validation/auth";
import { ApiError } from "../../api/api-error";
import { Eye, EyeOff } from "lucide-react";
import { Panel } from "../../components/ui/Panel";
import { Btn } from "../../components/ui/Btn";

type LocationState = {
  from?: { pathname?: string };
};

function getErrorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Login failed";
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const email = useField("", emailValidator);
  const password = useField("", passwordValidator);

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const from = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? "/memorise";
  }, [location.state]);

  const canSubmit = !email.error && !password.error && !submitting;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // reveal validation
    email.setTouched(true);
    password.setTouched(true);

    setServerErr(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await authService.login({
        email: email.value.trim().toLowerCase(),
        password: password.value,
      });

      setAccessToken(res.accessToken);
      nav(from, { replace: true });
    } catch (e) {
      setServerErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full min-h-0 px-4 py-10 text-tn-text">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-6">
          <div className="text-label tracking-[0.22em] uppercase text-tn-subtle/70">
            Account
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-1 text-sm text-tn-muted">
            Welcome back. Enter your details to continue.
          </p>
        </div>

        {/* Card */}
        <Panel tone="glass" className="p-5 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          {/* Error slot (reserved height) */}
          <div className="min-h-[52px]">
            <div
              className={[
                "rounded-xl border px-3 py-3 text-sm transition",
                serverErr
                  ? "border-tn-danger/30 bg-tn-danger/10 text-tn-danger"
                  : "border-transparent bg-transparent text-transparent",
              ].join(" ")}
              role="alert"
              aria-live="polite"
            >
              {serverErr ?? "placeholder"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-2 grid gap-4">
            <AuthInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={submitting}
              field={email}
            />

            <AuthInput
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={submitting}
              field={password}
              rightSlot={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  disabled={submitting}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="flex items-center justify-center h-6 w-6 rounded text-tn-muted hover:text-tn-text transition-colors disabled:opacity-60"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Btn
              type="submit"
              variant="primary"
              size="md"
              disabled={!canSubmit}
              className="h-11"
            >
              {submitting && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-tn-border border-t-transparent"
                  aria-hidden="true"
                />
              )}
              {submitting ? "Logging in…" : "Log in"}
            </Btn>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-tn-muted">
            <span>
              No account?{" "}
              <Link className="underline hover:text-tn-text transition" to="/signup">
                Create one
              </Link>
            </span>

            <button
              type="button"
              className="underline hover:text-tn-text transition"
              onClick={() => setServerErr("Password reset isn't wired up yet.")}
            >
              Forgot password?
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
