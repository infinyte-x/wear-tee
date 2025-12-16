
-- Insert default homepage if it doesn't exist
INSERT INTO public.pages (slug, title, is_home, status, content)
VALUES (
    'home', 
    'Home', 
    true, 
    'published',
    '[
        {
            "id": "hero-1",
            "type": "hero",
            "content": {
                "title": "Minimalist Elegance",
                "subtitle": "Discover our new collection of premium essentials.",
                "buttonText": "Shop Collection",
                "buttonLink": "/products"
            }
        },
        {
            "id": "features-1",
            "type": "features",
            "content": {
                "items": [
                    { "title": "Quality", "description": "Best materials", "icon": "Star" },
                    { "title": "Shipping", "description": "Fast delivery", "icon": "Truck" },
                    { "title": "Secure", "description": "Safe payments", "icon": "Shield" }
                ]
            }
        },
        {
            "id": "products-1",
            "type": "product-grid",
            "content": {
                "title": "Featured Pieces",
                "subtitle": "Curated Selection",
                "limit": 4,
                "featuredOnly": true
            }
        },
        {
            "id": "newsletter-1",
            "type": "newsletter",
            "content": {
                "title": "Stay in the Know",
                "description": "Subscribe to receive exclusive access to new collections."
            }
        }
    ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
