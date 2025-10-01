export type User = {
    username: string;
    password: string;
}

export type LoginResponse = {
    user: User;
    token: string;
}

export type Login = {
    username: string
    password: string
}