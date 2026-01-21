import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type UseSessionResult = {
    session: Session | null;
    loading: boolean;
};

export function useSession(): UseSessionResult {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data, error }) => {
            if (!mounted) return;
            if (error) console.warn("[useSession] getSession error:", error.message);
            setSession(data.session ?? null);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!mounted) return;
            setSession(nextSession ?? null);
            setLoading(false);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { session, loading };
}
