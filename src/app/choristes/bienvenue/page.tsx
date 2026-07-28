import { redirect } from 'next/navigation';
import { handlePageAccess } from '@/lib/auth';
import { ChoristeOnboarding } from '@/components/features/onboarding/ChoristeOnboarding';
import { getMemberForOnboarding } from '@/components/features/onboarding/queries';
import { formatPhone } from '@/utils/phoneHelpers';
import type { BirthdayVisibility } from '@/components/features/profil/types';

export const metadata = { title: 'Bienvenue' };

export default async function ChoristerBienvenuePage() {
  const user = await handlePageAccess();
  const member = await getMemberForOnboarding(user.id);

  if (member?.onboarded_at) redirect('/choristes');

  const firstName = member?.first_name ?? 'Choriste';
  const initialPhone = member?.phone ? formatPhone(member.phone.replace(/\D/g, '')) : '';
  const initialBirthday = member?.birthday ? member.birthday.slice(0, 10) : '';

  return (
    <ChoristeOnboarding
      memberId={user.id}
      firstName={firstName}
      initialPhone={initialPhone}
      initialBirthday={initialBirthday}
      initialAddress={member?.address ?? ''}
      initialZipCode={member?.zip_code ?? ''}
      initialCity={member?.city ?? ''}
      initialPhotoUrl={member?.photo_url ?? ''}
      initialVisibilityEmail={member?.visibility_email ?? false}
      initialVisibilityPhone={member?.visibility_phone ?? false}
      initialVisibilityAddress={member?.visibility_address ?? false}
      initialVisibilityBirthday={(member?.visibility_birthday as BirthdayVisibility) ?? 'none'}
    />
  );
}
