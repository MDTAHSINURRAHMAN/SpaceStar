"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/lib/api/loginApi";
import Loader from "@/app/components/Loader";
interface Props {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const router = useRouter();
  const { data, error, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (!isLoading && error) {
      // Redirect to login if unauthorized
      router.push("/login");
    }
  }, [isLoading, error, router]);

  if (isLoading) return <div className="p-4 text-gray-700"><Loader /></div>;

  return <>{children}</>;
}
