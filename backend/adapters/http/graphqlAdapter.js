const { createYoga, createSchema } = require('graphql-yoga');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const typeDefs = require('../../graphql/schema');
const resolvers = require('../../graphql/resolvers');

const schema = createSchema({
  typeDefs,
  resolvers,
});

async function getOptionalUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    return user || null;
  } catch (error) {
    // Для публичных GraphQL query не валим запрос целиком,
    // просто считаем пользователя неавторизованным
    console.warn('[GraphQL auth] Невалидный токен:', error.message);
    return null;
  }
}

const yoga = createYoga({
  schema,
  context: async ({ req }) => {
    const user = await getOptionalUser(req);
    return { user };
  },
  graphiql: true,
});

module.exports = yoga;