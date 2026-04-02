const { GraphQLError } = require('graphql');
const container = require('../infrastructure/container');

function toGraphQLError(error) {
  const message = error?.message || 'Unexpected error.';
  const status = error?.status || 500;

  let code = 'INTERNAL_SERVER_ERROR';

  if (status === 400) code = 'BAD_REQUEST';
  if (status === 401) code = 'UNAUTHORIZED';
  if (status === 403) code = 'FORBIDDEN';
  if (status === 404) code = 'NOT_FOUND';
  if (status === 409) code = 'CONFLICT';

  return new GraphQLError(message, {
    extensions: {
      code,
      http: { status }
    }
  });
}

const resolvers = {
  Query: {
    getArtist: async (_, { id }) => {
      try {
        return await container.getArtist(id);
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },

  Mutation: {
    repostSong: async (_, { songId }, context) => {
      try {
        if (!context.user) {
          throw new GraphQLError('Unauthorized', {
            extensions: {
              code: 'UNAUTHORIZED',
              http: { status: 401 }
            }
          });
        }

        const userId = context.user._id;

        // если у вас уже lowercase:
        if (typeof container.repostTrack === 'function') {
          const dto = await container.repostTrack(songId, userId);
          return {
            id: dto.id,
            song: dto.song,
            user: {
              id: String(context.user._id),
              username: context.user.username,
            },
            timestamp: dto.timestamp,
          };
        }

        const dto = await container.RepostTrack(songId, userId);
        return {
          id: dto.id,
          song: dto.song,
          user: {
            id: String(context.user._id),
            username: context.user.username,
          },
          timestamp: dto.timestamp,
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw toGraphQLError(error);
      }
    },
  },
};

module.exports = resolvers;