import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { DIGIWEBDEX_CONTACT } from '@/services/contactService';
import { cn } from '@/lib/utils';

export function WhatsAppChatWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const defaultMessages = language === 'bn'
    ? [
        'ওয়েবসাইট তৈরি করতে চাই',
        'হোস্টিং প্যাকেজ সম্পর্কে জানতে চাই',
        'সফটওয়্যার ডেভেলপমেন্ট দরকার',
        'প্রাইসিং জানতে চাই',
      ]
    : [
        'I need a website',
        'Hosting packages info',
        'Software development inquiry',
        'Pricing information',
      ];

  const sendMessage = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${DIGIWEBDEX_CONTACT.whatsapp}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 left-6 z-50 hidden md:block">
      {/* Chat Window */}
      <div
        className={cn(
          'absolute bottom-16 left-0 w-80 rounded-2xl shadow-2xl border bg-background overflow-hidden transition-all duration-300 origin-bottom-left',
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-emerald-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">DigiWebDex</p>
                <p className="text-xs text-white/80">
                  {language === 'bn' ? 'সাধারণত ৫ মিনিটে উত্তর দেয়' : 'Typically replies in 5 min'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {language === 'bn'
              ? 'হ্যালো! 👋 কীভাবে সাহায্য করতে পারি?'
              : 'Hello! 👋 How can we help you?'}
          </p>

          {/* Quick Replies */}
          <div className="space-y-2">
            {defaultMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => sendMessage(msg)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Custom Message */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) sendMessage(message.trim());
            }}
            className="flex gap-2 pt-2 border-t"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
              className="flex-1 h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full shadow-xl transition-all',
          isOpen
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-2xl hover:shadow-emerald-500/30'
        )}
        aria-label="WhatsApp Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>
    </div>
  );
}
