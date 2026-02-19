"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema } from "@/lib/validations/auth-schema";
import {
  LucideAlertCircle,
  LucideCheckCircle2,
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideMail,
} from "lucide-react";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"form"> & LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field being typed in
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Clear server error if user starts typing again
    if (serverError) setServerError(null);
  };

  const login = useLogin({
    onSuccess,
    onError: (msg) => {
      setServerError(msg);
      triggerShake();
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      triggerShake();

      // Auto-focus the first error field
      if (fieldErrors.email) emailInputRef.current?.focus();
      else if (fieldErrors.password) passwordInputRef.current?.focus();

      return;
    }

    setIsLoading(true);

    login.mutate(formData);
    setIsLoading(false);
  };
  const isEmailValid =
    formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email);
  return (
    <form
      className={cn(
        `flex flex-col gap-6 ${isShaking ? "animate-shake" : ""}  `,
        className,
      )}
      onSubmit={onSubmit}
      noValidate
      {...props}
    >
      {serverError && (
        <div
          role="alert"
          className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm"
        >
          <LucideAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-800">Gagal Masuk</h3>
            <p className="text-xs font-medium text-red-700 mt-0.5 leading-relaxed">
              {serverError}
            </p>
          </div>
        </div>
      )}

      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="relative">
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${errors.email ? "text-red-400" : "text-slate-400 group-focus-within:text-indigo-500"}`}
            >
              <LucideMail size={18} />
            </div>
            <Input
              ref={emailInputRef}
              id="email"
              type="email"
              name="email"
              value={formData.email}
              placeholder="m@sipeduli.com"
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full h-10 pl-11 pr-11 transition-all duration-200 ${
                errors.email
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 ring-4 ring-red-50"
                  : "border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 hover:border-slate-200"
              } `}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {errors.email && (
                <LucideAlertCircle
                  className="text-red-500 animate-in zoom-in duration-300"
                  size={20}
                />
              )}
              {isEmailValid && (
                <LucideCheckCircle2
                  className="text-green-500 animate-in zoom-in duration-300"
                  size={20}
                />
              )}
            </div>
          </div>
          <div className="min-h-4 px-1">
            {errors.email && (
              <p
                id="email-error"
                className="text-[13px] font-semibold text-red-500 flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-indigo-500"}`}
            >
              <LucideLock size={18} />
            </div>
            <Input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full h-10 pl-11 pr-12 transition-all duration-200 font-medium
              ${
                errors.password
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 ring-4 ring-red-50"
                  : "border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 hover:border-slate-200"
              } `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 focus:text-indigo-600 transition-colors focus:outline-none rounded-lg hover:bg-slate-100"
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
            >
              {showPassword ? (
                <LucideEyeOff size={18} />
              ) : (
                <LucideEye size={18} />
              )}
            </button>
          </div>
          <div className="min-h-4 px-1">
            {errors.password && (
              <p
                id="password-error"
                className="text-[13px] font-semibold text-red-500 flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.password}
              </p>
            )}
          </div>
        </Field>

        <Field>
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
