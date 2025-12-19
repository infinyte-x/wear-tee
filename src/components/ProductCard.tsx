import { Link } from "@tanstack/react-router";
import { ShoppingBag, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  onSale?: boolean;
  originalPrice?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  isNew,
  onSale,
  originalPrice
}: ProductCardProps) => {
  return (
    <Link to="/product/$id" params={{ id }} className="group block">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone aspect-[3/4] mb-4 rounded-sm">
        {/* Image with zoom effect */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-3">
            <div className="bg-cream/90 backdrop-blur-sm p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-cream hover:scale-110 cursor-pointer">
              <Eye className="h-5 w-5 text-charcoal" />
            </div>
            <div className="bg-cream/90 backdrop-blur-sm p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150 hover:bg-cream hover:scale-110 cursor-pointer">
              <ShoppingBag className="h-5 w-5 text-charcoal" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-charcoal text-cream text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm">
              New
            </span>
          )}
          {onSale && (
            <span className="bg-accent text-accent-foreground text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
          {category}
        </p>
        <h3 className="font-serif text-lg tracking-tight transition-all duration-300 line-clamp-2 group-hover:opacity-80 group-hover:underline underline-offset-4 decoration-1">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm",
            onSale ? "text-accent font-medium" : "text-muted-foreground"
          )}>
            ${price.toFixed(2)}
          </p>
          {onSale && originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

