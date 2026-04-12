"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
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

  const { login, isLoggingIn } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
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

    try {
      await login(formData);
      onSuccess?.();
    } catch (error: unknown) {
      const loginError = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };
      setServerError(
        loginError.response?.data?.message ||
          loginError.response?.data?.error ||
          "Gagal masuk",
      );
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const isEmailValid =
    formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email);
  return (
    <form
      className={cn(`space-y-6 ${isShaking ? "animate-shake" : ""}`, className)}
      onSubmit={onSubmit}
      noValidate
      {...props}
    >
      {serverError && (
        <div
          role="alert"
          className="p-4 bg-error-container border-l-4 border-error rounded-r-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm"
        >
          <LucideAlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-interface text-sm font-bold text-on-error-container">
              Gagal Masuk
            </h3>
            <p className="font-interface text-xs font-medium text-on-error-container mt-0.5 leading-relaxed">
              {serverError}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="font-interface block text-sm font-semibold text-on-surface-variant mb-1.5">
          Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LucideMail className="text-on-surface-variant group-focus-within:text-primary transition-colors size-5" />
          </div>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={`font-interface block w-full pl-11 pr-11 py-3 bg-surface-container-low border-0 border-b-2 rounded-none text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:border-primary transition-all outline-none ${
              errors.email
                ? "border-error"
                : "border-outline-variant"
            }`}
            placeholder="m@sipeduli.com"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1.5 pointer-events-none">
            {errors.email && (
              <LucideAlertCircle className="text-error animate-in zoom-in duration-300 size-5" />
            )}
            {isEmailValid && (
              <LucideCheckCircle2 className="text-primary animate-in zoom-in duration-300 size-5" />
            )}
          </div>
        </div>
        <div className="min-h-5 mt-1">
          {errors.email && (
            <p className="font-interface text-[12px] font-semibold text-error flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
              <span className="w-1 h-1 bg-error rounded-full"></span>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-interface block text-sm font-semibold text-on-surface-variant">
            Password
          </label>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LucideLock className="text-on-surface-variant group-focus-within:text-primary transition-colors size-5" />
          </div>
          <input
            ref={passwordInputRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className={`font-interface block w-full pl-11 pr-12 py-3 bg-surface-container-low border-0 border-b-2 rounded-none text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:border-primary transition-all outline-none font-medium ${
              errors.password
                ? "border-error"
                : "border-outline-variant"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <LucideEyeOff className="text-on-surface-variant hover:text-on-surface transition-colors size-5" />
            ) : (
              <LucideEye className="text-on-surface-variant hover:text-on-surface transition-colors size-5" />
            )}
          </button>
        </div>
        <div className="min-h-5 mt-1">
          {errors.password && (
            <p className="font-interface text-[12px] font-semibold text-error flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
              <span className="w-1 h-1 bg-error rounded-full"></span>
              {errors.password}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center pb-2">
        <input
          className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
          id="remember-me"
          name="remember-me"
          type="checkbox"
        />
        <label
          className="font-interface ml-2 block text-sm text-on-surface-variant"
          htmlFor="remember-me"
        >
          Remember me for 30 days
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoggingIn || isLoading}
        className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
      >
        {isLoggingIn || isLoading ? "Logging in..." : "Sign In to Dashboard"}
      </button>
    </form>
  );
}
