import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Moon, Sun, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const basePath = language === 'en' ? '/en' : '/bn';

  const navLinks = [
    { label: t.nav.home, href: basePath || '/' },
    {
      label: t.nav.services,
      children: [
        { label: t.nav.domainHosting, href: `${basePath}/services/domain-hosting` },
        { label: t.nav.webDevelopment, href: `${basePath}/services/web-development` },
        { label: t.nav.softwareDevelopment, href: `${basePath}/services/software-development` },
        { label: t.nav.digitalMarketing, href: `${basePath}/services/digital-marketing` },
      ],
    },
    { label: t.nav.pricing, href: `${basePath}/pricing` },
    { label: t.nav.blog, href: `${basePath}/blog` },
    { label: t.nav.locations, href: `${basePath}/locations` },
    { label: t.nav.about, href: `${basePath}/about` },
    { label: t.nav.contact, href: `${basePath}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={basePath || '/'} className="flex items-center gap-2">
          <img src={logo} alt="DigiWebDex" className="h-10 w-auto" />
          <span className="font-bold text-xl">DigiWebDex</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <div key={index}>
              {link.children ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1">
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {link.children.map((child, childIndex) => (
                      <DropdownMenuItem key={childIndex} asChild>
                        <Link to={child.href} className="w-full cursor-pointer">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" asChild>
                  <Link to={link.href}>{link.label}</Link>
                </Button>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage('bn')}
                className={cn(language === 'bn' && 'bg-accent')}
              >
                বাংলা
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={cn(language === 'en' && 'bg-accent')}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* CTA Button - Desktop */}
          <Button className="hidden md:flex gradient-button">
            {t.nav.orderNow}
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                {/* Mobile Language Switcher */}
                <div className="flex gap-2 pb-4 border-b">
                  <Button
                    variant={language === 'bn' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('bn')}
                    className="flex-1"
                  >
                    বাংলা
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('en')}
                    className="flex-1"
                  >
                    English
                  </Button>
                </div>

                {/* Mobile Nav Links */}
                {navLinks.map((link, index) => (
                  <div key={index}>
                    {link.children ? (
                      <div className="space-y-2">
                        <span className="font-medium text-muted-foreground">
                          {link.label}
                        </span>
                        <div className="pl-4 space-y-2">
                          {link.children.map((child, childIndex) => (
                            <SheetClose key={childIndex} asChild>
                              <Link
                                to={child.href}
                                className="block py-2 text-foreground hover:text-primary transition-colors"
                              >
                                {child.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          to={link.href}
                          className="block py-2 font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                ))}

                {/* Mobile CTA */}
                <Button className="mt-4 gradient-button w-full">
                  {t.nav.orderNow}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
