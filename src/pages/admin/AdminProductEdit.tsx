import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductUpsert } from "../../types/product";
import { createProduct, getProduct, updateProduct } from "../../api/products.api";

export default function AdminProductEdit({ mode }: { mode: "create" | "edit" }) {
    const nav = useNavigate();
    const qc = useQueryClient();
    const { id = "" } = useParams();

    const [form, setForm] = useState<ProductUpsert>({
        title: "",
        subtitle: "",
        description: "",
        priceText: "상담 문의",
        region: "일본",
        thumbnailUrl: "",
        images: [],
    });

    useEffect(() => {
        if (mode === "edit") {
            (async () => {
                const p = await getProduct(id);
                if (!p) return;
                setForm({
                    title: p.title,
                    subtitle: p.subtitle,
                    description: p.description,
                    priceText: p.priceText,
                    region: p.region,
                    thumbnailUrl: p.thumbnailUrl,
                    images: p.images,
                });
            })();
        } else {
            setForm((f) => ({
                ...f,
                thumbnailUrl:
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
                images: [
                    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=60",
                ],
            }));
        }
    }, [mode, id]);

    const title = useMemo(() => (mode === "create" ? "새 상품 등록" : "상품 수정"), [mode]);

    const save = useMutation({
        mutationFn: async () => {
            if (mode === "create") return createProduct(form);
            return updateProduct(id, form);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            nav("/admin/products");
        },
    });

    return (
        <div>
            <div className="text-xl font-semibold">{title}</div>
            <div className="mt-2 text-sm text-neutral-300">
                썸네일/이미지 URL은 나중에 업로더로 바꿀 수 있습니다.
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                    <Field label="제목">
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                        />
                    </Field>

                    <Field label="부제">
                        <input
                            value={form.subtitle}
                            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                        />
                    </Field>

                    <Field label="지역">
                        <select
                            value={form.region}
                            onChange={(e) => setForm({ ...form, region: e.target.value })}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                        >
                            {["일본", "제주", "동남아", "유럽"].map((x) => (
                                <option key={x} value={x}>{x}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="가격 텍스트">
                        <input
                            value={form.priceText}
                            onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                        />
                    </Field>

                    <Field label="썸네일 URL">
                        <input
                            value={form.thumbnailUrl}
                            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                        />
                    </Field>
                </div>

                <div className="space-y-3">
                    <Field label="상세 설명">
            <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={10}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
            />
                    </Field>

                    <Field label="이미지 URL들(줄바꿈으로 입력)">
            <textarea
                value={form.images.join("\n")}
                onChange={(e) =>
                    setForm({
                        ...form,
                        images: e.target.value
                            .split("\n")
                            .map((x) => x.trim())
                            .filter(Boolean),
                    })
                }
                rows={5}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
            />
                    </Field>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => nav("/admin/products")}
                            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => save.mutate()}
                            className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-2 text-sm text-neutral-300">{label}</div>
            {children}
        </div>
    );
}
