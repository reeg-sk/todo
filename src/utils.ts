import { verify } from 'jsonwebtoken'

export const APP_SECRET = process.env.SECRET || '1234'

interface Token {
  userId: string
}

export function getUserId(authHeader: string | null) {
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    let verifiedToken = null
    try {
      verifiedToken = verify(token, APP_SECRET) as Token
    } catch(e) {
      // Do we want to log invalid tokens?
    }
    return verifiedToken && verifiedToken.userId
  }
}
