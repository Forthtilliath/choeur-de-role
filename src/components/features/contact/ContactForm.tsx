'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/utils/phoneHelpers';

const CATEGORIES = [
  {
    value: 'rejoindre',
    label: '🎵 Rejoindre la chorale',
    description: 'Vous souhaitez chanter avec nous',
  },
  {
    value: 'partenariat',
    label: '🤝 Devenir partenaire',
    description: 'Soutenir le Chœur de Rôle',
  },
  { value: 'autre', label: '💬 Autre demande', description: 'Toute autre question' },
];

const VALID_SUBJECTS = ['rejoindre', 'partenariat', 'autre'] as const;

export function ContactForm() {
  const searchParams = useSearchParams();
  const sujet = searchParams.get('sujet') ?? 'rejoindre';
  const initialCategory = VALID_SUBJECTS.includes(sujet as (typeof VALID_SUBJECTS)[number]) ? sujet : '';
  const [category, setCategory] = useState(initialCategory);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSending(true);
    setError('');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message,
      }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      setError('Une erreur est survenue, veuillez réessayer.');
    }

    setSending(false);
  }

  if (success) {
    return (
      <div className="text-center py-8 md:py-16">
        <p className="text-4xl mb-4">✉️</p>
        <h2 className="text-xl font-medium mb-2 text-foreground">Message envoyé !</h2>
        <p className="text-foreground/60">
          Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Catégorie */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Objet de votre message</label>
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                category === cat.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div>
                <p
                  className={`text-sm font-medium ${category === cat.value ? 'text-primary' : 'text-foreground'}`}
                >
                  {cat.label}
                </p>
                <p className="text-xs text-foreground/50">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nom / Prénom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Prénom</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Marie"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Nom</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Dupont"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          placeholder="marie.dupont@email.fr"
        />
      </div>

      {/* Téléphone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">
          Téléphone <span className="text-foreground/40 font-normal">(optionnel)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          placeholder="06 12 34 56 78"
          maxLength={14}
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="border border-border rounded-lg px-4 py-2 text-sm bg-background resize-none"
          placeholder="Votre message..."
        />
      </div>

      {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

      <Button type="submit" disabled={sending || !category} loading={sending}>
        {sending ? 'Envoi en cours...' : 'Envoyer le message'}
      </Button>
    </form>
  );
}
