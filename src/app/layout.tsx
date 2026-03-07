import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formulário RobDev",
  description: "Sistema moderno de formulários para coleta de dados e geração de documentos. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React", "Formulário"],
  authors: [{ name: "Rob Dev" }],
  openGraph: {
    title: "Formulário RobDev",
    description: "Sistema moderno de formulários para coleta de dados e geração de documentos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formulário RobDev",
    description: "Sistema moderno de formulários para coleta de dados e geração de documentos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
