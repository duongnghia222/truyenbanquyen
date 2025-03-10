'use client';

import React from 'react';

interface ReloadButtonProps {
  className?: string;
}

export default function ReloadButton({ className }: ReloadButtonProps) {
  return (
    <button
      onClick={() => window.location.reload()}
      className={className}
    >
      Thử lại
    </button>
  );
} 