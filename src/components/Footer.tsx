import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  // Dynamic social links
  const socialLinks = [
    { icon: Instagram, href: settings?.instagram_url, label: "Instagram" },
    { icon: Facebook, href: settings?.facebook_url, label: "Facebook" },
    { icon: Twitter, href: settings?.twitter_url || settings?.tiktok_url, label: "Twitter/X" },
  ].filter(link => link.href);

  // Navigation links
  const shopLinks = [
    { to: "/products/men", label: "Men" },
    { to: "/products/women", label: "Women" },
    { to: "/products", label: "Shop All" },
  ];

  const helpLinks = [
    { to: "/contact", label: "Contact" },
    { to: "/shipping", label: "Shipping" },
    { to: "/returns", label: "Returns" },
    { to: "/faq", label: "FAQ" },
  ];

  const companyLinks = [
    { to: "/about", label: "About" },
    { to: "/careers", label: "Careers" },
    { to: "/stores", label: "Stores" },
  ];

  return (
    <footer className="bg-[#181818] text-white">
      {/* Main Footer */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand + Newsletter */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-6">
            <Link to="/" className="text-[1rem] tracking-[0.15em] uppercase hover:opacity-80 transition-opacity">
              {settings?.store_name?.toUpperCase() || 'BRAND'}
            </Link>

            {/* Newsletter */}
            <div className="max-w-sm">
              <p className="text-[0.65rem] tracking-[0.15em] uppercase text-white/60 mb-4">
                Subscribe to our newsletter
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-[0.75rem] text-white placeholder:text-white/40 focus:border-white focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="bg-white text-[#181818] px-6 py-3 text-[0.65rem] tracking-[0.15em] uppercase hover:bg-white/90 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 pt-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-white/60">Shop</h4>
            <nav className="flex flex-col gap-2">
              {shopLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[0.75rem] tracking-[0.05em] text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-white/60">Help</h4>
            <nav className="flex flex-col gap-2">
              {helpLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[0.75rem] tracking-[0.05em] text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-white/60">Company</h4>
            <nav className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[0.75rem] tracking-[0.05em] text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.65rem] tracking-[0.1em] text-white/40">
            © {currentYear} {settings?.store_name || 'Brand'}. All rights reserved.
          </p>
          <div className="flex gap-6 text-[0.65rem] tracking-[0.1em] text-white/40">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
