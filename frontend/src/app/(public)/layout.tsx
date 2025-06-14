import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("token") ? true : false;

  if (isLoggedIn) redirect("/dashboard");

  return (
    <div className="">
      <Navbar isLoggedIn={isLoggedIn} />
      {children}
      <Footer />
    </div>
  );
}
