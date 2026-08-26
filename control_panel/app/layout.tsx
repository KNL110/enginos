import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";
import QueryProvider from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevPilot",
  description: "Connect your repos, ask questions about them, and manage your pipelines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
	<html
	  lang="en"
	  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
	  suppressHydrationWarning
	>
		<body className="min-h-full flex flex-col">
			<QueryProvider>
				<ThemeProvider 
					attribute="class" 
					defaultTheme="system" 
					enableSystem 
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</QueryProvider>
		</body>
	</html>
  );
}
