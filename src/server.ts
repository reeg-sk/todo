import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { prisma } from './context'
import { getUserId } from './utils'

const server = new ApolloServer({
  schema: schema,
  context: ({ req }) => {
    const token = req?.headers?.authorization || null    
    const userId = getUserId(token)
        
    return {
      userId,
      prisma,
    }
  },
  csrfPrevention: true,
  cache: 'bounded',
  cors: {
    origin: '*',
    credentials: true,
  },
})

const port = process.env.PORT || 4000

server.listen({ port }).then(async ({ url }) => {
  console.log(`🚀 Server ready at: ${url}`)
})
