import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Footer() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const quickLinks = [
    { label: t.nav.home, href: basePath || '/' },
    { label: t.nav.about, href: `${basePath}/about` },
    { label: t.nav.pricing, href: `${basePath}/pricing` },
    { label: t.nav.blog, href: `${basePath}/blog` },
    { label: t.nav.contact, href: `${basePath}/contact` },
  ];

  const serviceLinks = [
    { label: t.nav.domainHosting, href: `${basePath}/services/domain-hosting` },
    { label: t.nav.webDevelopment, href: `${basePath}/services/web-development` },
    { label: t.nav.softwareDevelopment, href: `${basePath}/services/software-development` },
    { label: t.nav.digitalMarketing, href: `${basePath}/services/digital-marketing` },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container-custom section-padding">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to={basePath || '/'} className="flex items-center gap-2">
              <img src={logo} alt="Digiwebdex" className="h-12 w-auto" />
              <span className="font-bold text-2xl">Digiwebdex</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.footer.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.footer.services}</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">{t.footer.contact}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{t.footer.address}</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 shrink-0" />
                  <a href={`mailto:${t.footer.email}`} className="hover:text-primary transition-colors">
                    {t.footer.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href={`tel:${t.footer.phone}`} className="hover:text-primary transition-colors">
                    {t.footer.phone}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-sm mb-3">{t.footer.newsletter.title}</h4>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t.footer.newsletter.placeholder}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="gradient-button shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
