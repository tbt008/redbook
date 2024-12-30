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
        userId: number 
        rootId: number
        parentId: number
        authorAvatar: string
        content: string
        createTime: number[]
    }>
    isLiked: boolean
    isFavorited: boolean
}