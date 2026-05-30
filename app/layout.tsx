import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "料理メモ",
  description: "自分だけの料理レシピ記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1 pb-20 sm:pb-6">{children}</main>
      </body>
    </html>
  );
}
