export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: CommentatorInfoType
    createdAt: string
}

//types
export type CommentatorInfoType = {
    userId: string
    userLogin: string
}
