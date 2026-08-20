import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Berry Organics",
  description:
    "Learn about Berry Organics, our approach to thoughtful beauty and personal care, and what we aim to offer.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#faf9f7]">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            About Berry Organics
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Thoughtful care,
            <br className="hidden sm:block" />
            made simple.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
            Berry Organics is built around a simple idea:
            personal care should feel considered, uncomplicated,
            and enjoyable to use every day.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Our Story
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              Beauty without unnecessary complexity.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-gray-600">
            <p>
              Berry Organics was created to offer a focused
              collection of beauty and personal care products
              designed to fit naturally into everyday routines.
            </p>

            <p>
              Instead of overwhelming customers with endless
              choices, we want the experience to remain clear:
              thoughtful products, straightforward information,
              and an easy way to discover what works for you.
            </p>

            <p>
              As we grow, our aim is to continue improving the
              products, the shopping experience, and the way we
              serve our customers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-gray-200 bg-[#faf9f7]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              What Matters To Us
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              Our approach
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-7">
              <p className="text-sm text-gray-400">
                01
              </p>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Thoughtful Selection
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                A focused collection that prioritizes clarity
                and usefulness over unnecessary choice.
              </p>
            </div>

            <div className="bg-white p-7">
              <p className="text-sm text-gray-400">
                02
              </p>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Simple Experience
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                From discovering a product to completing your
                order, every part of the experience should feel
                straightforward.
              </p>
            </div>

            <div className="bg-white p-7">
              <p className="text-sm text-gray-400">
                03
              </p>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Customer First
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                We want to build trust through clear product
                information, reliable service, and continuous
                improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Discover Berry Organics
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold text-gray-900">
          Find something for your everyday routine.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600">
          Explore our growing collection of beauty and
          personal care products.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block bg-gray-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Shop Products
        </Link>
      </section>
    </main>
  );
}