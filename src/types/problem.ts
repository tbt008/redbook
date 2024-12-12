// 题目接口
export interface Problem {
    questionId: number
    isPass: number | null
    title: string
    questionName: string
    difficulty: number
    difficultyName: string
    passRate: number
    tags: string[]
    tryPerson: number
    passPerson: number
}
