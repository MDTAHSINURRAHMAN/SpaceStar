"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  FileText,
  Image,
  Home,
  Info,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Banner",
    icon: Image,
    href: "/dashboard/banner",
    color: "text-violet-500",
  },
  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
    color: "text-violet-500",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    color: "text-pink-700",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/dashboard/reviews",
    color: "text-orange-700",
  },
  {
    label: "CMS",
    icon: FileText,
    href: "/dashboard/cms",
    color: "text-green-500",
    subRoutes: [
      {
        label: "Home",
        icon: Home,
        href: "/dashboard/cms/home",
        color: "text-blue-400",
      },
      {
        label: "About",
        icon: Info,
        href: "/dashboard/cms/about",
        color: "text-purple-400",
      },
      {
        label: "Story",
        icon: BookOpen,
        href: "/dashboard/cms/story",
        color: "text-yellow-400",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (href: string) => {
    if (openDropdown === href) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(href);
    }
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">SpaceStar</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <div key={route.href}>
              {route.subRoutes ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(route.href)}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                      pathname.startsWith(route.href)
                        ? "text-white bg-white/10"
                        : "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                    {openDropdown === route.href ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {openDropdown === route.href && (
                    <div className="ml-6 mt-1 space-y-1">
                      {route.subRoutes.map((subRoute) => (
                        <Link
                          key={subRoute.href}
                          href={subRoute.href}
                          className={cn(
                            "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                            pathname === subRoute.href
                              ? "text-white bg-white/10"
                              : "text-zinc-400"
                          )}
                        >
                          <div className="flex items-center flex-1">
                            <subRoute.icon className={cn("h-4 w-4 mr-2", subRoute.color)} />
                            {subRoute.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href
                      ? "text-white bg-white/10"
                      : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
