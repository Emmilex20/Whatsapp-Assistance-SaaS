"use client";

import { useEffect, useState } from "react";
import type { DashboardNotificationCounts } from "@/lib/dashboard-notifications";

export function useDashboardNotifications(
  initialCounts: DashboardNotificationCounts
) {
  const [counts, setCounts] =
    useState<DashboardNotificationCounts>(initialCounts);

  useEffect(() => {
    const controller = new AbortController();

    async function refreshNotifications() {
      try {
        const response = await fetch("/api/dashboard/notifications", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          counts?: DashboardNotificationCounts;
        };

        if (data.counts) {
          setCounts(data.counts);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.warn("Dashboard notifications refresh skipped:", error);
      }
    }

    const interval = window.setInterval(refreshNotifications, 30000);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return counts;
}
