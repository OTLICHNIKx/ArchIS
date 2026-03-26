const { createYoga } = require('graphql-yoga');
const typeDefs = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const { protect } = require('../../middleware/auth'); // твой существующий auth middleware

// Создаём Yoga-сервер
const yoga = createYoga({
  schema: { typeDefs, resolvers },
  context: async ({ req }) => {
    // Прогоняем protect middleware, чтобы заполнить req.user
    await new Promise((resolve) => {
      protect(req, { status: () => ({ json: () => {} }) }, resolve);
    });
    return { user: req.user };
  },
  graphiql: true, // Playground будет доступен
});

module.exports = yoga;