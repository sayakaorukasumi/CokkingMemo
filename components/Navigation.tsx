"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PlusCircle } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/recipes", icon: BookOpen, label: "レシピ" },
  { href: "/recipes/new", icon: PlusCircle, label: "登録" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <header className="hidden sm:flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-pink-100 sticky top-0 z-10">
        <Link href="/" className="text-xl font-bold text-pink-500">
          🍳 料理メモ
        </Link>
        <nav className="flex gap-6">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-pink-500"
                  : "text-gray-500 hover:text-pink-400"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur border-t border-pink-100 flex justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors px-4 py-1 ${
              pathname === href ? "text-pink-500" : "text-gray-400"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
