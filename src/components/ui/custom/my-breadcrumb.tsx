import { Fragment } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router"
import { useLanguage } from "@/contexts/useLanguage"

export type BreadcrumbData = {
    id: string | number
    label: string
}

type MyBreadcrumbProps = {
    items: BreadcrumbData[]
    title?: string
    showBackButton?: boolean
}

function MyBreadcrumb({
    items,
    title,
    showBackButton = false,
}: Readonly<MyBreadcrumbProps>) {
    const navigate = useNavigate()
    const currentPageTitle = title || items[items.length - 1]?.label || ""
    const { t } = useLanguage();

    return (
        <div className="bg-primary flex min-h-[60px]">
            {showBackButton && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center pl-4 text-primary cursor-pointer hover:opacity-75"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-5 w-5 text-secondary" />
                </button>
            )}

            <div className="flex flex-col px-3 py-1">
                <h1 className="text-md font-medium text-secondary">
                    {currentPageTitle}
                </h1>

                <Breadcrumb>
                    <BreadcrumbList className="flex flex-wrap text-secondary">
                        {items.map((item, index) => (
                            <Fragment key={item.id}>
                                <BreadcrumbItem>
                                    <span className="truncate text-[13px]">{t(item.label)}</span>
                                </BreadcrumbItem>
                                {index < items.length - 1 && (
                                    <BreadcrumbSeparator className=" text-slate-400">
                                        »
                                    </BreadcrumbSeparator>
                                )}
                            </Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
    )
}

export default MyBreadcrumb