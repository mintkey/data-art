/* 
Spotify API: https://github.com/jmperez/spotify-web-api-js
Documenttion: https://doxdox.org/jmperez/spotify-web-api-js
*/

var spotifyApi;
var datamodel = {
  spotifyToken: null,
  track: {},
  tracks: [],
  searchData: null
};
var tempBatchCount = -1;

//URLs for authenticating and getting token remotely
var spotifyVerifyURL = "http://thenewten.org/sp/verify.php";
var spotifyVerifyURL_local =
  "https://cors-anywhere.herokuapp.com/http://thenewten.org/sp/verify.php";


//--------- SPOTIFY --------------


datamodel.initSpotify = function (callback) {
  //instantiate the Spotify API wrapper
  spotifyApi = new SpotifyWebApi();

  //check to see if there's an existing token
  if (datamodel.getToken() != null) {
    console.log("MODEL: Token already exists");
    //return;
  }

  //make call to custom PHP file to get token
  $.ajax({
    url: spotifyVerifyURL_local,
    type: "GET",
    data: {}
  }).done(function (data) {

    //parse the data (token) to validate access to spotify
    var tokenObj = JSON.parse(data);
    datamodel.saveTheToken(tokenObj.access_token);
    spotifyApi.setAccessToken(datamodel.getToken());
    callback();
  });
};

datamodel.saveTheToken = function (token) {
  datamodel.spotifyToken = token;
};

datamodel.getToken = function () {
  return datamodel.spotifyToken;
};

datamodel.handleError = function (err) {
  console.log("MODEL: Error when making a call", err);
  //console.error(err);
};

datamodel.searchTracks = function (searchterm, callback) {
  if (searchterm == null) {
    console.log("MODEL: Cannot get tracks. No search term passed as a parameter");
    return null;
  }
  spotifyApi.searchTracks(searchterm).then(
    function (data) {
      console.log('MODEL: Search by "' + searchterm + '"', data);
      datamodel.searchData = data;
      datamodel.selectTracks();
      callback();
    },
    function (err) {
      datamodel.handleError(err);
    }
  );
};

/*
Note: In the future this is where we can specify which tracks to "choose"
Right now it's choosing all returned (20 or less)
*/
datamodel.selectTracks = function (selections) {
  //hard-coded to select the first five
  datamodel.tracks = datamodel.searchData.tracks.items;
  model.track = datamodel.tracks[];
}

datamodel.getAudioFeaturesBatch = function (callbackdone) {
  //set the number of calls to make (e.g., 20)
  tempBatchCount = datamodel.tracks.length;

  //loop through all of the tracks to grab their audio features
  for (var t = 0; t < datamodel.tracks.length; t++) {
    datamodel.getAudioFeaturesForTrack(datamodel.tracks[t].id, t, function () {
      tempBatchCount--;
      if (tempBatchCount == 0) {
        console.log("MODEL: Batch audio feature complete. Count: " + tempBatchCount);
        callbackdone();
      }
    });
  }
}

/*
DEPRECATED - NO LONGER NEEDED
datamodel.getTrack = function(id, callback) {
  spotifyApi.getTrack(id).then(
    function(data) {
      console.log("MODEL: Getting audio info", data);
      datamodel.track.info = data; //save data for track to global app variable
      callback();
    },
    function(err) {
      datamodel.handleError(err);
    }
  );
};
*/

datamodel.getAudioFeaturesForTrack = function (id, trackindex, callback) {
  spotifyApi.getAudioFeaturesForTrack(id).then(
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