"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          Beauty Store
        </Link>

        {/* Desktop Navigation */}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Shop
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}