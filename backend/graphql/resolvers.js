const container = require('../infrastructure/container');

const resolvers = {
  Query: {
    getArtist: async (_, { id }) => {
      return container.getArtist(id);
    },
  },

  Mutation: {
    repostSong: async (_, { songId }, context) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const userId = context.user._id;
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
    },
  },
};

module.exports = resolvers;