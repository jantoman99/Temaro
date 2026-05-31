import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { updateCustomerProfileAction } from "@/app/account/profile/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { Button } from "@/components/ui/button";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CustomerProfilePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

type CustomerProfile = {
  email: string;
  fullName: string;
  phone: string;
  recordsCount: number;
};

async function getCustomerProfile(email: string): Promise<CustomerProfile | null> {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const admin = createAdminClient();
  const { data: clients, error } = await admin
    .from("clients")
    .select("full_name, phone, email")
    .ilike("email", email.trim().toLowerCase())
    .is("deleted_at", null)
    .limit(100);

  if (error || !clients?.length) {
    return {
      email,
      fullName: "",
      phone: "",
      recordsCount: 0,
    };
  }

  const firstWithPhone = clients.find((client) => client.phone?.trim());
  const firstWithName = clients.find((client) => client.full_name?.trim());

  return {
    email,
    fullName: firstWithName?.full_name ?? "",
    phone: firstWithPhone?.phone ?? "",
    recordsCount: clients.length,
  };
}

function StatusMessage({ status }: { status?: string }) {
  if (status === "success") {
    return (
      <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
        Profil byl uložen.
      </div>
    );
  }

  if (status === "validation") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-900">
        Zkontrolujte jméno a telefon.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
        Profil se nepodařilo uložit. Zkuste to prosím znovu.
      </div>
    );
  }

  return null;
}

export default async function CustomerProfilePage({ searchParams }: CustomerProfilePageProps) {
  const { status } = await searchParams;

  if (!hasSupabaseEnv()) {
    redirect("/account");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const profile = await getCustomerProfile(user.email);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TemaroLogo />
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Odhlásit
            </Button>
          </form>
        </div>

        <Link href="/account" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Zpět na rezervace
        </Link>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Zákaznický profil</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Základní údaje</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            Údaje se párují podle ověřeného e-mailu {user.email}. Interní poznámky podniků se tady nikdy nezobrazují.
          </p>
        </section>

        <StatusMessage status={status} />

        {!profile ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <p className="text-sm font-semibold">
              Profil vyžaduje Supabase service role klíč na serveru.
            </p>
          </section>
        ) : (
          <form action={updateCustomerProfileAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
              <input
                id="email"
                value={profile.email}
                disabled
                className="h-11 rounded-md border border-border bg-muted px-3 text-sm font-semibold text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="fullName" className="text-sm font-semibold">Jméno</label>
              <input
                id="fullName"
                name="fullName"
                defaultValue={profile.fullName}
                maxLength={120}
                required
                className="h-11 rounded-md border border-border bg-background px-3 text-sm shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-semibold">Telefon</label>
              <input
                id="phone"
                name="phone"
                defaultValue={profile.phone}
                maxLength={30}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm shadow-sm"
              />
            </div>
            <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground">
              Tento profil je aktuálně propojený s {profile.recordsCount} klientskými záznamy podle ověřeného e-mailu.
            </p>
            <Button type="submit" className="w-full sm:w-auto">
              Uložit profil
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
