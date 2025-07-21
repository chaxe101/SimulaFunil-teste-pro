import { type SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="hsl(var(--primary))">
        <path d="M 128,32 L 224,160 L 192,160 L 128,72 L 64,160 L 32,160 Z" />
        <path d="M 160,176 L 96,176 L 96,224 L 160,224 Z" />
      </g>
    </svg>
  );
}
