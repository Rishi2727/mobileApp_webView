import { DialogContent, DialogTrigger, Dialog, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Icon, type IconName } from "@/components/ui/custom/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ReactNode, ReactElement } from "react"
import { cn } from "@/lib/utils"

type DisplayMode = "popover" | "sheet" | "drawer" | "dialog" | "hover-card" | "tooltip" | "card" | "page"

type DisplaySize = "sm" | "md" | "lg" | "xl" | "full" | "auto"

type TriggerProps = {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  icon?: IconName
  children?: ReactNode
}

type DisplayWrapperProps = {
  mode?: DisplayMode
  children?: ReactNode
  trigger?: ReactElement | TriggerProps | string
  title?: string
  description?: string
  className?: string
  contentClassName?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: DisplaySize
  width?: string | number
  height?: string | number
  openDelay?: number
  closeDelay?: number
  resistClose?: boolean
}

const sizeClasses = {
  dialog: {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[700px]",
    lg: "sm:max-w-[900px]",
    xl: "sm:max-w-[1200px]",
    full: "sm:max-w-[95vw]",
    auto: ""
  },
  sheet: {
    sm: "!w-[300px] sm:!w-[400px] !max-w-[400px]",
    md: "!w-[400px] sm:!w-[540px] !max-w-[540px]",
    lg: "!w-[500px] sm:!w-[700px] !max-w-[700px]",
    xl: "!w-[600px] sm:!w-[900px] !max-w-[900px]",
    full: "!w-full !max-w-full",
    auto: ""
  },
  drawer: {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full",
    auto: ""
  },
  popover: {
    sm: "w-[200px]",
    md: "w-[300px]",
    lg: "w-[400px]",
    xl: "w-[500px]",
    full: "w-[95vw]",
    auto: ""
  },
  "hover-card": {
    sm: "w-[200px]",
    md: "w-[300px]",
    lg: "w-[400px]",
    xl: "w-[500px]",
    full: "w-[95vw]",
    auto: ""
  },
  tooltip: {
    sm: "max-w-[200px]",
    md: "max-w-[300px]",
    lg: "max-w-[400px]",
    xl: "max-w-[500px]",
    full: "max-w-[95vw]",
    auto: ""
  },
  card: {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
    auto: ""
  },
  page: {
    sm: "",
    md: "",
    lg: "",
    xl: "",
    full: "",
    auto: ""
  }
}

