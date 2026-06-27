import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 -z-10 gradient-cyber opacity-20 dark:opacity-30" />
      <div className="absolute -top-32 -left-32 -z-10 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 -z-10 h-96 w-96 rounded-full bg-cyber-blue/30 blur-3xl" />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold">
          <span className="text-gradient-cyber">EduVerse</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
