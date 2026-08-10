import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#faf9f7]">
      <div className="mx-auto grid min-h-[75vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        
        {/* Text */}
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Everyday Beauty
          </p>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Beauty made simple.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
            Thoughtfully selected beauty products designed for your everyday
            routine.
          </p>

          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Shop the Collection
            </Link>
          </div>
        </div>

        {/* Image placeholder */}
        <div className="relative min-h-[420px] overflow-hidden bg-[#eee9e3] md:min-h-[560px]">
            <Image
                src="/images/hero-product.jpg"
                alt="Beauty product collection"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
        </div>  

      </div>
    </section>
  );
}