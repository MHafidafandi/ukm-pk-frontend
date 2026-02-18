"use client";

import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/lib/api/auth-service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/contexts/AuthContext";

export const Guard = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) => {
  const { data, isLoading, isError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/login");
    }
  }, [isLoading, isError, data, router]);

  if (isLoading) {
    return <Spinner className="m-4" />;
  }

  if (!data) {
    return null;
  }

  if (role && !data.roles.includes(role)) {
    return <div>Akses ditolak</div>;
  }

  return <>{children}</>;
};
