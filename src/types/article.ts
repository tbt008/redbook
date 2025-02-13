// 定义递归的评论类型
interface Comment {
  id: number
  userId: number
  nickName: string
  rootId: number
  parentId: number
  avatar: string
  content: string
  createTime: number[]
  children?: Comment[]
}

// 文章接口定义
export interface Article {
  id: string
  userId: string
  nickName: string
  title: string
  likeNum: number
  favourNum: number
  createTime: number[]
  content: string
  avatar: string
  articleTypeName: string
  articleType: number
  articleReads: number
  sourceId: number
  comments: Comment[]
  isLiked: boolean
  isFavorited: boolean
}