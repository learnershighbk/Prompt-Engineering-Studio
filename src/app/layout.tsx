import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Prompt Lab",
  description: "Prompt Engineering 학습 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <CurrentUserProvider initialState={currentUser}>
              {children}
            </CurrentUserProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
