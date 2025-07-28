import { useEffect, useState } from "react";

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        setUserId(data?.user?.id || null);
      } catch {
        setUserId(null);
      }
    }
    fetchSession();
  }, []);

  return userId;
}
