'use client';

import { ReactNode } from 'react';
import ViewTracker from './ViewTracker';

interface ChapterClientWrapperProps {
  children: ReactNode;
  slug: string;
  chapterNumber: number;
}

export default function ChapterClientWrapper({ 
  children, 
  slug, 
  chapterNumber 
}: ChapterClientWrapperProps) {
  return (
    <>
      <ViewTracker
        slug={slug}
        chapterNumber={chapterNumber}
      />
      {children}
    </>
  );
} 