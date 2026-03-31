'use strict';

const MongoTrackRepository = require('../repositories/mongo/MongoTrackRepository');
const MongoTagRepository = require('../repositories/mongo/MongoTagRepository');
const MongoRepostRepository = require('../repositories/mongo/MongoRepostRepository');
const MongoUserRepository = require('../repositories/mongo/MongoUserRepository');

const LocalFileStorage = require('./services/LocalFileStorage');
const MockAudioService = require('./services/MockAudioService');
const MockNotificationService = require('./services/MockNotificationService');

const makeCreateTrack = require('../usecases/createTrack');
const makePublishTrack = require('../usecases/publishTrack');
const makeArchiveTrack = require('../usecases/archiveTrack');
const makeDeleteTrack = require('../usecases/deleteTrack');
const makeGetArtistTracks = require('../usecases/getArtistTracks');
const makeGetTrack = require('../usecases/getTrack');
const makeUpdateTrackMetadata = require('../usecases/updateTrackMetadata');
const makeGetPopularTags = require('../usecases/getPopularTags');
const makeUploadAudio = require('../usecases/uploadAudio');
const makeUploadCover = require('../usecases/uploadCover');
const makeRepostTrack = require('../usecases/repostTrack');
const makeGetArtist = require('../usecases/getArtist');
const makeSearchUsers = require('../usecases/searchUsers');
const makeGetProfileFeed = require('../usecases/getProfileFeed');

const trackRepository = new MongoTrackRepository();
const tagRepository = new MongoTagRepository();
const repostRepository = new MongoRepostRepository();
const userRepository = new MongoUserRepository();

const fileStorage = new LocalFileStorage();
const audioService = new MockAudioService();
const notificationService = new MockNotificationService();

const container = {
  createTrack: makeCreateTrack({ trackRepository, tagRepository }),
  publishTrack: makePublishTrack({ trackRepository, audioService }),
  archiveTrack: makeArchiveTrack({ trackRepository }),
  deleteTrack: makeDeleteTrack({ trackRepository, fileStorage }),
  getArtistTracks: makeGetArtistTracks({ trackRepository }),
  getTrack: makeGetTrack({ trackRepository }),
  updateTrackMetadata: makeUpdateTrackMetadata({ trackRepository }),
  getPopularTags: makeGetPopularTags({ tagRepository }),
  uploadAudio: makeUploadAudio({ trackRepository, fileStorage }),
  uploadCover: makeUploadCover({ trackRepository, fileStorage }),

  repostTrack: makeRepostTrack({ trackRepository, repostRepository, notificationService }),
  getArtist: makeGetArtist({ trackRepository, userRepository }),
  searchUsers: makeSearchUsers({ userRepository }),
  getProfileFeed: makeGetProfileFeed({ trackRepository, repostRepository }),
};

module.exports = container;