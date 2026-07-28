'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const shareLinks = (encodedUrl: string, encodedTitle: string) => [
  {
    label: 'Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  },
  {
    label: 'X / Twitter',
    href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  },
  {
    label: 'WhatsApp',
    href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  },
];

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)); }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstagram = async () => {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }); } catch { /* annulé */ }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground/40 shrink-0">Partager :</span>
        {shareLinks(encodedUrl, encodedTitle).map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Partager sur ${label}`}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors no-underline"
          >
            {label}
          </a>
        ))}
        {isMobile && (
          <button
            type="button"
            onClick={handleInstagram}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Instagram
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
          {copied ? 'Copié !' : 'Copier le lien'}
        </button>
      </div>
    </div>
  );
}
