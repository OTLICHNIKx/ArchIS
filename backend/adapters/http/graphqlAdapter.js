const { createYoga, createSchema } = require('graphql-yoga');
const typeDefs = require('../../graphql/schema');
const resolvers = require('../../graphql/resolvers');
const { protect } = require('../../middleware/auth');

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: async ({ req }) => {
    // Прогоняем auth middleware
    await new Promise((resolve) => {
      protect(req, { status: () => ({ json: () => {} }) }, resolve);
    });
    return { user: req.user };
  },
  graphiql: true,
});

module.exports = yoga;