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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var storageKey = 'maui-theme';

                function readTheme() {
                  try {
                    var storedTheme = localStorage.getItem(storageKey);
                    return storedTheme === 'light' || storedTheme === 'dark'
                      ? storedTheme
                      : 'dark';
                  } catch (error) {
                    return 'dark';
                  }
                }

                function applyTheme(theme, persist) {
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;

                  if (persist) {
                    try {
                      localStorage.setItem(storageKey, theme);
                    } catch (error) {}
                  }

                  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
                    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
                  });
                }

                applyTheme(readTheme(), false);

                document.addEventListener('click', function (event) {
                  var target = event.target && event.target.closest ? event.target.closest('[data-theme-toggle]') : null;

                  if (!target) {
                    return;
                  }

                  var currentTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
                  applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
                });

                document.addEventListener('DOMContentLoaded', function () {
                  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', false);
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
