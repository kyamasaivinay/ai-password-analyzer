import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const checks = [
    { label: "Minimum 8 characters", pass: password.length >= 8 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains a number", pass: /[0-9]/.test(password) },
    { label: "Contains a special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const totalCount = checks.length;

  const strength = password.length === 0
    ? { label: "", level: 0, color: "bg-transparent" }
    : passedCount <= 2
      ? { label: "Weak", level: 1, color: "bg-red-500" }
      : passedCount <= 3
        ? { label: "Medium", level: 2, color: "bg-amber-400" }
        : { label: "Strong", level: 3, color: "bg-emerald-500" };

  const meterStyle =
    password.length === 0
      ? { width: "0%", background: "var(--muted)" }
      : { width: `${(passedCount / totalCount) * 100}%`, background: strength.color.replace("bg-", "var(--color-") + ")" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen flex-col px-4 py-12"
    >
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          {/* Claymorphism card */}
          <div className="relative rounded-3xl bg-white/40 p-8 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_9px_20px_-12px_rgba(46,34,134,0.45)] backdrop-blur-xl">
            <div className="absolute -top-4 left-1/2 h-8 w-8 translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 p-1">
              <div className="rounded-full bg-white p-1">
                <ShieldCheck className="size-5 text-indigo-600" />
              </div>
            </div>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Password Strength Analyzer</h1>
              <p className="mt-1.5 text-sm text-gray-500">Evaluate your password strength instantly</p>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white/70 py-2.5 pl-4 pr-10 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.8)]">
              <input
                id="password-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type a password to check"
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

            {/* Strength meter */}
            <div className="mb-4 relative overflow-hidden rounded-full bg-gray-100/70 py-2.5 shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.04)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-300 ease-out"
                style={meterStyle}
              />
              <div className="relative z-10 flex items-center justify-center">
                <span className={`text-base font-semibold ${password.length === 0 ? "text-gray-400" : "text-white shadow-sm drop-shadow"}`}>
                  {strength.label}
                </span>
              </div>
            </div>

            {/* Checklist */}
            <ul className="space-y-2">
              {checks.map((check, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white/70 p-3 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.7)]">
                  <span className="text-sm text-gray-700">{check.label}</span>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${check.pass ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    {check.pass ? (
                      <>
                        <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l2.5 2.5L11 3.5" />
                        </svg>
                        Pass
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l6 6M10 4l-6 6" />
                        </svg>
                        Fail
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">Mini Project – AI Password Strength Analyzer</p>
        </div>
      </div>
    </motion.div>
  );
}
