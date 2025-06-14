"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";

export const Navbar = ({
  isLoggedIn = false,
  showLinks = true,
}: {
  isLoggedIn?: boolean;
  showLinks?: boolean;
}) => {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const isActive = (href: string) => path === href.toLowerCase();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={150} height={70} />
        </Link>

        {/* Desktop Links */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              How It Works
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </nav>
        )}

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} aria-label="Toggle Menu">
            {mobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Auth Buttons / Dashboard Links */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn && (
            <>
              <Link href="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
              <Link href="/signin">
                <Button>Log In</Button>
              </Link>
            </>
          )}
          {isLoggedIn && (
            <div className="flex items-center gap-10 text-sm font-medium">
              {[
                "/dashboard",
                "/dashboard/quizzes",
                "/dashboard/PDFs",
                "/dashboard/exams",
                "/dashboard/credits",
              ].map((href) => (
                <Link
                  key={href}
                  href={href.toLowerCase()}
                  className={clsx(
                    "hover:underline underline-offset-4 hover:text-primary transition-all duration-200",
                    isActive(href) && "text-primary font-bold"
                  )}
                >
                  {href === "/dashboard"
                    ? "Dashboard"
                    : href.split("/")[2].charAt(0).toUpperCase() +
                      href.split("/")[2].slice(1)}
                </Link>
              ))}
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={async () => {
                  await fetch("/api/logout", {
                    method: "GET",
                  });
                  toast.success("Logged out");
                  router.push("/signin");
                }}
                className="hover:text-primary transition-all duration-200 ml-10"
              >
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col px-5 py-4 gap-3 text-sm font-medium">
            {showLinks && (
              <>
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
              </>
            )}

            {!isLoggedIn && (
              <>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/quizzes"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Quizzes
                </Link>
                <Link
                  href="/dashboard/pdfs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  PDFs
                </Link>
                <Link
                  href="/dashboard/exams"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Exams
                </Link>
                <Link
                  href="/dashboard/credits"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Credits
                </Link>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  onClick={async () => {
                    await fetch("/api/logout", {
                      method: "GET",
                    });
                    toast.success("Logged out");
                    router.push("/signin");
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
