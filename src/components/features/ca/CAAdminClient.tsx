'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MeetingForm } from './MeetingForm';
import { formatDate } from '@/utils/dateHelpers';
import { deleteMeeting, toggleMeetingPublished } from './clientQueries';
import { CaMeeting } from './types';

export function CAAdminClient({ initialMeetings }: { initialMeetings: CaMeeting[] }) {
  const [meetings, setMeetings] = useState<CaMeeting[]>(initialMeetings);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<CaMeeting | null>(null);
  const confirm = useConfirm();

  function handleSave(meeting: CaMeeting) {
    setMeetings((prev) => {
      const exists = prev.find((m) => m.id === meeting.id);
      return exists ? prev.map((m) => (m.id === meeting.id ? meeting : m)) : [meeting, ...prev];
    });
    setShowForm(false);
    setEditingMeeting(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingMeeting(null);
            setShowForm(true);
          }}
        >
          + Ajouter un compte-rendu
        </Button>
      </div>

      {showForm && (
        <MeetingForm
          key={editingMeeting?.id ?? 'new'}
          meeting={editingMeeting}
          onCloseAction={() => {
            setShowForm(false);
            setEditingMeeting(null);
          }}
          onSaveAction={handleSave}
        />
      )}

      {meetings.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucun compte-rendu pour le moment.</p>
      )}

      <div className="flex flex-col gap-3">
        {meetings.map((meeting) => {
          const date = formatDate(meeting.meeting_date);

          return (
            <div
              key={meeting.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                  {meeting.pdf_url && (
                    <Link
                      href={meeting.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground/40 hover:text-primary transition-colors"
                    >
                      📄 PDF
                    </Link>
                  )}
                </div>
                <p className="text-xs text-foreground/50 mt-0.5">{date}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                  meeting.published
                    ? 'bg-primary/10 text-primary'
                    : 'bg-foreground/10 text-foreground/40'
                }`}
              >
                {meeting.published ? 'Publié' : 'Brouillon'}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingMeeting(meeting);
                    setShowForm(true);
                  }}
                >
                  <span className="sm:hidden">✏️</span>
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const ok = await toggleMeetingPublished(meeting.id, !meeting.published);
                    if (ok) {
                      setMeetings((prev) =>
                        prev.map((m) =>
                          m.id === meeting.id ? { ...m, published: !m.published } : m,
                        ),
                      );
                      toast.success(meeting.published ? 'Compte-rendu dépublié' : 'Compte-rendu publié');
                    } else {
                      toast.error('Erreur lors de la mise à jour');
                    }
                  }}
                >
                  <span className="sm:hidden">{meeting.published ? '🙈' : '👁️'}</span>
                  <span className="hidden sm:inline">{meeting.published ? 'Dépublier' : 'Publier'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    if (!await confirm({
                      message: 'Supprimer ce compte-rendu ?',
                      danger: true,
                      details: { icon: '📋', label: meeting.title, sublabel: date },
                    })) return;
                    const ok = await deleteMeeting(meeting.id);
                    if (ok) {
                      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
                      toast.success('Compte-rendu supprimé');
                    } else {
                      toast.error('Erreur lors de la suppression');
                    }
                  }}
                >
                  <span className="sm:hidden">🗑</span>
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
