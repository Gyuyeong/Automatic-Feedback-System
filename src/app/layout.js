import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Turtle',
  description: 'Implementing Turtle Graphics',
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
