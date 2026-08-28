import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENGINOS",
  description: "Connect your repos, ask questions about them, and manage your pipelines.",
  openGraph: {
    title: "ENGINOS",
    description: "Connect your repos, ask questions about them, and manage your pipelines.",
    images: ["/Enginos.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ENGINOS",
    description: "Connect your repos, ask questions about them, and manage your pipelines.",
    images: ["/Enginos.png"],
  },
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
					<Toaster>{children}</Toaster>
				</ThemeProvider>
			</QueryProvider>
		</body>
	</html>
  );
}
