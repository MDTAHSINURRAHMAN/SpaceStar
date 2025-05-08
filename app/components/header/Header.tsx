"use client";
import { BackPage } from "../backPage/backpage";

interface HeaderProps {
  pageName: string;
}

export function Header({ pageName }: HeaderProps) {
  return (
    <div className="font-roboto w-full">
      <div className="w-full bg-white">
        <div className="flex flex-col items-start pl-2 py-4 w-2/3 mx-auto gap-2">
          <BackPage />
          <h1 className="text-3xl font-semibold text-gray-700 pl-1 tracking-wide">{pageName}</h1>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button> */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@spacestar.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </div>
  );
}
