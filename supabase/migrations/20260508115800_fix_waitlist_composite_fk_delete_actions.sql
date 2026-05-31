begin;

alter table public.waitlist_entries
  drop constraint if exists waitlist_entries_staff_tenant_fkey,
  drop constraint if exists waitlist_entries_offered_booking_tenant_fkey;

alter table public.waitlist_entries
  add constraint waitlist_entries_staff_tenant_fkey foreign key (staff_id, tenant_id)
    references public.staff(id, tenant_id),
  add constraint waitlist_entries_offered_booking_tenant_fkey foreign key (offered_booking_id, tenant_id)
    references public.bookings(id, tenant_id);

commit;
