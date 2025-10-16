import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import Header from "@/components/ui/header";
import { Toaster } from "sonner";

const inter = Inter({subsets:["latin"]}) 

export const metadata = {
  title: "AI content Platform  ",
  description: "Content generation platform powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body
        className={`${inter.className}`}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: shadesOfPurple,
            }}
          >
             <ConvexClientProvider>
              <Header></Header>
            <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
            <Toaster richColors />
            {children}
            </main>
             </ConvexClientProvider>
             </ClerkProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
