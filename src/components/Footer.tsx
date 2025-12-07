import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="text-3xl font-serif tracking-wide">
              ATELIER
            </Link>
            <p className="text-warm-grey leading-relaxed max-w-md">
              Crafting timeless pieces that transcend seasons. Our commitment to quality 
              and understated elegance defines every garment we create.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-xs tracking-widest uppercase">Navigation</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/products" className="text-warm-grey hover:text-cream transition-colors">
                Shop All
              </Link>
              <Link to="/products?category=Outerwear" className="text-warm-grey hover:text-cream transition-colors">
                Outerwear
              </Link>
              <Link to="/products?category=Knitwear" className="text-warm-grey hover:text-cream transition-colors">
                Knitwear
              </Link>
              <Link to="/products?category=Tailoring" className="text-warm-grey hover:text-cream transition-colors">
                Tailoring
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-xs tracking-widest uppercase">Support</h4>
            <nav className="flex flex-col gap-3">
              <span className="text-warm-grey hover:text-cream transition-colors cursor-pointer">
                Contact Us
              </span>
              <span className="text-warm-grey hover:text-cream transition-colors cursor-pointer">
                Shipping & Returns
              </span>
              <span className="text-warm-grey hover:text-cream transition-colors cursor-pointer">
                Size Guide
              </span>
              <span className="text-warm-grey hover:text-cream transition-colors cursor-pointer">
                Care Instructions
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-warm-grey/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warm-grey">
            © 2024 Atelier. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-warm-grey">
            <span className="hover:text-cream transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-cream transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
