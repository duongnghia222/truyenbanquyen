'use client';

/**
 * ViewTracker Component
 * 
 * This component tracks the time a user spends reading a chapter and registers a view
 * only when the user has spent at least 3 minutes (180,000ms) on the page.
 * 
 * Key features:
 * - Tracks total active reading time across page visibility changes
 * - Registers view after 3 minutes of accumulated reading time
 * - Handles page unload events to capture reading time before user leaves
 * - Uses navigator.sendBeacon for reliable analytics when page is closed
 * - Prevents duplicate view counts for the same chapter session
 * 
 * This ensures view counts are accurate for monetization purposes, as they
 * only count genuine reading sessions (3+ minutes) rather than brief visits.
 */

import { useEffect, useState, useRef } from 'react';

interface ViewTrackerProps {
  slug: string;
  chapterNumber: number;
}

export default function ViewTracker({ slug, chapterNumber }: ViewTrackerProps) {
  const [startTime] = useState<number>(Date.now());
  const [viewCounted, setViewCounted] = useState<boolean>(false);
  const minReadDuration = 180000; // 3 minutes in milliseconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeRef = useRef<boolean>(true);
  const totalTimeRef = useRef<number>(0);
  const lastActiveTime = useRef<number>(Date.now());

  // Handle user leaving the page before the 3-minute mark
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is leaving the page - calculate time spent so far
        if (activeRef.current) {
          const now = Date.now();
          const timeSpentSinceLastActive = now - lastActiveTime.current;
          totalTimeRef.current += timeSpentSinceLastActive;
          activeRef.current = false;
          
          // If we've already accumulated 3 minutes, register the view
          if (totalTimeRef.current >= minReadDuration && !viewCounted) {
            registerView(totalTimeRef.current);
          }
        }
      } else {
        // User is back - reset the last active time
        lastActiveTime.current = Date.now();
        activeRef.current = true;
      }
    };

    // Handle user closing the window/tab
    const handleBeforeUnload = () => {
      if (activeRef.current && !viewCounted) {
        const now = Date.now();
        const timeSpentSinceLastActive = now - lastActiveTime.current;
        totalTimeRef.current += timeSpentSinceLastActive;
        
        // If we've accumulated 3 minutes, register the view
        if (totalTimeRef.current >= minReadDuration) {
          // Using sendBeacon for more reliable tracking on page unload
          const data = JSON.stringify({ readingDuration: totalTimeRef.current });
          const baseUrl = window.location.origin;
          navigator.sendBeacon(
            `${baseUrl}/api/novels/${slug}/chapters/${chapterNumber}`,
            data
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [slug, chapterNumber, viewCounted, minReadDuration]);

  // Reset tracking state when chapter changes
  useEffect(() => {
    setViewCounted(false);
    totalTimeRef.current = 0;
    lastActiveTime.current = Date.now();
    activeRef.current = true;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Create a new timer
    timerRef.current = setTimeout(() => {
      if (activeRef.current) {
        const now = Date.now();
        const timeSpentSinceLastActive = now - lastActiveTime.current;
        const totalTime = totalTimeRef.current + timeSpentSinceLastActive;
        
        if (totalTime >= minReadDuration && !viewCounted) {
          registerView(totalTime);
        }
      }
    }, minReadDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [slug, chapterNumber, minReadDuration]);

  // Register the view with the server
  const registerView = async (readingDuration: number) => {
    if (viewCounted) return;
    
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(
        `${baseUrl}/api/novels/${slug}/chapters/${chapterNumber}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ readingDuration }),
        }
      );

      if (response.ok) {
        setViewCounted(true);
        console.log('View counted successfully');
      } else {
        console.error('Failed to count view:', await response.text());
      }
    } catch (error) {
      console.error('Error counting view:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
} 