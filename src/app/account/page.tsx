import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/app/account/ProfileForm";

export default async function AccountPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/sign-in");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("full_name, phone")
  .eq("id", user.id)
  .single();

  if (profileError) {
  console.error("Profile error:", profileError.message);
    }

    const fullName = profile?.full_name || "Customer";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          My Account
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Hello, {fullName}
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account and orders.
        </p>
      </div>

      <section className="mt-10 border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Account Information
        </h2>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {fullName}
            </p>
          </div>



          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {user.email}
            </p>
          </div>

            <ProfileForm
            userId={user.id}
            initialName={fullName}
            initialPhone={profile?.phone ?? null}
            />


       

        </div>
      </section>

      <section className="mt-8 border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          My Orders
        </h2>

        <p className="mt-4 text-sm text-gray-500">
          You have no orders yet.
        </p>
      </section>
    </main>
  );
}