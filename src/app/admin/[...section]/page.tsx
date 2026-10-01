import { notFound,redirect } from "next/navigation";import { getAdmin } from "@/lib/auth";import { AdminPanel } from "@/components/admin/admin-panel";
export const dynamic="force-dynamic";
const valid=new Set(["products","categories","merchants","banners","homepage","pages","theme","settings","analytics"]);
export default async function SectionPage({params}:{params:Promise<{section:string[]}>}){const admin=await getAdmin();if(!admin)redirect("/admin/login");const {section}=await params;if(section.length!==1||!valid.has(section[0]))notFound();return <AdminPanel initialSection={section[0]} username={admin.username||"Admin"}/>}
