import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  // Dynamic social links
  const socialLinks = [
    { icon: Instagram, href: settings?.instagram_url, label: "Instagram" },
    { icon: Facebook, href: settings?.facebook_url, label: "Facebook" },
    { icon: Twitter, href: settings?.twitter_url || settings?.tiktok_url, label: "Twitter/X" },
    { icon: Mail, href: settings?.shop_email ? `mailto:${settings.shop_email}` : null, label: "Email" },
  ].filter(link => link.href); // Only show links that exist

  // Dynamic navigation links from settings
  const navLinks = (settings?.navigation_items && settings.navigation_items.length > 0)
    ? settings.navigation_items.map(item => ({
      to: item.href,
      label: item.label,
    }))
    : [
      { to: "/products", label: "Shop All" },
      { to: "/collections", label: "Collections" },
      { to: "/about", label: "About" },
    ];

  // Support links (can be made dynamic later with footer_links setting)
  const supportLinks = [
    { to: "/contact", label: "Contact Us" },
    { to: "/shipping", label: "Shipping & Returns" },
    { to: "/size-guide", label: "Size Guide" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="text-3xl font-serif tracking-wide hover:opacity-80 transition-opacity">
              {settings?.store_name?.toUpperCase() || 'ATELIER'}
            </Link>
            <p className="text-warm-grey text-sm leading-relaxed max-w-xs">
              {settings?.seo_description || "Crafting timeless pieces that transcend seasons. Our commitment to quality and understated elegance defines every garment we create."}
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-full border border-warm-grey/30 text-warm-grey hover:text-cream hover:border-cream hover:scale-110 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium">Shop</h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-warm-grey text-sm hover:text-cream transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium">Support</h4>
            <nav className="flex flex-col gap-3">
              {supportLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-warm-grey text-sm hover:text-cream transition-colors duration-300 hover:translate-x-1 transform inline-block"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium">
              {settings?.footer_newsletter_title || 'Newsletter'}
            </h4>
            <p className="text-warm-grey text-sm leading-relaxed">
              {settings?.footer_newsletter_text || "Subscribe to receive updates, access to exclusive deals, and more."}
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border border-warm-grey/30 px-4 py-3 text-sm text-cream placeholder:text-warm-grey/60 focus:border-cream focus:outline-none transition-colors duration-300"
              />
              <button
                type="submit"
                className="bg-cream text-charcoal text-xs tracking-widest uppercase py-3 px-6 hover:bg-cream/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-warm-grey/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-warm-grey">
              {settings?.footer_copyright_text || `© ${currentYear} ${settings?.store_name || 'Atelier'}. All rights reserved.`}
            </p>
            <div className="flex gap-6 text-sm text-warm-grey">
              <span className="hover:text-cream transition-colors duration-300 cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-cream transition-colors duration-300 cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-cream transition-colors duration-300 cursor-pointer">
                Cookies
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

