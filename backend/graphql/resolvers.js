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
      return container.RepostTrack(songId, userId);
    },
  },
};

module.exports = resolvers;