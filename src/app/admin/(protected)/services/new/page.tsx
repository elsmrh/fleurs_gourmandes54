import { redirect } from "next/navigation";

export default function BrokenServiceNewPage() {
  redirect("/admin/services");
}