const DisplayWrapper = ({
  mode = 'dialog',
  children,
  trigger,
  title,
  description,
  className,
  contentClassName,
  side = "right",
  align = "start",
  sideOffset = 4,
  open,
  onOpenChange,
  size = "md",
  width,
  height,
  openDelay = 0,
  closeDelay = 0,
  resistClose = false
}: DisplayWrapperProps) => {

  const defaultTrigger = (
    null
  )

  const renderTrigger = () => {
    if (!trigger) return defaultTrigger

    if (typeof trigger === 'string') {
      return <Button variant="outline">{trigger}</Button>
    }

    if (typeof trigger === 'object' && !('$$typeof' in trigger)) {
      const { variant, size, className: triggerClassName, icon, children: triggerChildren } = trigger as TriggerProps
      return (
        <Button
          variant={variant ?? "outline"}
          size={size}
          className={triggerClassName}
        >
          {icon && <Icon name={icon} className={cn("h-4 w-4")} />}
          {triggerChildren}
        </Button>
      )
    }

    return trigger as ReactElement
  }

  const renderContent = () => {
    if (mode === 'tooltip') {
      return (
        <>
          {title && <span className="font-medium">{title}</span>}
          {title && description && <br />}
          {description && <span className="text-xs opacity-90">{description}</span>}
          {!title && !description && children}
        </>
      )
    }

    const needsScrollArea = (mode === 'dialog' || mode === 'sheet' || mode === 'drawer') && !height

    // Special handling for dialog mode to use proper DialogTitle and DialogDescription
    if (mode === 'dialog') {
      return (
        <>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {needsScrollArea ? (
            <ScrollArea className="max-h-[70vh] w-full">
              <div className={cn(contentClassName)}>
                {children}
              </div>
            </ScrollArea>
          ) : (
            <div className={cn(contentClassName)}>
              {children}
            </div>
          )}
        </>
      )
    }

    // Special handling for sheet mode to use proper SheetTitle and SheetDescription
    if (mode === 'sheet') {
      return (
        <>
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          )}
          {needsScrollArea ? (
            <ScrollArea className="max-h-[70vh] w-full">
              <div className={cn(contentClassName)}>
                {children}
              </div>
            </ScrollArea>
          ) : (
            <div className={cn(contentClassName)}>
              {children}
            </div>
          )}
        </>
      )
    }

    if (needsScrollArea) {
      return (
        <>
          {title && (
            <div className="space-y-2 pb-4">
              <h4 className="font-medium leading-none">{title}</h4>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <ScrollArea className="max-h-[70vh] w-full">
            <div className={cn(contentClassName)}>
              {children}
            </div>
          </ScrollArea>
        </>
      )
    }

    return (
      <div className={cn(contentClassName)}>
        {title && (
          <div className="space-y-2 pb-4">
            <h4 className="font-medium leading-none">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }

  const getSizeClass = () => {
    if (width || height) return ""
    if (mode === 'page' || mode === 'card') {
      return sizeClasses[mode]?.[size] || ""
    }
    return sizeClasses[mode]?.[size] || ""
  }

  const getCustomStyle = () => {
    const style: React.CSSProperties = {}
    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width
      style.maxWidth = typeof width === 'number' ? `${width}px` : width
    }
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height
    }
    return style
  }

  switch (mode) {
    case 'tooltip': {
      return (
        <Tooltip open={open} onOpenChange={onOpenChange}>
          <TooltipTrigger asChild>
            {renderTrigger()}
          </TooltipTrigger>
          <TooltipContent
            className={cn(getSizeClass(), className)}
            side={side}
            sideOffset={sideOffset}
            style={getCustomStyle()}
          >
            {renderContent()}
          </TooltipContent>
        </Tooltip>
      )
    }

    case 'hover-card':
      return (
        <HoverCard open={open} onOpenChange={onOpenChange} openDelay={openDelay} closeDelay={closeDelay}>
          <HoverCardTrigger asChild>
            {renderTrigger()}
          </HoverCardTrigger>
          <HoverCardContent
            className={cn(getSizeClass(), className)}
            side={side}
            align={align}
            sideOffset={sideOffset}
            style={getCustomStyle()}
          >
            {renderContent()}
          </HoverCardContent>
        </HoverCard>
      )

    case 'popover':
      return (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            {renderTrigger()}
          </PopoverTrigger>
          <PopoverContent
            className={cn(getSizeClass(), className)}
            side={side}
            align={align}
            sideOffset={sideOffset}
            style={getCustomStyle()}
          >
            {renderContent()}
          </PopoverContent>
        </Popover>
      )

    case 'sheet':
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            {renderTrigger()}
          </SheetTrigger>
          <SheetContent
            side={side}
            className={cn(getSizeClass(), className)}
            style={getCustomStyle()}
            onInteractOutside={resistClose ? (e) => e.preventDefault() : undefined}
          >
            {renderContent()}
          </SheetContent>
        </Sheet>
      )

    case 'drawer':
      return (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerTrigger asChild>
            {renderTrigger()}
          </DrawerTrigger>
          <DrawerContent className={className}>
            <div
              className={cn("mx-auto w-full", getSizeClass())}
              style={getCustomStyle()}
            >
              {renderContent()}
            </div>
          </DrawerContent>
        </Drawer>
      )

    case 'dialog':
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            {renderTrigger()}
          </DialogTrigger>
          <DialogContent
            className={cn(getSizeClass(), className)}
            style={getCustomStyle()}
            onInteractOutside={resistClose ? (e) => e.preventDefault() : undefined}
          >
            {renderContent()}
          </DialogContent>
        </Dialog>
      )

    case 'card':
      return (
        <Card className={cn(getSizeClass(), className)} style={getCustomStyle()}>
          {(title || description) && (
            <CardHeader>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          )}
          <CardContent className={cn(contentClassName)}>
            {children}
          </CardContent>
        </Card>
      )

    case 'page':
      return (
        <div className={cn(getSizeClass(), className)} style={getCustomStyle()}>
          {(title || description) && (
            <div className="space-y-2 pb-4">
              {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          )}
          <div className={cn(contentClassName)}>
            {children}
          </div>
        </div>
      )

    default:
      return null
  }
}

export default DisplayWrapper
