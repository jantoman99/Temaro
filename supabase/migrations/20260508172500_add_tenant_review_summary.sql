begin;

alter table public.tenants
  add column if not exists review_rating numeric(2,1),
  add column if not exists review_count integer not null default 0,
  add column if not exists review_source_label text;

alter table public.tenants
  drop constraint if exists tenants_review_summary_check,
  add constraint tenants_review_summary_check
    check (
      review_rating is null
      or (review_rating >= 0 and review_rating <= 5 and review_count > 0)
    );

alter table public.tenants
  drop constraint if exists tenants_review_count_check,
  add constraint tenants_review_count_check
    check (review_count >= 0);

alter table public.tenants
  drop constraint if exists tenants_review_source_label_length_check,
  add constraint tenants_review_source_label_length_check
    check (review_source_label is null or char_length(review_source_label) <= 80);

commit;
