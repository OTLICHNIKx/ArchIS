// infrastructure/services/container.js
'use strict';

// Репозитории
const MongoTrackRepository = require('../repositories/mongo/MongoTrackRepository');
const MongoTagRepository   = require('../repositories/mongo/MongoTagRepository');

// Сервисы
const LocalFileStorage = require('./LocalFileStorage');
const MockAudioService = require('./MockAudioService');

// Use cases
const makeCreateTrack         = require('../usecases/createTrack');
const makePublishTrack        = require('../usecases/publishTrack');
const makeArchiveTrack        = require('../usecases/archiveTrack');
const makeDeleteTrack         = require('../usecases/deleteTrack');
const makeGetArtistTracks     = require('../usecases/getArtistTracks');
const makeGetTrack            = require('../usecases/getTrack');
const makeUpdateTrackMetadata = require('../usecases/updateTrackMetadata');
const makeGetPopularTags      = require('../usecases/getPopularTags');
const makeUploadAudio         = require('../usecases/uploadAudio');

// Реализации
const trackRepository = new MongoTrackRepository();
const tagRepository   = new MongoTagRepository();
const fileStorage     = new LocalFileStorage();
const audioService    = new MockAudioService();

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
};

module.exports = container;