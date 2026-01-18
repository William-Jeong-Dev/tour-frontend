export type Product = {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    priceText: string;
    region: string;
    thumbnailUrl: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
};

export type ProductUpsert = Omit<Product, "id" | "createdAt" | "updatedAt">;
