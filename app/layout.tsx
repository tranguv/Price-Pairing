import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
const SpaceGrotesk = Space_Grotesk({
  subsets: ['latin'], weight: ['300', '400', '500', '600']
})

export const metadata: Metadata = {
  title: "Price Pair",
  description: "Track product prices effortlessly and save money on your online shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="max-w-10xl mx-auto">
            <NavBar />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
