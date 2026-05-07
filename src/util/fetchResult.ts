export async function parseResultResponse<T = any>(response: Response): Promise<T> {
  let result: any = null

  try {
    result = await response.json()
  } catch (error) {
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`)
    }
    throw new Error('响应数据格式错误')
  }

  if (!response.ok || result?.code !== 200) {
    throw new Error(result?.msg || result?.message || `请求失败：${response.status}`)
  }

  return result.data as T
}

export function authHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    ...extraHeaders,
    'auth-token': localStorage.getItem('auth-token') || ''
  }
}
