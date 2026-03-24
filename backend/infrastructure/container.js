// infrastructure/services/container.js
// DI-контейнер — единственное место, где собираются все зависимости

'use strict';

// === РЕПОЗИТОРИИ ===
const MongoTrackRepository = require('../repositories/mongo/MongoTrackRepository');
const MongoTagRepository   = require('../repositories/mongo/MongoTagRepository');
const MongoRepostRepository = require('../repositories/mongo/MongoRepostRepository');
// === СЕРВИСЫ ===
const LocalFileStorage = require('./services/LocalFileStorage');
const MockAudioService = require('./services/MockAudioService');
const MockNotificationService = require('./services/MockNotificationService');

// === USE CASES ===
const makeCreateTrack         = require('../usecases/createTrack');
const makePublishTrack        = require('../usecases/publishTrack');
const makeArchiveTrack        = require('../usecases/archiveTrack');
const makeDeleteTrack         = require('../usecases/deleteTrack');
const makeGetArtistTracks     = require('../usecases/getArtistTracks');
const makeGetTrack            = require('../usecases/getTrack');
const makeUpdateTrackMetadata = require('../usecases/updateTrackMetadata');
const makeGetPopularTags      = require('../usecases/getPopularTags');
const makeUploadAudio         = require('../usecases/uploadAudio');
const makeRepostTrack          = require('../usecases/RepostTrack');
const makeGetArtist           = require('../usecases/getArtist');

// Создаём реализации
const trackRepository     = new MongoTrackRepository();
const tagRepository       = new MongoTagRepository();
const fileStorage         = new LocalFileStorage();
const audioService        = new MockAudioService();
const repostRepository    = new MongoRepostRepository();
const notificationService = new MockNotificationService();

// Собираем use cases
const container = {
  createTrack:         makeCreateTrack({ trackRepository, tagRepository }),
  publishTrack:        makePublishTrack({ trackRepository, audioService }),
  archiveTrack:        makeArchiveTrack({ trackRepository }),
  deleteTrack:         makeDeleteTrack({ trackRepository, fileStorage }),
  getArtistTracks:     makeGetArtistTracks({ trackRepository }),
  getTrack:            makeGetTrack({ trackRepository }),
  updateTrackMetadata: makeUpdateTrackMetadata({ trackRepository }),
  getPopularTags:      makeGetPopularTags({ tagRepository }),
  uploadAudio:         makeUploadAudio({ trackRepository, fileStorage }),
  RepostTrack:          makeRepostTrack({ trackRepository, repostRepository, notificationService }),
  getArtist:           makeGetArtist({ trackRepository }),
};

module.exports = container;