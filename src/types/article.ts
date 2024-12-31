// 定义递归的评论类型
interface Comment {
  id: number
  userId: number
  rootId: number
  parentId: number
  authorAvatar: string
  content: string
  createTime: number[]
  children?: Comment[]
}

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
    comments: Comment[]
    isLiked: boolean
    isFavorited: boolean
}