"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState ,useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function Navbar() {

  const [user, setUser] = useState<User | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { cartItems , openCart} = useCart();

  const cartCount = cartItems.reduce((total,item)=>total +item.quantity,0)

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const userName = user?.user_metadata?.full_name;

  const firstName = userName?.split(" ")[0];
   
   

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
    }, []);

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
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  aria-label="My account"
                  className="flex items-center gap-1"
                >
                  <UserRound className="h-5 w-5" />

                  <span className="hidden text-sm sm:inline">
                    {firstName || "Account"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden text-sm text-gray-500 hover:text-gray-900 sm:block"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                aria-label="Sign in"
                className="flex items-center gap-1"
              >
                <UserRound className="h-5 w-5" />

                <span className="hidden text-sm sm:inline">
                  Sign In
                </span>
              </Link>
            )}

          {/*Shoping cart icon */}
        <button
          type="button"
          onClick={openCart}
          aria-label="Open shopping cart"
          className="relative"
        >
          <ShoppingBag className="h-5 w-5" />

          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-medium text-white">
              {cartCount}
            </span>
          )}
        </button>
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