const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Artist {
    id: ID!
    name: String!
    bio: String
    songs: [Song!]!
  }

  type Song {
    id: ID!
    title: String!
    repostCount: Int!
  }

  type User {
    id: ID!
    username: String!
  }

  type Repost {
    id: ID!
    song: Song!
    user: User!
    timestamp: String!
  }

  type Query {
    getArtist(id: ID!): Artist
  }

  type Mutation {
    repostSong(songId: ID!): Repost
  }
`;

module.exports = typeDefs;