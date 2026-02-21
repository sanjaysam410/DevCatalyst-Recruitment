import type { Metadata } from "next";
import { Roboto } from "next/font/google"; // Use Roboto for Material feel
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "DevCatalyst Recruitment Form",
  description: "Join the team!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-sans antialiased bg-[#f0ebf8] text-gray-800`}
      >
        {children}
      </body>
    </html>
  );
}
