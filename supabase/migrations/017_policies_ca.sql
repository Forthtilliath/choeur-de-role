alter policy "Admins can manage links"
on "public"."member_links"
rename to "CA and Admins can manage links";

alter policy "CA and Admins can manage links"
on "public"."member_links"
to authenticated
using (get_my_role() in ('ca', 'admin', 'super_admin'));

alter policy "Admins can manage ca meetings"
on "public"."ca_meetings"
rename to "CA and Admins can manage ca meetings";

alter policy "CA and Admins can manage ca meetings"
on "public"."ca_meetings"
to authenticated
using (get_my_role() in ('ca', 'admin', 'super_admin'));