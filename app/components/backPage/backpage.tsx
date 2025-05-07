"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackPageProps {
  href?: string;
  className?: string;
}

export function BackPage({ href, className = "" }: BackPageProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="spaceStarOutline"
      onClick={handleBack}
      className={`${buttonVariants({ variant: "spaceStarOutline" })} font-roboto flex items-center gap-2 ${className} font-normal text-gray-500 hover:shadow-sm rounded-full transition-all`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
