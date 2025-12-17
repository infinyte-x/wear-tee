-- Create system pages with default building blocks
-- These pages are editable via the page builder

-- Cart Page
INSERT INTO pages (title, slug, status, is_home, content, meta_title, meta_description)
VALUES (
    'Shopping Cart',
    'cart',
    'published',
    false,
    '[
        {
            "id": "cart-hero-1",
            "type": "hero",
            "content": {
                "height": "small",
                "fullWidth": true,
                "textAlign": "center",
                "contentPosition": "center",
                "overlayOpacity": 0.4,
                "slides": [
                    {
                        "title": "Shopping Cart",
                        "subtitle": "Review your items"
                    }
                ]
            }
        }
    ]'::jsonb,
    'Shopping Cart',
    'Review items in your cart and proceed to checkout'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Checkout Page
INSERT INTO pages (title, slug, status, is_home, content, meta_title, meta_description)
VALUES (
    'Checkout',
    'checkout',
    'published',
    false,
    '[
        {
            "id": "checkout-hero-1",
            "type": "hero",
            "content": {
                "height": "small",
                "fullWidth": true,
                "textAlign": "center",
                "contentPosition": "center",
                "overlayOpacity": 0.4,
                "slides": [
                    {
                        "title": "Checkout",
                        "subtitle": "Complete your order"
                    }
                ]
            }
        }
    ]'::jsonb,
    'Checkout',
    'Complete your order securely'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Wishlist Page
INSERT INTO pages (title, slug, status, is_home, content, meta_title, meta_description)
VALUES (
    'Wishlist',
    'wishlist',
    'published',
    false,
    '[
        {
            "id": "wishlist-hero-1",
            "type": "hero",
            "content": {
                "height": "small",
                "fullWidth": true,
                "textAlign": "center",
                "contentPosition": "center",
                "overlayOpacity": 0.4,
                "slides": [
                    {
                        "title": "Your Wishlist",
                        "subtitle": "Items you love"
                    }
                ]
            }
        }
    ]'::jsonb,
    'Your Wishlist',
    'View and manage your saved items'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Order Confirmation Page
INSERT INTO pages (title, slug, status, is_home, content, meta_title, meta_description)
VALUES (
    'Order Confirmation',
    'order-confirmation',
    'published',
    false,
    '[
        {
            "id": "confirmation-hero-1",
            "type": "hero",
            "content": {
                "height": "small",
                "fullWidth": true,
                "textAlign": "center",
                "contentPosition": "center",
                "overlayOpacity": 0.3,
                "slides": [
                    {
                        "title": "Thank You!",
                        "subtitle": "Your order has been placed"
                    }
                ]
            }
        }
    ]'::jsonb,
    'Order Confirmation',
    'Your order has been successfully placed'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- Collection Template Page (for category pages)
INSERT INTO pages (title, slug, status, is_home, content, meta_title, meta_description)
VALUES (
    'Collection Template',
    'collection-template',
    'published',
    false,
    '[
        {
            "id": "collection-hero-1",
            "type": "hero",
            "content": {
                "height": "medium",
                "fullWidth": true,
                "textAlign": "center",
                "contentPosition": "center",
                "overlayOpacity": 0.5,
                "slides": [
                    {
                        "title": "Collection",
                        "subtitle": "Explore our curated selection"
                    }
                ]
            }
        }
    ]'::jsonb,
    'Collection',
    'Browse our collection of products'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();
