import { Navbar } from "@/components/navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("token") ? true : false;
  if (!isLoggedIn) redirect("/signin");
  return (
    <div className="">
      <Navbar isLoggedIn={isLoggedIn} showLinks={false} />
      {children}
      {/* <Footer /> */}
    </div>
  );
}
