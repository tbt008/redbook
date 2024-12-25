// 文章接口定义
export interface Article {
    id: string
    userId: string
    title: string
    likeNum: number
    favourNum: number
    createTime: number[]
    content: string
    articleTypeName: string
    articleType: number
    articleReads: number
    sourceId: string
    comments: Array<{
        id: number
        author: string
        authorAvatar: string
        content: string
        createTime: string
    }>
    isLiked: boolean
    isFavorited: boolean
}