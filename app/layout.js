import "./globals.css";

export const metadata = {
  title: "International Giving Dashboard",
  description: "Interactive analysis of international giving into the USA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
