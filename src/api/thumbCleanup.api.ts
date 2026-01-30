import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function headers() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("로그인 필요");
    return {
        Authorization: `Bearer ${data.session.access_token}`,
        apikey: ANON_KEY,
        "Content-Type": "application/json",
    };
}

export async function previewThumbCleanup() {
    const res = await fetch(
        `${BASE_URL}/functions/v1/thumbnail_cleanup?action=preview`,
        { method: "POST", headers: await headers() },
    );
    if (!res.ok) throw new Error("preview 실패");
    return res.json();
}

export async function deleteThumbCleanup(paths: string[]) {
    const res = await fetch(
        `${BASE_URL}/functions/v1/thumbnail_cleanup?action=delete`,
        {
            method: "POST",
            headers: await headers(),
            body: JSON.stringify({ paths }),
        },
    );
    if (!res.ok) throw new Error("delete 실패");
    return res.json();
}