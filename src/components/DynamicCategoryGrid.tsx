import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

const DynamicCategoryGrid = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['active-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fallback categories if none exist in database
  const fallbackCategories = [
    {
      id: '1',
      name: "Outerwear",
      slug: "outerwear",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      description: "Refined layers for every season",
    },
    {
      id: '2',
      name: "Knitwear",
      slug: "knitwear",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
      description: "Luxuriously soft essentials",
    },
    {
      id: '3',
      name: "Tailoring",
      slug: "tailoring",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      description: "Impeccable craftsmanship",
    },
  ];

  const displayCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-24">
      <div className="mb-16 text-center fade-in">
        <h2 className="text-4xl md:text-5xl font-serif mb-4">Shop by Category</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore our carefully curated collections, each designed with intention and crafted to perfection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            to="/products"
            search={{ category: category.name }}
            className="group relative aspect-[3/4] overflow-hidden bg-stone hover-lift"
          >
            <img
              src={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-cream">
              <h3 className="text-2xl font-serif mb-2">{category.name}</h3>
              <p className="text-sm text-cream/70">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DynamicCategoryGrid;
