import { supabase } from "../lib/supabase";

export type EstimatePayload = {
    name: string;
    phone: string;
    email?: string | null;

    depart_date: string;      // YYYY-MM-DD
    return_date?: string | null; // optional

    people_count: number;

    region?: string | null;
    budget?: string | null;
    memo?: string | null;
};

export async function sendEstimateEmail(payload: EstimatePayload) {
    const { data, error } = await supabase.functions.invoke("send-estimate", {
        body: payload,
    });

    if (error) throw error;
    return data;
}
