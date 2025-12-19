import { Link } from "@tanstack/react-router";
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
      {/* Image Container - Clean, no rounded corners */}
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        {/* Image with subtle scale on hover */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges - Top left */}
        {(isNew || onSale) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <span className="bg-[#181818] text-white text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                New
              </span>
            )}
            {onSale && (
              <span className="bg-[#181818] text-white text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                Sale
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info - Minimal typography */}
      <div className="pt-3 pb-4 px-1">
        {/* Product Name */}
        <h3 className="text-[0.75rem] uppercase tracking-[0.05em] font-normal text-[#181818] leading-tight line-clamp-2 mb-1">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-[0.75rem] tracking-[0.05em]",
            onSale ? "text-[#181818]" : "text-[#666666]"
          )}>
            ${price.toFixed(2)}
          </p>
          {onSale && originalPrice && (
            <p className="text-[0.75rem] tracking-[0.05em] text-[#999999] line-through">
              ${originalPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
