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
        {/* <Script src="./skulpt/skulpt.min.js" type="text/javascript"></Script>
        <Script src="./skulpt/skulpt-stdlib.js" type="text/javascript"></Script> */}
      </body>
    </html>
  );
}
