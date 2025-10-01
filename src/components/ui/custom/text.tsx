import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "ul"
  | "ol"
  | "table"
  | "thead"
  | "tbody"
  | "tr"
  | "th"
  | "td"
  | "a"
  | "code"
  | "subtitle"

interface TextProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  className?: string
  variant?: TextVariant
  href?: string
}

const Text = ({
  children,
  className,
  variant,
  href,
  ...props
}: TextProps) => {
  switch (variant) {
    case "h1":
      return (
        <h1
          className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}
          {...props}
        >
          {children}
        </h1>
      )
    case "h2":
      return (
        <h2
          className={cn("mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0", className)}
          {...props}
        >
          {children}
        </h2>
      )
    case "h3":
      return (
        <h3
          className={cn("mt-8 scroll-m-20 text-2xl font-semibold tracking-tight", className)}
          {...props}
        >
          {children}
        </h3>
      )
    case "h4":
      return (
        <h4
          className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}
          {...props}
        >
          {children}
        </h4>
      )
    case "blockquote":
      return (
        <blockquote
          className={cn("mt-6 border-l-2 pl-6 italic", className)}
          {...props}
        >
          {children}
        </blockquote>
      )
    case "ul":
      return (
        <ul
          className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
          {...props}
        >
          {children}
        </ul>
      )
    case "ol":
      return (
        <ol
          className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
          {...props}
        >
          {children}
        </ol>
      )
    case "table":
      return (
        <table
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </table>
      )
    case "thead":
      return (
        <thead {...props}>
          {children}
        </thead>
      )
    case "tbody":
      return (
        <tbody {...props}>
          {children}
        </tbody>
      )
    case "tr":
      return (
        <tr
          className={cn("m-0 border-t p-0 even:bg-muted", className)}
          {...props}
        >
          {children}
        </tr>
      )
    case "th":
      return (
        <th
          className={cn("border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)}
          {...props}
        >
          {children}
        </th>
      )
    case "td":
      return (
        <td
          className={cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)}
          {...props}
        >
          {children}
        </td>
      )
    case "a":
      return (
        <a
          className={cn("font-medium text-primary underline underline-offset-4", className)}
          href={href}
          {...props}
        >
          {children}
        </a>
      )
    case "code":
      return (
        <code
          className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
        >
          {children}
        </code>
      )
    case "subtitle":
      return (
        <p
          className={cn("text-sm text-muted-foreground", className)}
        >
          {children}
        </p>
      )
    case "p":
      return (
        <p
          className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
          {...props}
        >
          {children}
        </p>
      )
    default:
      return (
        <p
          className={cn("", className)}
          {...props}
        >
          {children}
        </p>
      )
  }
}

export default Text
