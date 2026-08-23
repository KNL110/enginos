import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krunal Asari — Portfolio",
  description:
    "Krunal Asari — Mathematics and Computing undergraduate at IIT Goa. Machine learning, full-stack development, and systems projects.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
