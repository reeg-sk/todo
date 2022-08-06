import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { createContext } from './context'

// TODO: https://www.envelop.dev/plugins/use-operation-field-permissions - permission layer
const server = new ApolloServer({
  schema: schema,
  context: createContext,
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
