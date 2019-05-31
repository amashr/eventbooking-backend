require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./Query');
const Mutation = require('./Mutation');

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers: {
    Query,
    Mutation
  },
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
