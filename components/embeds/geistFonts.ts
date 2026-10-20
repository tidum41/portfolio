import { Geist, Geist_Mono } from "next/font/google";

// Loaded only by embed roots (CD player / habit tracker), not the site shell.
// preload: false — embeds mount after first paint.
export const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  preload: false,
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
});
