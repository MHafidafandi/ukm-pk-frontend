import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/dashboardService";
import { DashboardResponseData } from "../types/dashboardTypes";

export function useDashboard() {
  const [data, setData] = useState<DashboardResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true);
        const response = await getDashboardStats();
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load dashboard data"),
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return { data, isLoading, error };
}
