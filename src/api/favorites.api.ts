import { supabase } from "../lib/supabase";

export type FavoriteRow = {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
};

export type MyFavoriteRow = {
    id: string;                 // product_favorites.id
    product_id: string;
    created_at: string;         // UTC
    created_at_kst: string | null;

    products: {
        id: string;
        title: string;
        price_text: string | null;
        thumbnail_url: string | null;
        thumbnail_path: string | null;
        region: string | null;
    } | null;
};


export async function isFavorited(productId: string, userId: string) {
    const { data, error } = await supabase
        .from("product_favorites")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;
    return Boolean(data?.id);
}

export async function addFavorite(productId: string, userId: string) {
    const { error } = await supabase
        .from("product_favorites")
        .insert({ product_id: productId, user_id: userId });

    if (error) throw error;
    return true;
}

export async function removeFavorite(productId: string, userId: string) {
    const { error } = await supabase
        .from("product_favorites")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId);

    if (error) throw error;
    return true;
}

export async function listMyFavorites(userId: string) {
    const { data, error } = await supabase
        .from("product_favorites")
        .select(`
      id,
      product_id,
      created_at,
      created_at_kst,
      products:product_id (
        id,
        title,
        price_text,
        thumbnail_url,
        thumbnail_path,
        region
      )
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as any[];

    return rows.map((r) => ({
        ...r,
        products: Array.isArray(r.products) ? (r.products[0] ?? null) : (r.products ?? null),
    })) as MyFavoriteRow[];
}

