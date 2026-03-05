import "~/styles/globals.css";

import { type Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "compress.to - Tiny Video Compressor",
  description: "Record a short selfie video and compress it into a comically small file.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const STAR_POSITIONS = [
  { top: "6%", left: "8%", size: 1.4, delay: 0.1 },
  { top: "12%", left: "22%", size: 1.1, delay: 0.8 },
  { top: "8%", left: "36%", size: 1.8, delay: 1.4 },
  { top: "16%", left: "47%", size: 1.3, delay: 0.5 },
  { top: "11%", left: "61%", size: 1.9, delay: 1.1 },
  { top: "18%", left: "74%", size: 1.2, delay: 1.7 },
  { top: "9%", left: "87%", size: 1.6, delay: 0.3 },
  { top: "23%", left: "14%", size: 1.5, delay: 1.3 },
  { top: "28%", left: "29%", size: 1.2, delay: 0.4 },
  { top: "21%", left: "41%", size: 1.8, delay: 1.9 },
  { top: "30%", left: "53%", size: 1.3, delay: 0.7 },
  { top: "25%", left: "67%", size: 1.1, delay: 1.2 },
  { top: "33%", left: "79%", size: 1.7, delay: 0.9 },
  { top: "27%", left: "92%", size: 1.2, delay: 1.5 },
  { top: "39%", left: "6%", size: 1.7, delay: 0.2 },
  { top: "45%", left: "18%", size: 1.1, delay: 1.0 },
  { top: "42%", left: "33%", size: 1.5, delay: 1.6 },
  { top: "50%", left: "44%", size: 1.2, delay: 0.6 },
  { top: "48%", left: "59%", size: 1.9, delay: 1.8 },
  { top: "41%", left: "72%", size: 1.3, delay: 0.4 },
  { top: "54%", left: "83%", size: 1.6, delay: 1.4 },
  { top: "46%", left: "95%", size: 1.1, delay: 0.8 },
  { top: "62%", left: "10%", size: 1.2, delay: 1.1 },
  { top: "68%", left: "24%", size: 1.7, delay: 0.5 },
  { top: "65%", left: "37%", size: 1.3, delay: 1.7 },
  { top: "73%", left: "49%", size: 1.8, delay: 0.9 },
  { top: "69%", left: "63%", size: 1.1, delay: 0.3 },
  { top: "76%", left: "76%", size: 1.5, delay: 1.5 },
  { top: "71%", left: "89%", size: 1.2, delay: 0.7 },
  { top: "84%", left: "16%", size: 1.4, delay: 1.9 },
  { top: "87%", left: "31%", size: 1.1, delay: 0.6 },
  { top: "82%", left: "46%", size: 1.7, delay: 1.2 },
  { top: "90%", left: "58%", size: 1.3, delay: 0.2 },
  { top: "86%", left: "71%", size: 1.8, delay: 1.6 },
  { top: "92%", left: "84%", size: 1.2, delay: 1.0 },
] as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable}`}>
      <body className="relative min-h-screen overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(56,189,248,0.08),transparent_40%)]" />
          {STAR_POSITIONS.map((star, idx) => (
            <span
              key={idx}
              className="absolute rounded-full bg-white animate-star-twinkle"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                boxShadow: "0 0 8px rgba(255,255,255,0.9)",
              }}
            />
          ))}
          <span className="absolute left-[104%] top-[8%] h-[3px] w-[3px] rounded-full bg-white animate-shooting-star-1" />
          <span className="absolute left-[102%] top-[18%] h-[2px] w-[2px] rounded-full bg-white animate-shooting-star-2" />
          <span className="absolute left-[102%] top-[38%] h-[2.5px] w-[2.5px] rounded-full bg-white animate-shooting-star-3" />
        </div>
        <TRPCReactProvider>
          <div className="relative z-10">{children}</div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
