/* 
Spotify API: https://github.com/jmperez/spotify-web-api-js
Documentation: https://doxdox.org/jmperez/spotify-web-api-js
*/

var spotifyApi;
var datamodel = {
  spotifyToken: null,
  searchData: null,
  tracks: [],
  selection: [],
  selectedTracks: []
};
var batchCount = -1;



// URLs for generating and authenticating token locally
var spotifyVerifyURL = "http://thenewten.org/sp/verify.php";
var spotifyVerifyURL_local =
  "https://cors-anywhere.herokuapp.com/http://thenewten.org/sp/verify.php";

datamodel.initSpotify = function (callback) {
  // Instantiate the Spotify API wrapper
  spotifyApi = new SpotifyWebApi();

  if (datamodel.getToken() != null) {
    console.log("MODEL: Token already exists");
    //return;
  }

  // Make call to custom URL that generates Spotify token and get the token
  $.ajax({
    url: spotifyVerifyURL_local,
    type: "GET",
    data: {}
  }).done(function (data) {
    // Parse JSON data and save access token to validate access to Spotify
    var tokenObject = JSON.parse(data);
    datamodel.saveToken(tokenObject.access_token);
    spotifyApi.setAccessToken(datamodel.getToken());
    callback();
  });
};

datamodel.saveToken = function (token) {
  datamodel.spotifyToken = token;
};

datamodel.getToken = function () {
  return datamodel.spotifyToken;
};

datamodel.handleError = function (err) {
  console.log("MODEL: Error when making a call", err);
  console.error(err);
};

datamodel.searchTracks = function (searchTerm, callback) {
  if (searchTerm == null) {
    console.log("MODEL: Cannot get tracks. No search term passed as a parameter");
    return null;
  }

  spotifyApi.searchTracks(searchTerm).then (
    function (data) {
      console.log('MODEL: Search by "' + searchTerm + '"', data);
      datamodel.searchData = data;
      datamodel.getResults();
      callback();
    },
    function (err) {
      datamodel.handleError(err);
    });
};

// Tracks that are returned by Spotify API are set to datamodel.tracks array
datamodel.getResults = function () {
  datamodel.tracks = datamodel.searchData.tracks.items;
}

datamodel.searchSelectedTrack = function (searchTerm, callback) {
  if (searchTerm == null) {
    console.log("MODEL: No search term passed as a parameter. No track selected");
    return null;
  }

  spotifyApi.searchTracks(searchTerm, {limit: 1}).then (
    function (data) {
      console.log('MODEL: Search by "' + searchTerm + '"', data);
      datamodel.searchData = data;
      datamodel.appendSelection();
      callback();
    },
    function (err) {
      datamodel.handleError(err);
    });
};

// Selected track searched for in Spotify API gets returned and set to datamodel.selectedTracks array
datamodel.appendSelection = function () {
  datamodel.selectedTracks = datamodel.searchData.tracks.items;
}

datamodel.getAudioFeaturesBatch = function (callbackdone) {
  // Set the number of calls to make (e.g., 20)
  batchCount = datamodel.tracks.length;

  // Loop through datamodel.tracks to get audio features
  for (var t = 0; t < datamodel.tracks.length; t++) {
    datamodel.getAudioFeatures(datamodel.tracks[t].id, t, function () {
      batchCount--;
      if (batchCount == 0) {
        console.log("MODEL: Batch audio feature complete. Count: " + batchCount);
        callbackdone();
      }
    });
  }
}

datamodel.getAudioFeatures = function (id, trackindex, callback) {
  spotifyApi.getAudioFeatures(id).then(
    function (data) {
      console.log("ID[" + id + "] Getting audio features", data);
      datamodel.tracks[trackindex].features = data;
      callback();
    },
    function (err) {
      datamodel.handleError(err);
    }
  );
};