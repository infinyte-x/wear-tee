-- Seed test orders for admin panel verification
-- Note: These are test orders, can be deleted after verification

-- First, get a product ID to use (assuming products exist)
DO $$
DECLARE
  v_product_id uuid;
  v_product_name text;
  v_product_price numeric;
  v_order_id uuid;
BEGIN
  -- Get first available product
  SELECT id, name, price INTO v_product_id, v_product_name, v_product_price 
  FROM products LIMIT 1;

  -- Create test order 1 - Pending
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, notes, created_at
  ) VALUES (
    gen_random_uuid(), 'pending', 868.00, '01643245184', 
    'Dhaka', 'Dhaka', 'Badda',
    'House 12, Road 5, Badda', 'Please call before delivery',
    NOW() - INTERVAL '1 hour'
  ) RETURNING id INTO v_order_id;

  -- Add order items for order 1
  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, size, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - White', 434.00, 2, NULL, 'White');
  END IF;

  -- Create test order 2 - Confirmed
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'confirmed', 500.00, '01540789769', 
    'Dhaka', 'Gazipur', 'Gazipur, Dhaka, Bangladesh',
    'Main Road, Gazipur',
    NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Blue', 500.00, 1, 'Blue');
  END IF;

  -- Create test order 3 - Pending (larger order)
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'pending', 1327.00, '01634330581', 
    'Dhaka', 'Mirpur', '82/1, Kusumbagh R/A, North Bishil, Shahali, Mirpur',
    'Near mosque',
    NOW() - INTERVAL '3 hours'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Black', 442.33, 3, 'Black');
  END IF;

  -- Create test order 4 - Confirmed
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'confirmed', 529.00, '01770563079', 
    'Rajbari', 'Rajbari', 'whftxb',
    'Central area',
    NOW() - INTERVAL '4 hours'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Black', 529.00, 1, 'Black');
  END IF;

  -- Create test order 5 - Cancelled
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'cancelled', 469.00, '01794494949', 
    'Dhaka', 'Dhaka', 'estastawe',
    'Test address',
    NOW() - INTERVAL '5 hours'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Black', 469.00, 1, 'Black');
  END IF;

  -- Create test order 6 - Pending
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'pending', 469.00, '01700000000', 
    'Dhaka', 'Dhaka', 'A',
    'Address A',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Black', 469.00, 1, 'Black');
  END IF;

  -- Create test order 7 - Pending
  INSERT INTO orders (
    id, status, total, phone, division, district, area, 
    shipping_address, created_at
  ) VALUES (
    gen_random_uuid(), 'pending', 500.00, '01405550703', 
    'Dhaka', 'Dhaka', 'Dhaka',
    'Test location',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_order_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, color)
    VALUES (v_order_id, v_product_id, 'Smart Cup Flask With LED Temperature Display Hot and Cold Mode - Blue', 500.00, 1, 'Blue');
  END IF;

END $$;
