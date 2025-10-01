import { cn } from "@/lib/utils"
import { z } from "zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { storage } from "@/lib/storage"
import MyForm, { type FormFieldItem } from "@/components/ui/custom/my-form/MyForm"
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { usePostApi } from "@/hooks/useApi"
import { endpoints } from "@/lib/endpoints"
import useLoaderStore from "@/store/useLoaderStore"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import useProfileStore from "@/store/useProfileStore"
import type { Login, LoginResponse } from "@/types/models"
const loginSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    })
})

export function LoginForm({
    className,
    ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
    const navigate = useNavigate();
    const login = usePostApi<LoginResponse>();
    const { startLoading, stopLoading } = useLoaderStore();
    const { setUser } = useProfileStore();

    const handleSubmit = async (values: Login) => {
        await login.postData(
            endpoints.auth.login,
            { username: values.username, password: values.password },
            {
                actionCallbacks: {
                    onSuccess: (data) => {
                        setUser(data.user);
                        storage.set("AUTH_TOKEN", data.token);
                        toast.success("Login Successful");
                        navigate("/");
                    },
                    onLoadingStart: () => startLoading(),
                    onLoadingStop: () => stopLoading(),
                    onError: (error) => toast.error(error ?? "Login failed")
                }
            });
    };

    const [showPassword, setShowPassword] = useState(false);

    const formItemData: FormFieldItem<Login>[] = [
        {
            label: "Student Number or ID",
            name: "username",
            render: ({ field }) => (
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Enter your username"
                        className="pl-10 h-12"
                        {...field}
                    />
                </div>
            )
        },
        {
            label: "Password",
            name: "password",
            render: ({ field, form }) => (
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
            <Card className="border-0 shadow-md">
                <CardHeader className="space-y-6">

                    {/* Welcome Text */}
                    <div className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Sign in to continue
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
                                    Login
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                                >
                                    One Day Pass Request
                                </Button>
                            </div>
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
