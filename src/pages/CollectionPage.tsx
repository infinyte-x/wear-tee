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

            // Fetch linked page content if exists, otherwise use collection-template
            if (collectionData.page_id) {
                const { data: page } = await supabase
                    .from('pages')
                    .select('id, content, meta_title, meta_description')
                    .eq('id', collectionData.page_id)
                    .single();

                if (page) {
                    setPageData(page as PageData);
                }
            } else {
                // Fallback to collection-template page for all collections
                const { data: templatePage } = await supabase
                    .from('pages')
                    .select('id, content, meta_title, meta_description')
                    .eq('slug', 'collection-template')
                    .single();

                if (templatePage) {
                    setPageData(templatePage as PageData);
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
                <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20">
                    <div className="animate-pulse space-y-8">
                        <div className="h-4 w-1/4 bg-neutral-100" />
                        <div className="h-6 w-1/2 bg-neutral-100" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-[3/4] bg-neutral-100" />
                                    <div className="h-3 w-3/4 bg-neutral-100" />
                                    <div className="h-3 w-1/4 bg-neutral-100" />
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
                <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20 text-center">
                    <h1 className="text-[1rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-4">Collection Not Found</h1>
                    <p className="text-[0.75rem] text-[#666666]">The collection you're looking for doesn't exist.</p>
                </main>
                <Footer />
            </div>
        );
    }

    // Check if there's a collection-grid block in the page content
    const hasCollectionGridBlock = blocks.some(b => b.type === 'collection-grid');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar cartCount={cartCount} />

            <main className="flex-1 pt-20">
                {/* Render blocks before product grid - with collection context */}
                {beforeBlocks.map((block) => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        collectionId={collection.id}
                        collectionSlug={collection.slug}
                        collectionTitle={collection.title}
                        collectionDescription={collection.description || ''}
                        collectionImage={collection.image || ''}
                    />
                ))}

                {/* Hardcoded Product Grid - only show if no collection-grid block exists */}
                {!hasCollectionGridBlock && (
                    <div className="w-full px-4 md:px-6 lg:px-8 pb-16">
                        {/* Show collection title if no hero block in template */}
                        {beforeBlocks.length === 0 && (
                            <div className="mb-8 py-4">
                                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#666666] mb-2">
                                    Collection
                                </p>
                                <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-2">{collection.title}</h1>
                                {collection.description && (
                                    <p className="text-[0.75rem] text-[#666666] max-w-2xl">
                                        {collection.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-[0.75rem] text-[#666666]">No products in this collection yet.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[0.65rem] tracking-[0.1em] uppercase text-[#666666] mb-4">
                                    {products.length} product{products.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
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
                )}

                {/* Render blocks after product grid */}
                {afterBlocks.map((block) => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        collectionId={collection.id}
                        collectionSlug={collection.slug}
                        collectionTitle={collection.title}
                        collectionDescription={collection.description || ''}
                        collectionImage={collection.image || ''}
                    />
                ))}
            </main>

            <Footer />
        </div>
    );
};

export default CollectionPage;
