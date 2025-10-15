import { cn } from "@/lib/utils"
import { z } from "zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import MyForm, { type FormFieldItem } from "@/components/ui/custom/my-form/MyForm"
import { Input } from "@/components/ui/input"
import useLoaderStore from "@/store/useLoaderStore"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuthStore } from "@/store/AuthStore"
import type { Login } from "@/types/models"
import { useNavigate } from "react-router"


const loginSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    })
})

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
    t: (key: string) => string;
}

export function LoginForm({
    t,
    className,
    ...props
}: Readonly<LoginFormProps>) {
    const { login } = useAuthStore();
    const { startLoading, stopLoading } = useLoaderStore();
    const navigate = useNavigate()
 
    const handleSubmit = async (values: Login) => {
        try {
            startLoading();
            await login(values.username, values.password);
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            stopLoading();
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const formItemData: FormFieldItem<Login>[] = [
        {
            label: t('auth.studentId'),
            name: "username",
            render: ({ field }) => (
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder={t('auth.enterStudentId')}
                        className="pl-10 h-12"
                        {...field}
                    />
                </div>
            )
        },
        {
            label: t('auth.password'),
            name: "password",
            render: ({ field, form }) => (
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.enterPassword')}
                        className="pl-10 pr-10 h-12"
                        {...field}
                        disabled={!form.watch("username")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!field.value}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
            )
        }
    ];
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-[0_0_3px_rgba(0,0,0,0.3)]">
                <CardHeader className="space-y-6">

                    {/* Welcome Text */}
                    <div className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold">
                            {t('auth.greeting')}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            {t('auth.signInMessage')}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <MyForm
                        formSchema={loginSchema}
                        defaultValues={{
                            username: "",
                            password: "",
                        }}
                        formItemData={formItemData}
                        onSubmit={handleSubmit}
                        buttonActions={
                            <div className="grid grid-row-1 sm:grid-row-2 gap-2">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold text-secondary bg-primary hover:bg-primary/80 cursor-pointer"
                                >
                                     {t('auth.login')}
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                                    onClick={()=> navigate("/one-day-pass")}
                                >
                                    {t('externalUser.title')}
                                </Button>
                            </div>
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
