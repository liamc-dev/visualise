// src/pages/auth
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth-service";
import { useAuthStore } from "../../stores/useAuthStore";
import { AuthInput } from "../../components/ui/AuthInput";
import { useField } from "../../hooks/use-field";
import { emailValidator, passwordValidator, usernameOptionalValidator } from "../../validation/auth";
import { Eye, EyeOff } from "lucide-react";
import { Panel } from "../../components/ui/Panel";
import { Btn } from "../../components/ui/Btn";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Sign up failed";
}

export default function SignupPage() {
  const nav = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const email = useField("", emailValidator);
  const username = useField("", usernameOptionalValidator);
  const password = useField("", passwordValidator);

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const canSubmit = !email.error && !username.error && !password.error && !submitting;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // reveal errors if they haven’t blurred yet
    email.setTouched(true);
    username.setTouched(true);
    password.setTouched(true);

    setServerErr(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const trimmedEmail = email.value.trim().toLowerCase();
      const trimmedUsername = username.value.trim();

      const res = await authService.register({
        email: trimmedEmail,
        password: password.value,
        ...(trimmedUsername ? { username: trimmedUsername } : {}),
      });

      setAccessToken(res.accessToken);
      nav("/memorise", { replace: true });
    } catch (e) {
      setServerErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full min-h-0 px-4 py-10 text-tn-text">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-6">
          <div className="text-label tracking-[0.22em] uppercase text-tn-subtle/70">
            Account
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-tn-muted">Create your account to start using the app.</p>
        </div>

        <Panel tone="glass" className="p-5 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
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
              label={
                <>
                  Username <span className="text-tn-muted/70">(optional)</span>
                </>
              }
              autoComplete="username"
              placeholder="yourname"
              disabled={submitting}
              field={username}
            />

            <AuthInput
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="min 8 characters"
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
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-tn-border border-t-transparent" />
              )}
              {submitting ? "Creating…" : "Create account"}
            </Btn>
          </form>

          <div className="mt-4 text-xs text-tn-muted">
            Already have an account?{" "}
            <Link className="underline hover:text-tn-text transition" to="/login">
              Log in
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
