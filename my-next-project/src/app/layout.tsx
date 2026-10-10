import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import SocialDrawer from "@/app/components/SocialDrawer";
import { Mail } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AgencyShell from "@/app/components/AgencyShell";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Veloura Creations | Photography & Cinematography",
  description: "Stories of love, captured beautifully by Veloura Creations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#0f0f0f] text-[#f5f5f0] min-h-screen flex flex-col`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "833413662852-m2d68gvcmit72qpr4t9jllrrl6ak8fn0.apps.googleusercontent.com"}>
          <AuthProvider>
            <AgencyShell>
              {children}
            </AgencyShell>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
