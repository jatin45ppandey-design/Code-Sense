import type { Metadata } from "next";
import { ThemeProvider } from "@teispace/next-themes";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CodeSense", template: "%s | CodeSense" },
  description: "Explore and understand your repositories with code-grounded answers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className="antialiased"><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storage="local"><AppProviders>{children}</AppProviders></ThemeProvider></body></html>;
}
