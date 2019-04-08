/**
 * @file server
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const BlockProducer = require('./BlockProducer');
const NetworkStatsAgent = require('./NetworkStatsAgent');
const PriceAgent = require('./PriceAgent');
const Query = require('./resolvers/query');
// Do not expose mutations on deployed server.
// const Mutation = require('./resolvers/mutation');
const Subscription = require('./resolvers/subscription');
const Block = require('./resolvers/Block');
const SearchGetTypeResult = require('./resolvers/SearchGetTypeResult');
const SearchAutoCompleteResult = require('./resolvers/SearchAutoCompleteResult');

const resolvers = {
  Query,
  // Do not expose mutations on deployed server.
  // Mutation,
  Subscription,
  Block,
  SearchGetTypeResult,
  SearchAutoCompleteResult
};

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'https://dfinity-explorer.herokuapp.com/dfinity-explorer-b/dev',
  secret: process.env.PRISMA_SECRET,
  // Setting debug to true means that all requests made by Prisma binding instance to Prisma
  // API will be logged to the console. Set to false for production.
  debug: false
});

// --- Notes on deploying Prisma service changes ---
// After changing datamodel.prisma, run:
//  $ prisma deploy
//
// --- Notes on using GraphQL Playground with Prisma server ---
// The easiest way to obtain an API token is by using the prisma token command from the Prisma CLI:
//  prisma token
// Next, open the Prisma server URL in a browser:
//  https://dfinity-explorer.herokuapp.com/dfinity-explorer-b/dev
// Put this into the HTTP HEADERS field of GraphQL Playground:
//  {
//    "Authorization": "Bearer [token]"
//  }
// For more details, see:
//  https://www.prisma.io/docs/reference/prisma-api/concepts-utee3eiquo#authentication
//
// --- Notes on using GraphQL Playground to delete blocks and transactions ---
// mutation {
//   deleteManyTransactions(where: { block: { height_lt: 1600000 } }) {
//     count
//   }
// }
// mutation {
//   deleteManyBlocks(where: { height_lt: 1600000 }) {
//     count
//   }
// }

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
  context: req => ({
    ...req,
    db: prisma,
  })
});

server.start(() => console.log('The server is running on port 4000...'));

// Add simulated blocks to the Prisma server at 3.5 second intervals.
const blockProducer = new BlockProducer(prisma);
blockProducer.start();

// Continuously update network stats information on the Prisma server.
const networkStatsAgent = new NetworkStatsAgent(prisma);
networkStatsAgent.start();

// Continuously update DFN price information on the Prisma server.
const priceAgent = new PriceAgent(prisma);
priceAgent.start();
