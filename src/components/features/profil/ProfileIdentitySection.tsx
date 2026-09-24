import { formatPhone } from '@/utils/phoneHelpers';

import type { ProfileFormValues } from './profileForm';
import type { MemberProfile } from './types';

const SECTION_CLASS = 'flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background';
const INPUT_CLASS = 'border border-border rounded-lg px-4 py-2 text-sm bg-background';
const READONLY_CLASS =
  'text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary';

type Props = {
  member: MemberProfile;
  values: ProfileFormValues;
  onChangeAction: (patch: Partial<ProfileFormValues>) => void;
};

// Sections « Identité » et « Contact » ; pupitre et email restent gérés par un administrateur
export function ProfileIdentitySection({ member, values, onChangeAction }: Props) {
  return (
    <>
      <div className={SECTION_CLASS}>
        <h2 className="text-sm font-medium text-foreground">Identité</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-first-name" className="text-xs text-foreground/50">
              Prénom
            </label>
            <input
              id="profile-first-name"
              value={values.firstName}
              onChange={(e) => onChangeAction({ firstName: e.target.value })}
              className={INPUT_CLASS}
              placeholder="Marie"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-last-name" className="text-xs text-foreground/50">
              Nom
            </label>
            <input
              id="profile-last-name"
              value={values.lastName}
              onChange={(e) => onChangeAction({ lastName: e.target.value })}
              className={INPUT_CLASS}
              placeholder="Dupont"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-birthday" className="text-xs text-foreground/50">
              Date de naissance
            </label>
            <input
              id="profile-birthday"
              type="date"
              value={values.birthday}
              onChange={(e) => onChangeAction({ birthday: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground/50">Pupitre</span>
            <p className={READONLY_CLASS}>{member.voice_parts?.name ?? 'Non défini'}</p>
            <p className="text-xs text-foreground/30">Le pupitre est géré par un administrateur.</p>
          </div>
        </div>
      </div>

      <div className={SECTION_CLASS}>
        <h2 className="text-sm font-medium text-foreground">Contact</h2>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-foreground/50">Email</span>
          <p className={READONLY_CLASS}>{member.email ?? 'Non défini'}</p>
          <p className="text-xs text-foreground/30">L&apos;email est géré par un administrateur.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="profile-phone" className="text-xs text-foreground/50">
            Téléphone
          </label>
          <input
            id="profile-phone"
            value={values.phone}
            onChange={(e) => onChangeAction({ phone: formatPhone(e.target.value) })}
            type="tel"
            inputMode="numeric"
            className={INPUT_CLASS}
            placeholder="06 12 34 56 78"
            maxLength={14}
          />
        </div>
      </div>
    </>
  );
}
