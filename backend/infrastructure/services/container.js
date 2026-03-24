// backend/infrastructure/services/container.js
'use strict';

// === РЕПОЗИТОРИИ ===
const MongoTrackRepository = require('../../repositories/mongo/MongoTrackRepository');
const MongoTagRepository   = require('../../repositories/mongo/MongoTagRepository');
const InMemoryRepostRepository = require('../../repositories/in_memory/InMemoryRepostRepository');

// === СЕРВИСЫ ===
const MockNotificationService = require('./MockNotificationService');

// === USE CASES ===
const makeCreateTrack         = require('../../usecases/createTrack');
const makePublishTrack        = require('../../usecases/publishTrack');
const makeArchiveTrack        = require('../../usecases/archiveTrack');
const makeDeleteTrack         = require('../../usecases/deleteTrack');
const makeGetArtistTracks     = require('../../usecases/getArtistTracks');
const makeGetTrack            = require('../../usecases/getTrack');
const makeUpdateTrackMetadata = require('../../usecases/updateTrackMetadata');
const makeGetPopularTags      = require('../../usecases/getPopularTags');
const makeUploadAudio         = require('../../usecases/uploadAudio');

const makeRepostSong          = require('../../usecases/repostSong');
const makeGetArtist           = require('../../usecases/getArtist');

// Создаём реализации
const trackRepository = new MongoTrackRepository();
const tagRepository   = new MongoTagRepository();
const repostRepository = new InMemoryRepostRepository();
const notificationService = new MockNotificationService();

// Собираем use cases
const container = {
  createTrack:         makeCreateTrack({ trackRepository, tagRepository }),
  publishTrack:        makePublishTrack({ trackRepository, audioService: null }),
  archiveTrack:        makeArchiveTrack({ trackRepository }),
  deleteTrack:         makeDeleteTrack({ trackRepository, fileStorage: null }),
  getArtistTracks:     makeGetArtistTracks({ trackRepository }),
  getTrack:            makeGetTrack({ trackRepository }),
  updateTrackMetadata: makeUpdateTrackMetadata({ trackRepository }),
  getPopularTags:      makeGetPopularTags({ tagRepository }),
  uploadAudio:         makeUploadAudio({ trackRepository, fileStorage: null }),

  // Новые use cases для воркфлоу репоста
  repostSong: makeRepostSong({
    trackRepository,
    repostRepository,
    notificationService
  }),
  getArtist: makeGetArtist({ trackRepository })
};

module.exports = container;