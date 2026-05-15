import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <section className="max-w-md rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white">
          <ShieldAlert size={24} />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          Access restricted
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-100">
          You do not have permission to access this area. Contact the restaurant
          owner or manager if you believe this is a mistake.
        </p>

        <Link
          href="/dashboard"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
        >
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
