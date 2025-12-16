
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    featured: boolean;
}

export function ProductGridBlock({ content }: { content: any }) {
    const [products, setProducts] = useState<Product[]>([]);

    // Default to showing 4 featured products
    const limit = content.limit || 4;
    const showFeaturedOnly = content.featuredOnly !== false; // default true

    useEffect(() => {
        const fetchProducts = async () => {
            let query = supabase.from("products").select("*").limit(limit);

            if (showFeaturedOnly) {
                query = query.eq("featured", true);
            }

            const { data } = await query;
            if (data) setProducts(data);
        };

        fetchProducts();
    }, [limit, showFeaturedOnly]);

    return (
        <section className="container mx-auto px-6 py-24">
            {content.title && (
                <div className="mb-16 text-center fade-in">
                    <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">{content.subtitle || "Curated Selection"}</p>
                    <h2 className="text-4xl md:text-5xl font-serif mb-4">{content.title}</h2>
                    {content.description && (
                        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {content.description}
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.images[0]}
                        category={product.category}
                    />
                ))}
            </div>
        </section>
    );
}
