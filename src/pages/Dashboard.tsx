import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, ShieldCheck, ShieldAlert, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

const DEFAULT_RULES = [
  { id: "min-length", label: "Minimum 8 characters", enabled: true, test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "Contains uppercase letter", enabled: true, test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Contains lowercase letter", enabled: true, test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Contains a number", enabled: true, test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "Contains a special character", enabled: true, test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_BANDS = [
  { label: "Weak", minRatio: 0, maxRatio: 0.4, color: "bg-red-500" },
  { label: "Medium", minRatio: 0.4, maxRatio: 0.7, color: "bg-amber-400" },
  { label: "Strong", minRatio: 0.7, maxRatio: 1, color: "bg-emerald-500" },
];

function evaluate(password: string, rules: typeof DEFAULT_RULES) {
  const enabledRules = rules.filter((r) => r.enabled);
  if (password.length === 0) {
    return {
      checks: rules.map((r) => ({ label: r.label, id: r.id, pass: false })),
      passed: 0,
      total: 0,
      level: 0,
      meterColor: "var(--muted)",
      meterWidth: 0,
      strength: { label: "", emoji: "" },
    };
  }
  const checks = rules.map((r) => ({
    label: r.label,
    id: r.id,
    pass: r.enabled && r.test(password),
  }));
  const passed = checks.filter((c) => c.pass).length;
  const total = enabledRules.length;
  if (total === 0) {
    return {
      checks,
      passed: 0,
      total: 0,
      level: 0,
      meterColor: "var(--muted)",
      meterWidth: 0,
      strength: { label: "Not scored", emoji: "" },
    };
  }
  const ratio = passed / total;
  let band = STRENGTH_BANDS[0];
  for (const b of STRENGTH_BANDS) {
    if (ratio >= b.minRatio && ratio <= b.maxRatio) {
      band = b;
      break;
    }
  }
  const strengthLabel =
    ratio >= 0.7
      ? "Strong"
      : ratio >= 0.4
        ? "Medium"
        : "Weak";
  const emoji =
    ratio >= 0.7
      ? "Phew, nice one"
      : ratio >= 0.4
        ? "Getting better"
        : "A little risky";

  return {
    checks,
    passed,
    total,
    level: passed,
    meterColor: band.color.replace("bg-", "var(--color-") + ")",
    meterWidth: `${(ratio * 100).toFixed(0)}%`,
    strength: { label: strengthLabel, emoji },
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<typeof DEFAULT_RULES>(DEFAULT_RULES);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const result = evaluate(password, rules);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <main className="flex min-h-screen flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Your password manager
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              AI Password Gauge
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer gap-2 self-start"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </header>

        <div className="space-y-6">
          {/* Scorecard */}
          <Card className="relative overflow-hidden rounded-2xl bg-white/50 shadow-[0_10px_24px_-10px_rgba(46,34,134,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 h-7 w-7 translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 p-1.5 shadow-sm">
              <div className="rounded-full bg-white p-1">
                <ShieldCheck className="size-5 text-indigo-600" />
              </div>
            </div>
            <CardHeader className="pt-8 pb-2">
              <CardTitle className="text-lg">Quick check</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white/80 py-2.5 pl-4 pr-10 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.8)]">
                <input
                  id="admin-password-input"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Test a password"
                  className="h-full w-full bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 active:scale-95 transition-colors"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <div className="mt-4 relative overflow-hidden rounded-full bg-gray-100 py-2.5 shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.04)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-300 ease-out"
                  style={{
                    width: result.meterWidth,
                    background: password.length === 0 ? "var(--muted)" : result.meterColor,
                  }}
                />
                <div className="relative z-10 flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${password.length === 0 ? "text-gray-400" : "text-white shadow-sm drop-shadow"}`}
                  >
                    {result.strength.emoji} {result.strength.label}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Based on {result.total > 0 ? result.passed : 0} of{" "}
                {result.total > 0 ? result.total : 0} active rules, this password
                looks{" "}
                <span className="font-semibold capitalize text-gray-900">
                  {result.strength.label.toLowerCase()}
                </span>
                .
              </p>
            </CardContent>
          </Card>

          {/* Admin rules */}
          <Card className="relative rounded-2xl bg-white/50 shadow-[0_10px_24px_-10px_rgba(46,34,134,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 h-7 w-7 translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 p-1.5 shadow-sm">
              <div className="rounded-full bg-white p-1">
                <Settings className="size-5 text-indigo-600" />
              </div>
            </div>
            <CardHeader className="pt-8 pb-2">
              <CardTitle className="text-lg">
                Scoring rules
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Toggle the checks you want the gauge to use. {enabledCount} of{" "}
                {rules.length} active.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200/60 bg-white/80 p-3 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.7)]"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{rule.label}</span>
                    </label>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        rule.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {rule.enabled ? (
                        <svg viewBox="0 0 14 14" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l2.5 2.5L11 3.5" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 14 14" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l6 6M10 4l-6 6" />
                        </svg>
                      )}
                      {rule.enabled ? "On" : "Off"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Checklist detail */}
          <Card className="relative rounded-2xl bg-white/50 shadow-[0_10px_24px_-10px_rgba(46,34,134,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 h-7 w-7 translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 p-1.5 shadow-sm">
              <div className="rounded-full bg-white p-1">
                <ShieldAlert className="size-5 text-indigo-600" />
              </div>
            </div>
            <CardHeader className="pt-8 pb-2">
              <CardTitle className="text-lg">
                Rule breakdown
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                How the current password stacks up against each rule.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              {password.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Type a password above to see which rules it passes.
                </p>
              ) : (
                <ul className="space-y-2">
                  {result.checks.map((check) => (
                    <li
                      key={check.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/60 bg-white/80 px-3 py-2.5 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.7)]"
                    >
                      <span className="text-sm text-gray-700">{check.label}</span>
                      {check.pass ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l2.5 2.5L11 3.5" />
                          </svg>
                          Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                          <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l6 6M10 4l-6 6" />
                          </svg>
                          Fail
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Mini Project – AI Password Gauge
        </p>
      </div>
    </main>
  );
}
