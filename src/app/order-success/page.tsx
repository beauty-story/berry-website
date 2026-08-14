import Link from "next/link";
import {
  CheckCircle2,
  PackageCheck,
} from "lucide-react";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { orderId } =
    await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />

        <h1 className="mt-6 text-3xl font-semibold text-gray-900">
          Payment Successful
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Thank you for your order.
          Your payment has been verified
          successfully.
        </p>

        {orderId && (
          <div className="mx-auto mt-8 max-w-sm bg-[#faf9f7] p-6">
            <PackageCheck className="mx-auto h-7 w-7 text-gray-700" />

            <p className="mt-3 text-sm text-gray-500">
              Order Number
            </p>

            <p className="mt-1 text-xl font-semibold text-gray-900">
              #{orderId}
            </p>
          </div>
        )}

        <p className="mt-8 text-sm text-gray-500">
          We&apos;ll process your order
          and prepare it for shipping.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account"
            className="border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 hover:border-gray-900"
          >
            My Account
          </Link>
        </div>
      </div>
    </main>
  );
}