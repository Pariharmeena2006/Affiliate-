import { redirect } from "next/navigation";import { getAdmin } from "@/lib/auth";import { AdminPanel } from "@/components/admin/admin-panel";
export const dynamic="force-dynamic";
export default async function DashboardPage(){const admin=await getAdmin();if(!admin)redirect("/admin/login");return <AdminPanel initialSection="dashboard" username={admin.username||"Admin"}/>}
