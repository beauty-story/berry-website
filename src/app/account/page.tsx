import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/app/account/ProfileForm";
import Link from "next/link";

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
      <Link
        href="/account/orders"
        className="mt-6 bg-gray-900 hover:bg-gray-700 text-white inline-block border disabled:opacity-50 border-gray-900 px-5 py-3 text-sm font-medium">
        My Orders
      </Link>
      {/* bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 */}

      <section className="mt-5 border border-gray-200 p-6">
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






    </main>
  );
}