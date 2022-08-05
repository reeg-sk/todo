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
    origin: ['*'],
    credentials: true,
  },
})

server.listen().then(async ({ url }) => {
  console.log(`🚀 Server ready at: ${url}`)
})
