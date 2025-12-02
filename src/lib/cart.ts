export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

const CART_KEY = "atelier_cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (item: Omit<CartItem, "id" | "quantity">, size?: string, color?: string) => {
  const cart = getCart();
  const existingItem = cart.find(
    (i) => i.productId === item.productId && i.size === size && i.color === color
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...item,
      id: `${item.productId}-${size}-${color}-${Date.now()}`,
      size,
      color,
      quantity: 1,
    });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (itemId: string) => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (itemId: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartCount = (cart: CartItem[]) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
