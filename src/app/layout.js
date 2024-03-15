import './globals.css';

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
