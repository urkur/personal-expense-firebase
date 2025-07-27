import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
      <path
        d="M10 22V10H14.472C16.5227 10 17.548 11.0107 17.548 13.032C17.548 14.5827 16.8907 15.6147 15.576 16.128L18.4 22H16.16L13.624 16.6H12.18V22H10ZM12.18 14.892H14.28C14.9373 14.892 15.2667 14.54 15.2667 13.836C15.2667 13.132 14.9373 12.78 14.28 12.78H12.18V14.892Z"
        fill="hsl(var(--primary-foreground))"
      />
    </svg>
  );
}
