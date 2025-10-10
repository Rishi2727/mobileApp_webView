import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


export type MyDialogProps = {
    children?: React.ReactNode
    title: string
    description?: string
    body: React.ReactNode
    footer?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const MyDialog = ({ title, description, children, footer, body, open, onOpenChange }: MyDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children &&
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            }
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {body}
                </div>
                {footer && <DialogFooter>
                    {footer}
                </DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}

export default MyDialog;