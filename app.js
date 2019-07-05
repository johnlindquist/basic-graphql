const { ApolloServer, gql, PubSub } = require("apollo-server")

const NOTE_UPDATED = "NOTE_UPDATED"

const pubsub = new PubSub()

let note = {
  from: "John",
  message: "Hello"
}

const typeDefs = gql`
  type Note {
    from: String
    message: String
  }

  type Query {
    note: Note
  }

  type Mutation {
    updateNote(message: String, from: String): Note!
  }

  type Subscription {
    noteUpdated: Note
  }
`

const resolvers = {
  Query: {
    note: () => note
  },
  Mutation: {
    updateNote(parent, { message, from }) {
      message && (note.message = message)
      from && (note.from = from)
      ;(message || from) && pubsub.publish(NOTE_UPDATED, { noteUpdated: note })

      return note
    }
  },
  Subscription: {
    noteUpdated: {
      subscribe: () => pubsub.asyncIterator([NOTE_UPDATED])
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
