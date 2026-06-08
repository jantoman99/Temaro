import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { getBaseAppUrl } from "@/lib/app-url";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rezervační systém pro služby | Temaro",
    template: "%s",
  },
  description:
    "Temaro je český rezervační systém pro salony, barbery, ordinace, trenéry a lokální služby. Online booking, týmový kalendář, klientská historie a méně telefonátů.",
  applicationName: "Temaro",
  metadataBase: new URL(getBaseAppUrl()),
  openGraph: {
    title: "Rezervační systém pro služby | Temaro",
    description:
      "Online rezervace, týmový kalendář a klientský kontext pro provozy, kde každý volný termín stojí peníze.",
    locale: "cs_CZ",
    siteName: "Temaro",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/temaro-mark.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

const themeScript = `
(function() {
  try {
    if (localStorage.getItem('temaro-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
