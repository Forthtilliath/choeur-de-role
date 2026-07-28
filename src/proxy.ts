import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  getMemberOnboarding,
  getMemberAdminOnboarding,
} from '@/components/features/membres/queries';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isPrivateRoute = pathname.startsWith('/choristes');

  if (isPrivateRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Onboarding guard — skip the onboarding pages themselves to avoid redirect loops
  if (isPrivateRoute && user) {
    const isOnboardingPage =
      pathname === '/choristes/bienvenue' || pathname === '/choristes/admin/bienvenue';

    if (!isOnboardingPage) {
      const memberOnboarded = request.cookies.get('mbr_onboarded')?.value === '1';
      const adminOnboarded = request.cookies.get('admin_onboarded')?.value === '1';

      if (!memberOnboarded) {
        // Cookie absent: hit the DB once per session/device
        const member = await getMemberOnboarding(supabase, user.sub);

        if (!member?.onboarded_at) {
          return NextResponse.redirect(new URL('/choristes/bienvenue', request.url));
        }

        // Cache result in a cookie to skip DB on subsequent requests
        supabaseResponse.cookies.set('mbr_onboarded', '1', {
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
        });

        if (
          pathname.startsWith('/choristes/admin') &&
          !member.admin_onboarded_at &&
          (member.role === 'admin' || member.role === 'super_admin')
        ) {
          return NextResponse.redirect(new URL('/choristes/admin/bienvenue', request.url));
        }

        if (member.admin_onboarded_at) {
          supabaseResponse.cookies.set('admin_onboarded', '1', {
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
          });
        }
      } else if (pathname.startsWith('/choristes/admin') && !adminOnboarded) {
        // Member is onboarded but admin cookie not cached yet
        const member = await getMemberAdminOnboarding(supabase, user.sub);

        if (
          member &&
          !member.admin_onboarded_at &&
          (member.role === 'admin' || member.role === 'super_admin')
        ) {
          return NextResponse.redirect(new URL('/choristes/admin/bienvenue', request.url));
        }

        if (member?.admin_onboarded_at) {
          supabaseResponse.cookies.set('admin_onboarded', '1', {
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
          });
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
