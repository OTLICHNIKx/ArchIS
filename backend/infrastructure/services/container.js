// backend/infrastructure/services/container.js
// DI-контейнер — единственное место, где собираются все зависимости

'use strict';

// === РЕПОЗИТОРИИ ===
const MongoTrackRepository = require('../../repositories/mongo/MongoTrackRepository');
const MongoTagRepository   = require('../../repositories/mongo/MongoTagRepository');

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

// Новые use cases для воркфлоу из Практики 1
const makeRepostSong          = require('../../usecases/repostSong');
const makeGetArtist           = require('../../usecases/getArtist');

// Создаём реализации
const trackRepository = new MongoTrackRepository();
const tagRepository   = new MongoTagRepository();
const notificationService = new MockNotificationService();

// Собираем use cases
const container = {
  createTrack:         makeCreateTrack({ trackRepository, tagRepository }),
  publishTrack:        makePublishTrack({ trackRepository, audioService: null }), // если audioService не используется — можно убрать позже
  archiveTrack:        makeArchiveTrack({ trackRepository }),
  deleteTrack:         makeDeleteTrack({ trackRepository, fileStorage: null }),
  getArtistTracks:     makeGetArtistTracks({ trackRepository }),
  getTrack:            makeGetTrack({ trackRepository }),
  updateTrackMetadata: makeUpdateTrackMetadata({ trackRepository }),
  getPopularTags:      makeGetPopularTags({ tagRepository }),
  uploadAudio:         makeUploadAudio({ trackRepository, fileStorage: null }),

  // === Новые use cases ===
  repostSong:          makeRepostSong({
    trackRepository,
    repostRepository: null,        // ← пока null, исправим в следующем шаге
    notificationService
  }),
  getArtist:           makeGetArtist({ trackRepository })
};

module.exports = container;