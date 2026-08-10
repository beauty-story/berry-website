import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          Beauty Store
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="text-sm hover:text-gray-500">
            Shop
          </Link>

          <Link href="/about" className="text-sm hover:text-gray-500">
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/sign-in" aria-label="Sign in">
            <UserRound className="h-5 w-5" />
          </Link>

          <Link href="/cart" aria-label="Shopping cart">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>

      </nav>
    </header>
  );
}