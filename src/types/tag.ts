export interface Tag {
    id: number
    name: string
    superName: string
}
 
  
export interface TagGroup {
    superName: string
    tags: Tag[]
  }