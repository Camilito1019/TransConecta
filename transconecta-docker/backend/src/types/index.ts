export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    createdAt: Date;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}