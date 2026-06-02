import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "さやごはん帳",
  description: "自分だけの料理レシピ記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="manifest" href="/CokkingMemo/manifest.json" />
        <link rel="apple-touch-icon" href="/CokkingMemo/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="さやごはん帳" />
        <meta name="theme-color" content="#f9a8d4" />
      </head>
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1 pb-20 sm:pb-6">{children}</main>
      </body>
    </html>
  );
}
