import { redirect } from 'next/navigation';
import { ActivityTracker } from '@/components/features/auth/ActivityTracker';
import { checkActiveSeasonEnrollment, getUserQuery } from '@/lib/auth';

export default async function ChoristesLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserQuery();

  if (!user.isLoggedIn) {
    redirect('/login');
  }

  // isCa couvre à la fois les CA et les admins — ils sont toujours autorisés
  if (!user.isCa) {
    const isEnrolled = await checkActiveSeasonEnrollment(user.id);
    if (!isEnrolled) {
      redirect('/non-inscrit');
    }
  }

  return (
    <>
      <ActivityTracker />
      {children}
    </>
  );
}
