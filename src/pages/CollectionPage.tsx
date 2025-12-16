import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { BlockData } from "@/components/builder/types";
import { getCart, getCartCount } from "@/lib/cart";

const routeApi = getRouteApi('/collections/$slug');

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
}

interface Collection {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_visible: boolean | null;
    page_id: string | null;
}

interface PageData {
    id: string;
    content: BlockData[] | null;
    meta_title: string | null;
    meta_description: string | null;
}

const CollectionPage = () => {
    const { slug } = routeApi.useParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [pageData, setPageData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchCollectionData();
        setCartCount(getCartCount(getCart()));
    }, [slug]);

    const fetchCollectionData = async () => {
        try {
            setLoading(true);

            // Fetch collection by slug
            const { data: collectionData, error: collectionError } = await supabase
                .from('collections')
                .select('*')
                .eq('slug', slug)
                .single();

            if (collectionError) throw collectionError;
            setCollection(collectionData);

            // Fetch linked page content if exists
            if (collectionData.page_id) {
                const { data: page } = await supabase
                    .from('pages')
                    .select('id, content, meta_title, meta_description')
                    .eq('id', collectionData.page_id)
                    .single();

                if (page) {
                    setPageData(page as PageData);
                }
            }

            // Fetch products in this collection
            const { data: productLinks, error: linkError } = await supabase
                .from('product_collections')
                .select('product_id')
                .eq('collection_id', collectionData.id);

            if (linkError) throw linkError;

            if (productLinks && productLinks.length > 0) {
                const productIds = productLinks.map(link => link.product_id);

                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('id, name, price, images, category')
                    .in('id', productIds);

                if (productsError) throw productsError;
                setProducts(productsData || []);
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get blocks to render before and after the product grid
    const blocks = (pageData?.content as BlockData[]) || [];
    const productGridIndex = blocks.findIndex(b => b.type === 'product-grid');
    const beforeBlocks = productGridIndex > 0 ? blocks.slice(0, productGridIndex) : [];
    const afterBlocks = productGridIndex >= 0 ? blocks.slice(productGridIndex + 1) : blocks;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar cartCount={cartCount} />
                <main className="flex-1 container mx-auto px-6 py-16 pt-24">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-1/3 bg-muted rounded" />
                        <div className="h-6 w-2/3 bg-muted rounded" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="aspect-[3/4] bg-muted rounded" />
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-3 w-1/4 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar cartCount={cartCount} />
                <main className="flex-1 container mx-auto px-6 py-16 pt-24 text-center">
                    <h1 className="text-3xl font-serif mb-4">Collection Not Found</h1>
                    <p className="text-muted-foreground">The collection you're looking for doesn't exist.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar cartCount={cartCount} />

            <main className="flex-1 pt-20">
                {/* Render blocks before product grid */}
                {beforeBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}

                {/* Collection Header (if no custom blocks) */}
                {beforeBlocks.length === 0 && (
                    <div className="container mx-auto px-6 py-16">
                        <div className="mb-12 fade-in">
                            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                                Collection
                            </p>
                            <h1 className="text-5xl md:text-6xl font-serif mb-4">{collection.title}</h1>
                            {collection.description && (
                                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                                    {collection.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="container mx-auto px-6 pb-16">
                    {products.length === 0 ? (
                        <div className="text-center py-20 fade-in">
                            <p className="text-muted-foreground">No products in this collection yet.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-6">
                                {products.length} product{products.length !== 1 ? 's' : ''}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 stagger-children">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        image={product.images?.[0]}
                                        category={product.category}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Render blocks after product grid */}
                {afterBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}
            </main>

            <Footer />
        </div>
    );
};

export default CollectionPage;
