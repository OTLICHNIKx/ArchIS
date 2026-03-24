// infrastructure/container.js
// DI-контейнер — единственное место где знают о конкретных реализациях

'use strict';

// Репозитории (реализации)
const MongoTrackRepository = require('../repositories/mongo/MongoTrackRepository');
const MongoTagRepository   = require('../repositories/mongo/MongoTagRepository');

// Сервисы (реализации)
const LocalFileStorage  = require('./services/LocalFileStorage');
const MockAudioService  = require('./services/MockAudioService');

// Use cases (фабрики)
const makeCreateTrack         = require('../usecases/createTrack');
const makePublishTrack        = require('../usecases/publishTrack');
const makeArchiveTrack        = require('../usecases/archiveTrack');
const makeDeleteTrack         = require('../usecases/deleteTrack');
const makeGetArtistTracks     = require('../usecases/getArtistTracks');
const makeGetTrack            = require('../usecases/getTrack');
const makeUpdateTrackMetadata = require('../usecases/updateTrackMetadata');
const makeGetPopularTags      = require('../usecases/getPopularTags');

// Создаём реализации
const trackRepository = new MongoTrackRepository();
const tagRepository   = new MongoTagRepository();
const fileStorage     = new LocalFileStorage();
const audioService    = new MockAudioService();

// Собираем use cases — инжектируем зависимости
const container = {
  createTrack:         makeCreateTrack({ trackRepository, tagRepository }),
  publishTrack:        makePublishTrack({ trackRepository, audioService }),
  archiveTrack:        makeArchiveTrack({ trackRepository }),
  deleteTrack:         makeDeleteTrack({ trackRepository, fileStorage }),
  getArtistTracks:     makeGetArtistTracks({ trackRepository }),
  getTrack:            makeGetTrack({ trackRepository }),
  updateTrackMetadata: makeUpdateTrackMetadata({ trackRepository }),
  getPopularTags:      makeGetPopularTags({ tagRepository }),
};

module.exports = container;
