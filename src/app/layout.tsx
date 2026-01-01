import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LessonAI - AI Lesson Planning Platform',
  description: 'Generate lesson plans, live captions, and quizzes with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}