begin;

create or replace view public.staff_directory_metrics
with (security_invoker = true) as
select
  staff.id,
  staff.tenant_id,
  staff.name,
  staff.bio,
  staff.user_id,
  count(distinct staff_hours.id) filter (where staff_hours.is_working)::integer as working_days_count,
  count(distinct staff_services.service_id)::integer as service_count,
  count(distinct staff_exceptions.id)::integer as exception_count
from public.staff
left join public.staff_hours
  on staff_hours.staff_id = staff.id
  and staff_hours.tenant_id = staff.tenant_id
left join public.staff_services
  on staff_services.staff_id = staff.id
  and staff_services.tenant_id = staff.tenant_id
left join public.staff_exceptions
  on staff_exceptions.staff_id = staff.id
  and staff_exceptions.tenant_id = staff.tenant_id
where staff.deleted_at is null
  and staff.is_active = true
group by
  staff.id,
  staff.tenant_id,
  staff.name,
  staff.bio,
  staff.user_id;

revoke all on public.staff_directory_metrics from anon;
grant select on public.staff_directory_metrics to authenticated;

commit;
