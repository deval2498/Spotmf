import "@/styles/globals.css";
import { WagmiConfigProvider } from "@/providers/wagmi-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <WagmiConfigProvider>
          {children}
        </WagmiConfigProvider>
      </body>
    </html>
  );
}
