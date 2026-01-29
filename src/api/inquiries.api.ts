import { supabase } from "../lib/supabase";

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "DONE";

export type InquiryRow = {
    id: string;
    user_id: string | null;

    contact_name: string;
    contact_phone: string;
    contact_email: string | null;

    title: string;
    content: string;

    status: InquiryStatus;
    memo_admin: string | null;

    created_at: string;
    updated_at: string;
};

export async function createInquiry(input: {
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    title: string;
    content: string;
}) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? null;

    const payload = {
        user_id: userId,
        contact_name: input.contactName.trim(),
        contact_phone: input.contactPhone.trim(),
        contact_email: (input.contactEmail ?? "").trim() || null,
        title: input.title.trim(),
        content: input.content.trim(),
    };

    const { error } = await supabase.from("inquiries").insert(payload);
    if (error) throw error;
}

export async function adminListInquiries(limit = 200): Promise<InquiryRow[]> {
    const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as InquiryRow[];
}

export async function adminUpdateInquiry(
    id: string,
    patch: Partial<Pick<InquiryRow, "status" | "memo_admin">>
): Promise<void> {
    const { error } = await supabase.from("inquiries").update(patch).eq("id", id);
    if (error) throw error;
}
