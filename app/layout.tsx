import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Jobs Board",
  description: "Find your next job",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
