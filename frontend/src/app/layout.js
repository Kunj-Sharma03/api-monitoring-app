
import { Inter, JetBrains_Mono, Sora, Nunito_Sans } from "next/font/google";
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});
import "./globals.css";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "API Monitoring Dashboard",
  description: "Monitor your APIs with real-time alerts and comprehensive analytics",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${inter.variable} ${sora.variable} ${jetbrainsMono.variable} ${nunitoSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
