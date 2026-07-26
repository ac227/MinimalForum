import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Minimal Forum",
  description: "An anonymous forum.",
};

// Applies the persisted theme/mode to <html> before first paint to avoid a
// flash of the wrong theme. Keep the storage keys in sync with theme-provider.
const themeInitScript = `(function(){try{var r=document.documentElement;if(localStorage.getItem("mf-theme")==="pastel")r.setAttribute("data-theme","pastel");var m=localStorage.getItem("mf-mode");if(m==="dark"||(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))r.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
