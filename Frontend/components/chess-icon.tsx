import type { LightbulbIcon as LucideProps } from "lucide-react"

export function ChessIcon(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382a1 1 0 0 0-.553-.894L16 16" />
      <circle cx="12" cy="4" r="2" />
      <path d="M10.5 10h3l1.5 2H9l1.5-2Z" />
      <path d="M8 10V8h8v2" />
      <path d="M9 16h6" />
      <path d="M9 12h6" />
    </svg>
  )
}
