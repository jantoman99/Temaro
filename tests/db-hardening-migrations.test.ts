import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(rootDir, "supabase", "migrations");

function readMigration(fileName: string) {
  return readFileSync(path.join(migrationsDir, fileName), "utf8").toLowerCase();
}

describe("DB hardening migrations", () => {
  it("omezuje verejne booking RPC na service_role", () => {
    const migration = readMigration("20260502192000_harden_function_grants_and_fk_indexes.sql");

    expect(migration).toContain(
      "revoke execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text) from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text) to service_role",
    );
  });

  it("prepina admin booking RPC mimo security definer", () => {
    const migration = readMigration("20260502194000_reduce_security_definer_surface.sql");

    expect(migration).toContain(
      "alter function public.create_booking(uuid, uuid, uuid, uuid, timestamptz, text, text)\n  security invoker",
    );
    expect(migration).toContain(
      "alter function public.update_booking(uuid, uuid, uuid, uuid, timestamptz, text)\n  security invoker",
    );
  });

  it("odebira anon execute z tenant helper funkci", () => {
    const migration = readMigration("20260502194000_reduce_security_definer_surface.sql");

    expect(migration).toContain("revoke execute on function public.is_current_tenant_owner()\n  from public, anon");
    expect(migration).toContain("revoke execute on function public.is_user_in_current_tenant(uuid)\n  from public, anon");
  });

  it("optimalizuje auth.uid a tenant helpery v RLS policies pres initplan select", () => {
    const migration = readMigration("20260502195000_optimize_auth_rls_initplans.sql");

    expect(migration).toContain("id = (select auth.uid())");
    expect(migration).toContain("user_id = (select auth.uid())");
    expect(migration).toContain("tenant_id = (select public.current_tenant_id())");
    expect(migration).toContain("(select public.is_current_tenant_owner())");
    expect(migration).toContain("(select public.current_user_role()) = 'owner'");
  });

  it("drzi nastaveni zaloh u sluzeb a prepocet do rezervaci v DB vrstve", () => {
    const migration = readMigration("20260503113000_add_service_deposit_policy.sql");

    expect(migration).toContain("add column deposit_type text not null default 'none'");
    expect(migration).toContain("add column deposit_value integer not null default 0");
    expect(migration).toContain("services_deposit_value_check");
    expect(migration).toContain("v_deposit_amount := case v_service.deposit_type");
    expect(migration).toContain("deposit_amount = case when deposit_paid then deposit_amount else v_deposit_amount end");
  });

  it("pridava tenant izolovanou evidenci plateb rezervaci", () => {
    const migration = readMigration("20260503115000_create_booking_payments.sql");

    expect(migration).toContain("create table public.booking_payments");
    expect(migration).toContain("constraint booking_payments_booking_tenant_fkey");
    expect(migration).toContain("alter table public.booking_payments enable row level security");
    expect(migration).toContain("create policy booking_payments_select_owner");
    expect(migration).toContain("tenant_id = public.current_tenant_id()");
    expect(migration).toContain("and public.is_current_tenant_owner()");
    expect(migration).toContain("'payment_recorded'");
  });

  it("pridava owner-only tokeny pro iCal feed bez ulozeni raw tokenu", () => {
    const migration = readMigration("20260503123000_create_calendar_feed_tokens.sql");

    expect(migration).toContain("create table public.calendar_feed_tokens");
    expect(migration).toContain("token_hash text not null unique");
    expect(migration).toContain("constraint calendar_feed_tokens_hash_check");
    expect(migration).toContain("alter table public.calendar_feed_tokens enable row level security");
    expect(migration).toContain("create policy calendar_feed_tokens_select_owner");
    expect(migration).toContain("and public.is_current_tenant_owner()");
    expect(migration).toContain("revoke all on public.calendar_feed_tokens from anon");
  });

  it("pridava verejna lokalizacni pole tenantu s indexem pro katalog", () => {
    const migration = readMigration("20260503161500_add_tenant_public_location.sql");

    expect(migration).toContain("add column public_address text");
    expect(migration).toContain("add column public_city text");
    expect(migration).toContain("add column public_map_url text");
    expect(migration).toContain("add column is_publicly_listed boolean not null default false");
    expect(migration).toContain("tenants_public_map_url_format_check");
    expect(migration).toContain("create index tenants_public_listing_city_idx");
    expect(migration).toContain("where is_publicly_listed = true and deleted_at is null");
  });

  it("pridava strukturovany obor tenantu pro verejny katalog", () => {
    const migration = readMigration("20260503164500_add_tenant_industry.sql");

    expect(migration).toContain("add column industry text not null default 'hair'");
    expect(migration).toContain("tenants_industry_check");
    expect(migration).toContain("'private_fitness'");
    expect(migration).toContain("create index tenants_public_listing_industry_city_idx");
    expect(migration).toContain("where is_publicly_listed = true and deleted_at is null");
  });

  it("pridava review URL tenantu bez automatickeho odesilani", () => {
    const migration = readMigration("20260503171500_add_tenant_review_url.sql");

    expect(migration).toContain("add column review_url text");
    expect(migration).toContain("tenants_review_url_format_check");
    expect(migration).toContain("review_url ~* '^https?://'");
  });

  it("pridava verejny profil tenantu pro galerii vybaveni a socialni site", () => {
    const migration = readMigration("20260601202500_add_tenant_public_profile_details.sql");

    expect(migration).toContain("add column if not exists public_gallery_image_urls text[]");
    expect(migration).toContain("add column if not exists public_amenities text[]");
    expect(migration).toContain("add column if not exists social_instagram_url text");
    expect(migration).toContain("tenants_public_gallery_image_urls_limit_check");
    expect(migration).toContain("tenants_social_instagram_url_format_check");
    expect(migration).toContain("social_instagram_url is null or social_instagram_url ~* '^https?://'");
  });

  it("pridava vlastni texty notifikaci s delkovymi limity", () => {
    const migration = readMigration("20260503173000_add_tenant_notification_messages.sql");

    expect(migration).toContain("add column confirmation_message text");
    expect(migration).toContain("add column reminder_message text");
    expect(migration).toContain("add column cancellation_message text");
    expect(migration).toContain("char_length(confirmation_message) <= 500");
    expect(migration).toContain("char_length(reminder_message) <= 500");
    expect(migration).toContain("char_length(cancellation_message) <= 500");
  });

  it("pridava bezpecne sledovani zdroju rezervaci", () => {
    const migration = readMigration("20260508112500_add_booking_source_tracking.sql");

    expect(migration).toContain("add column source_detail text");
    expect(migration).toContain("add column source_metadata jsonb not null default '{}'::jsonb");
    expect(migration).toContain("bookings_source_metadata_object_check");
    expect(migration).toContain("char_length(source_metadata::text) <= 2000");
    expect(migration).toContain("'widget'");
    expect(migration).toContain("'catalog'");
    expect(migration).toContain("drop function if exists public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text)");
    expect(migration).toContain(
      "grant execute on function public.create_public_booking(text, uuid, uuid, timestamptz, text, text, text, text, text, text, jsonb)",
    );
  });

  it("pridava tenant izolovanou cekaci listinu pres service-role RPC", () => {
    const migration = readMigration("20260508114500_create_waitlist_entries.sql");

    expect(migration).toContain("create table if not exists public.waitlist_entries");
    expect(migration).toContain("constraint waitlist_entries_service_tenant_fkey");
    expect(migration).toContain("alter table public.waitlist_entries enable row level security");
    expect(migration).toContain("create policy waitlist_entries_select_owner");
    expect(migration).toContain("tenant_id = (select public.current_tenant_id())");
    expect(migration).toContain("and (select public.is_current_tenant_owner())");
    expect(migration).toContain("waitlist_entries_source_metadata_object_check");
    expect(migration).toContain("create unique index if not exists waitlist_entries_active_email_unique_idx");
    expect(migration).toContain("create or replace function public.create_waitlist_entry");
    expect(migration).toContain(
      "revoke execute on function public.create_waitlist_entry(text, uuid, uuid, text, text, text, text, text, text, jsonb)",
    );
    expect(migration).toContain(
      "grant execute on function public.create_waitlist_entry(text, uuid, uuid, text, text, text, text, text, text, jsonb)",
    );
  });

  it("nepouziva set null na composite waitlist FK s tenant_id", () => {
    const migration = readMigration("20260508115800_fix_waitlist_composite_fk_delete_actions.sql");

    expect(migration).toContain("drop constraint if exists waitlist_entries_staff_tenant_fkey");
    expect(migration).toContain("drop constraint if exists waitlist_entries_offered_booking_tenant_fkey");
    expect(migration).toContain("references public.staff(id, tenant_id)");
    expect(migration).toContain("references public.bookings(id, tenant_id)");
    expect(migration).not.toContain("on delete set null");
  });

  it("pridava typ notifikace pro zadost o recenzi", () => {
    const migration = readMigration("20260508121000_add_review_request_notification_type.sql");

    expect(migration).toContain("drop constraint if exists notifications_type_check");
    expect(migration).toContain("'review_request'");
    expect(migration).toContain("'reschedule'");
  });

  it("pridava vlastni domenu tenantu s unikatem a verification tokenem", () => {
    const migration = readMigration("20260508155300_add_tenant_custom_domain.sql");

    expect(migration).toContain("add column if not exists custom_domain text");
    expect(migration).toContain("custom_domain_status text not null default 'none'");
    expect(migration).toContain("custom_domain_verification_token text");
    expect(migration).toContain("tenants_custom_domain_format_check");
    expect(migration).toContain("temaro-domain-verification=");
    expect(migration).toContain("create unique index if not exists tenants_custom_domain_unique_idx");
    expect(migration).toContain("where custom_domain is not null and deleted_at is null");
  });

  it("pridava tenant izolovany sklad a atomicky pohyb bez zaporne zasoby", () => {
    const migration = readMigration("20260508162000_create_inventory.sql");

    expect(migration).toContain("create table public.inventory_products");
    expect(migration).toContain("create table public.inventory_movements");
    expect(migration).toContain("constraint inventory_products_stock_non_negative");
    expect(migration).toContain("constraint inventory_movements_product_tenant_fkey");
    expect(migration).toContain("alter table public.inventory_products enable row level security");
    expect(migration).toContain("alter table public.inventory_movements enable row level security");
    expect(migration).toContain("owners manage inventory products");
    expect(migration).toContain("create or replace function public.record_inventory_movement");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("for update");
    expect(migration).toContain("inventory stock cannot be negative");
  });

  it("pridava hashovane vouchery a atomicke cerpani zustatku", () => {
    const migration = readMigration("20260508162500_create_vouchers.sql");

    expect(migration).toContain("create table public.vouchers");
    expect(migration).toContain("code_hash text not null");
    expect(migration).toContain("constraint vouchers_code_hash_unique");
    expect(migration).toContain("create table public.voucher_redemptions");
    expect(migration).toContain("alter table public.vouchers enable row level security");
    expect(migration).toContain("alter table public.voucher_redemptions enable row level security");
    expect(migration).toContain("public.is_current_tenant_owner()");
    expect(migration).toContain("create or replace function public.redeem_voucher");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("for update");
    expect(migration).toContain("voucher has insufficient balance");
  });

  it("pridava permanentky a balicky s atomickym cerpanim", () => {
    const migration = readMigration("20260508163500_create_client_passes.sql");

    expect(migration).toContain("create table public.service_packages");
    expect(migration).toContain("create table public.client_passes");
    expect(migration).toContain("create table public.client_pass_redemptions");
    expect(migration).toContain("constraint service_packages_units_check");
    expect(migration).toContain("constraint client_passes_id_tenant_id_unique unique (id, tenant_id)");
    expect(migration).toContain("constraint client_passes_balance_check");
    expect(migration).toContain("alter table public.service_packages enable row level security");
    expect(migration).toContain("public.is_current_tenant_owner()");
    expect(migration).toContain("create or replace function public.redeem_client_pass");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("for update");
    expect(migration).toContain("client pass has insufficient sessions");
    expect(migration).toContain("client pass has insufficient credit");
  });

  it("pridava opakovana clenstvi s owner-only tenant izolaci", () => {
    const migration = readMigration("20260508164500_create_memberships.sql");

    expect(migration).toContain("create table public.membership_plans");
    expect(migration).toContain("create table public.client_memberships");
    expect(migration).toContain("constraint membership_plans_period_check");
    expect(migration).toContain("constraint client_memberships_dates_check");
    expect(migration).toContain("alter table public.membership_plans enable row level security");
    expect(migration).toContain("alter table public.client_memberships enable row level security");
    expect(migration).toContain("membership_plans_owner_all");
    expect(migration).toContain("client_memberships_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava kampane a last minute nabidky s owner-only tenant izolaci", () => {
    const migration = readMigration("20260508170000_create_marketing_campaigns.sql");

    expect(migration).toContain("create table public.marketing_campaigns");
    expect(migration).toContain("create table public.last_minute_offers");
    expect(migration).toContain("constraint marketing_campaigns_segment_check");
    expect(migration).toContain("constraint last_minute_offers_time_check");
    expect(migration).toContain("alter table public.marketing_campaigns enable row level security");
    expect(migration).toContain("alter table public.last_minute_offers enable row level security");
    expect(migration).toContain("marketing_campaigns_owner_all");
    expect(migration).toContain("last_minute_offers_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava verejne souradnice tenantu pro vzdalenostni katalog", () => {
    const migration = readMigration("20260508171000_add_tenant_public_coordinates.sql");

    expect(migration).toContain("add column if not exists public_latitude double precision");
    expect(migration).toContain("add column if not exists public_longitude double precision");
    expect(migration).toContain("tenants_public_coordinates_check");
    expect(migration).toContain("public_latitude between -90 and 90");
    expect(migration).toContain("public_longitude between -180 and 180");
    expect(migration).toContain("tenants_public_coordinates_idx");
    expect(migration).toContain("where is_publicly_listed = true");
  });

  it("pridava verejny souhrn recenzi pro reputaci v katalogu", () => {
    const migration = readMigration("20260508172500_add_tenant_review_summary.sql");

    expect(migration).toContain("add column if not exists review_rating numeric(2,1)");
    expect(migration).toContain("add column if not exists review_count integer not null default 0");
    expect(migration).toContain("add column if not exists review_source_label text");
    expect(migration).toContain("tenants_review_summary_check");
    expect(migration).toContain("review_rating >= 0 and review_rating <= 5");
    expect(migration).toContain("review_count > 0");
  });

  it("pridava rezervovatelne zdroje a vazby na sluzby", () => {
    const migration = readMigration("20260508175500_create_bookable_resources.sql");

    expect(migration).toContain("create table public.bookable_resources");
    expect(migration).toContain("create table public.service_resources");
    expect(migration).toContain("constraint bookable_resources_type_check");
    expect(migration).toContain("constraint bookable_resources_capacity_positive");
    expect(migration).toContain("alter table public.bookable_resources enable row level security");
    expect(migration).toContain("alter table public.service_resources enable row level security");
    expect(migration).toContain("bookable_resources_owner_all");
    expect(migration).toContain("service_resources_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava vice pobockovou evidenci s primarni pobockou", () => {
    const migration = readMigration("20260508181500_create_tenant_locations.sql");

    expect(migration).toContain("create table public.tenant_locations");
    expect(migration).toContain("tenant_locations_primary_unique_idx");
    expect(migration).toContain("tenant_locations_coordinates_check");
    expect(migration).toContain("alter table public.tenant_locations enable row level security");
    expect(migration).toContain("tenant_locations_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava skupinove lekce s atomickou kapacitou", () => {
    const migration = readMigration("20260508184500_create_group_classes.sql");

    expect(migration).toContain("create table public.group_classes");
    expect(migration).toContain("create table public.group_class_attendees");
    expect(migration).toContain("constraint group_classes_capacity_check");
    expect(migration).toContain("constraint group_class_attendees_unique_client");
    expect(migration).toContain("alter table public.group_classes enable row level security");
    expect(migration).toContain("alter table public.group_class_attendees enable row level security");
    expect(migration).toContain("group_classes_owner_all");
    expect(migration).toContain("group_class_attendees_owner_all");
    expect(migration).toContain("create or replace function public.enroll_group_class");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("for update");
    expect(migration).toContain("group class is full");
    expect(migration).not.toContain("on delete set null");
  });

  it("pridava preference klienta a trusted risk profil", () => {
    const migration = readMigration("20260508191500_add_client_preferences_and_tier.sql");

    expect(migration).toContain("preferred_contact_channel text not null default 'any'");
    expect(migration).toContain("preferred_time_of_day text not null default 'any'");
    expect(migration).toContain("preference_notes text");
    expect(migration).toContain("client_tier text not null default 'standard'");
    expect(migration).toContain("clients_preferred_contact_channel_check");
    expect(migration).toContain("clients_preferred_time_of_day_check");
    expect(migration).toContain("clients_preference_notes_length");
    expect(migration).toContain("clients_tier_check");
    expect(migration).toContain("clients_tenant_tier_idx");
  });

  it("pridava referral programy a hashovane referral kody", () => {
    const migration = readMigration("20260508192500_create_referrals.sql");

    expect(migration).toContain("create table public.referral_programs");
    expect(migration).toContain("create table public.referral_codes");
    expect(migration).toContain("code_hash text not null");
    expect(migration).toContain("constraint referral_codes_hash_unique");
    expect(migration).toContain("constraint referral_codes_program_tenant_fkey");
    expect(migration).toContain("constraint referral_codes_client_tenant_fkey");
    expect(migration).toContain("alter table public.referral_programs enable row level security");
    expect(migration).toContain("alter table public.referral_codes enable row level security");
    expect(migration).toContain("referral_programs_owner_all");
    expect(migration).toContain("referral_codes_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava provizni pravidla tymu s owner-only tenant izolaci", () => {
    const migration = readMigration("20260508193500_create_staff_commission_rules.sql");

    expect(migration).toContain("create table public.staff_commission_rules");
    expect(migration).toContain("constraint staff_commission_rules_staff_tenant_fkey");
    expect(migration).toContain("constraint staff_commission_rules_unique_staff");
    expect(migration).toContain("constraint staff_commission_rules_type_check");
    expect(migration).toContain("constraint staff_commission_rules_percent_check");
    expect(migration).toContain("alter table public.staff_commission_rules enable row level security");
    expect(migration).toContain("staff_commission_rules_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });

  it("pridava empty-slot recovery s owner-only tenant izolaci", () => {
    const migration = readMigration("20260508194500_create_empty_slot_recovery.sql");

    expect(migration).toContain("create table public.empty_slot_recovery_offers");
    expect(migration).toContain("create table public.empty_slot_recovery_recipients");
    expect(migration).toContain("constraint empty_slot_recovery_offers_service_tenant_fkey");
    expect(migration).toContain("constraint empty_slot_recovery_recipients_offer_tenant_fkey");
    expect(migration).toContain("constraint empty_slot_recovery_recipients_unique_client");
    expect(migration).toContain("constraint empty_slot_recovery_offers_discount_check");
    expect(migration).toContain("alter table public.empty_slot_recovery_offers enable row level security");
    expect(migration).toContain("alter table public.empty_slot_recovery_recipients enable row level security");
    expect(migration).toContain("empty_slot_recovery_offers_owner_all");
    expect(migration).toContain("empty_slot_recovery_recipients_owner_all");
    expect(migration).toContain("public.is_current_tenant_owner()");
    expect(migration).not.toContain("references public.staff (id, tenant_id)\n    on delete set null");
    expect(migration).not.toContain("references public.clients (id, tenant_id)\n    on delete set null");
  });

  it("pridava hashovane tenant API klice pro partner integrace", () => {
    const migration = readMigration("20260508195500_create_tenant_api_keys.sql");

    expect(migration).toContain("create table public.tenant_api_keys");
    expect(migration).toContain("token_hash text not null");
    expect(migration).toContain("constraint tenant_api_keys_hash_unique");
    expect(migration).toContain("constraint tenant_api_keys_scopes_check");
    expect(migration).toContain("bookings:read");
    expect(migration).toContain("alter table public.tenant_api_keys enable row level security");
    expect(migration).toContain("tenant_api_keys_owner_select");
    expect(migration).toContain("tenant_api_keys_owner_insert");
    expect(migration).toContain("tenant_api_keys_owner_update");
    expect(migration).toContain("public.is_current_tenant_owner()");
  });
});
