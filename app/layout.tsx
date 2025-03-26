import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial-Hub",
  description: "Calculators Hub for all your financial needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
