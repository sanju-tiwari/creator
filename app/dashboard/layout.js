"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hook/use-convex-query";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { FileText, LayoutDashboard, Menu, PenTool, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Post",
    href: "/dashboard/create",
    icon: PenTool,
  },
  {
    title: "My Posts",
    href: "/dashboard/posts",
    icon: FileText,
  },
  {
    title: "Followers",
    href: "/dashboard/followers",
    icon: Users,
  },
];


function Layout({children}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { data: draftPost } = useConvexQuery(api.posts.getUserDraft);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className=" min-h-screen bg-slate-900 text-white " >
       {isSidebarOpen && (
         <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
       )}
       <aside className={cn(  "fixed top-0 left-0 h-full w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 z-50 transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full" )} >
            <div  className="flex items-center justify-between p-5 border-b border-slate-700" >
         <Link href={"/"} className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Creatr Logo"
              width={96}
              height={32}
              className="h-8 sm:h-10 md:h-11 w-auto object-contain"
            />
          </Link>
              <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
            </div>
            <nav className=' p-4 space-y-2 '>
                {sidebarItems.map((item  , i)=>{
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                           <Link
                key={i}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-purple-400"
                        : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span className="font-medium">{item.title}</span>
                  {item.title === "Create Post" && draftPost && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs bg-orange-500/20 text-orange-300 border-orange-500/30"
                    >
                      Draft
                    </Badge>
                  )}
                </div>
              </Link>
                    )

                })}
            </nav>
               <div className="absolute bottom-4 left-4 right-4">
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-slate-300 hover:text-white rounded-xl p-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
       </aside>
        <div className="ml-0 lg:ml-64">
        <header
          className="fixed w-full top-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-b border-slate-700"
        >
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-lg border border-slate-600",
                    userButtonPopoverCard:
                      "shadow-xl backdrop-blur-md bg-slate-800/90 border border-slate-600",
                    userPreviewMainIdentifier: "font-semibold text-white",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </header>
        <main className="mt-16">{children}</main>
      </div>
          
    </div>
  )
}

export default Layout
