"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type ShellProps={children:React.ReactNode;merchants:{name:string;slug:string}[];settings:{announcement?:string;searchPlaceholder?:string;logo?:string;siteTitle?:string}};
export function AppShell({children,merchants,settings}:ShellProps){
 const pathname=usePathname();
 const isAdmin=pathname==="/admin"||pathname.startsWith("/admin/");
 if(isAdmin)return <main className="admin-main min-h-screen">{children}</main>;
 return <><SiteHeader merchants={merchants} settings={settings}/><main className="public-main min-h-[60vh]">{children}</main><SiteFooter merchants={merchants}/></>;
}
