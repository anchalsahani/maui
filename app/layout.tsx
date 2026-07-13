import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maui",
  description: "  ADHD Productivity System to help you start tasks instantly, even on your worst days. ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('maui-theme');
                if (theme !== 'light' && theme !== 'dark') {
                  theme = 'dark';
                }
                document.documentElement.dataset.theme = theme;
              } catch (error) {
                document.documentElement.dataset.theme = 'dark';
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function setTheme(theme) {
                  document.documentElement.dataset.theme = theme;
                  try {
                    localStorage.setItem('maui-theme', theme);
                  } catch (error) {}
                  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
                    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
                  });
                }

                document.addEventListener('click', function (event) {
                  var target = event.target && event.target.closest ? event.target.closest('[data-theme-toggle]') : null;

                  if (!target) {
                    return;
                  }

                  var currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
                  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
                });

                document.addEventListener('DOMContentLoaded', function () {
                  setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
