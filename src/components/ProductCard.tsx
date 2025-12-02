import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ id, name, price, image, category }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="relative overflow-hidden bg-stone aspect-[3/4] mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />
      </div>
      
      <div className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          {category}
        </p>
        <h3 className="font-serif text-lg tracking-tight group-hover:text-accent transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">
          ${price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
