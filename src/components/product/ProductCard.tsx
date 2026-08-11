import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  image: string;
  size: string;
  stock: number;
};

export default function ProductCard({
  name,
  slug,
  shortDescription,
  price,
  image,
  size,
}: ProductCardProps) {
  return (
    <div className="group">
      <Link href={`/products/${slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="mt-4">
        <Link href={`/products/${slug}`}>
          <h3 className="text-lg font-medium text-gray-900 hover:text-gray-600">
            {name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-gray-500">{size}</p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {shortDescription}
        </p>

        <p className="mt-3 font-medium text-gray-900">
          ₹{price}
        </p>

        <button className="mt-4 w-full bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}