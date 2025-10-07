import React from 'react'
import { cn } from "@/lib/utils"

export type ImageProps = {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  rounded?: boolean
  fallbackSrc?: string
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  loading?: "eager" | "lazy"
  type?: "svg" | "image"
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "loading">

export function Image({
  src,
  alt,
  width,
  height,
  className,
  objectFit = "cover",
  rounded = false,
  fallbackSrc,
  onError,
  loading = "lazy",
  type,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(src)
  const [hasError, setHasError] = React.useState<boolean>(false)
  const [svgContent, setSvgContent] = React.useState<string | null>(null)

  const isSvg = type === "svg" || (!type && (src.toLowerCase().endsWith('.svg') || src.includes('data:image/svg+xml')))

  React.useEffect(() => {
    setImgSrc(src)
    setHasError(false)
    
    if (isSvg) {
      fetch(src)
        .then(res => res.text())
        .then(text => {
          const coloredSvg = text
            .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
            .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
          setSvgContent(coloredSvg)
        })
        .catch(() => setSvgContent(null))
    }
  }, [src, isSvg])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && !hasError) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
    onError?.(e)
  }

  const commonClasses = cn(
    "max-w-full",
    rounded && "rounded-md",
    className
  )

  const sizeStyles = {
    width: width ?? "auto",
    height: height ?? "auto",
  }

  if (isSvg && svgContent) {
    return (
      <div
        className={cn(commonClasses, "inline-flex items-center justify-center")}
        style={sizeStyles}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        {...props}
      />
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={commonClasses}
      style={{ ...sizeStyles, objectFit }}
      loading={loading}
      onError={handleError}
      {...props}
    />
  )
}