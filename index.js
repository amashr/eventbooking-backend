const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');

const resolvers = {
  Query: {},
  Mutation: {}
};

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
  context: {
    prisma
  }
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  ({ port }) => {
    console.log(`Server is running on http://localhost:${port}`);
  }
);
