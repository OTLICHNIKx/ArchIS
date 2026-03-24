// usecases/getArtistTracks.js
// Сценарий: Получить все треки артиста
// GET /artists/tracks

'use strict';

function makeGetArtistTracks({ trackRepository }) {

  return async function getArtistTracks(artistId) {
    const tracks = await trackRepository.findAllByArtist(artistId);
    return tracks;
  };
}

module.exports = makeGetArtistTracks;