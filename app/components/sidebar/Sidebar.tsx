"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  FileText,
  Home,
  Info,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import logo from "../../assets/logo-black.png";
import { useLogoutMutation } from "@/lib/api/loginApi";

const routes = [
  {
    label: "Banner",
    icon: ImageIcon,
    href: "/dashboard/banner",
    color: "text-white",
  },
  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
    color: "text-white",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    color: "text-white",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/dashboard/reviews",
    color: "text-white",
  },
  {
    label: "CMS",
    icon: FileText,
    href: "/dashboard/cms",
    color: "text-white",
    subRoutes: [
      {
        label: "Home",
        icon: Home,
        href: "/dashboard/cms/home",
        color: "text-white",
      },
      {
        label: "About",
        icon: Info,
        href: "/dashboard/cms/about",
        color: "text-white",
      },
      {
        label: "Story",
        icon: BookOpen,
        href: "/dashboard/cms/story",
        color: "text-white",
      },
      {
        label: "Privacy",
        icon: BookOpen,
        href: "/dashboard/cms/privacy",
        color: "text-white",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const toggleDropdown = (href: string) => {
    if (openDropdown === href) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(href);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="font-roboto space-y-4 py-4 flex flex-col h-full bg-black text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <Image className="w-10 h-10 mr-2" src={logo} alt="SpaceStar" width={32} height={32} />
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
      
      {/* Logout Button */}
      <div className="px-3 mt-auto">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3 text-white" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </div>
        </button>
      </div>
    </div>
  );
}