/* TODO:
- save token as cookie and load as well
- implement error handling for when token not working

Spotify API: https://github.com/jmperez/spotify-web-api-js
Documenttion: https://doxdox.org/jmperez/spotify-web-api-js
*/

var spotifyApi;
var app = {
  spotifyToken: null,
  loaded: false,
  track: {},
  viz: {
    songshape: "circle"
  }
};

//URLs for authenticating and getting token remotely
var spotifyVerifyURL = "http://thenewten.org/sp/verify.php";
var spotifyVerifyURL_local = "https://cors-anywhere.herokuapp.com/http://thenewten.org/sp/verify.php";


//--------- APP CONTROLLER -------
app.initialize = function(){

  //display the loading screen
  $("#loadMe").modal({
      backdrop: "static", //remove ability to close modal with click
      keyboard: false, //remove option to close with keyboard
      show: true //Display loader!
    });

  //load spotify API
  app.initSpotify(function(){
    console.log("APP: Spotify API initialized...");


    //load track info
    app.getTrack('5SkRLpaGtvYPhw02vZhQQ9',function(){
      console.log("APP: Track info loaded...");

      //update the display of track info
      app.viewTrackInfo();
    });

    //load track audio features
    app.getAudioFeaturesForTrack('5SkRLpaGtvYPhw02vZhQQ9',function(){
      console.log("APP: Track audio features loaded...");

      //flag the app as loaded
      app.loaded = true; //this enables the P5 code...

      //remove modal window...
      $("#loadMe").modal("hide");

      //update the display of track features
      app.viewTrackFeatures();

      //update event listeners
      app.setFormListeners();

    });

  });//end initSpotify()

}



//--------- APP UI ---------------
app.viewTrackInfo = function(){
  if(app.track.info == null){console.log("APP: Cannot load track data. Null object.");}

  //generate html and display
  var html = "<h2>Track</h2>";
  html += "<h3>Track Title:</h3> " + app.track.info.name + "<br>";
  html += "<h3>Album:</h3> " + app.track.info.album.name + "<br>";
  html += "<img src='"+app.track.info.album.images[2].url+"'>";
  $("#trackinfo").html(html);
}

app.viewTrackFeatures = function(){
  if(app.track.features == null){console.log("APP: Cannot load track data. Null object.");}

  //generate html and display
  var html = "<h4>Track Features</h4>";
  $.each(app.track.features, function(key, value) {
    html += "<b>"+ key + "</b>: " + value + "<br>";
  });

  $("#trackfeatures").html(html);
}

app.setFormListeners = function() {
  $("#form_songshape").on("change", function(){
    var selected = $(this).find("option:selected").attr('value');
    console.log("APP: Song shape changed to: " + selected);
    app.viz.songshape = selected;
  });

  $("#form_color").on("change", function(){
    var selected = $(this).find("option:selected").attr('value');
    console.log("APP: Color changed to: " + selected);
    app.viz.color = app.track.features[selected];
  });
};



//--------- SPOTIFY --------------
app.initSpotify = function(callback) {

  //instantiate the Spotify API wrapper
  spotifyApi = new SpotifyWebApi();

  //check to see if there's an existing token
  if(app.getToken() != null){
    console.log("APP: Token already exists...");
    //return;
  }

  //make call to custom PHP file to get token
   $.ajax({
       url: spotifyVerifyURL_local,
       type: "GET",
       data: {}
   }).done(function(data) {
       var tokenObj = JSON.parse(data);
       //console.log("Token Received: " + tokenObj.access_token)
       app.saveToken(tokenObj.access_token);
       spotifyApi.setAccessToken(app.getToken());
       callback();
   });
}

app.saveToken = function(token){
  app.spotifyToken = token;
}

app.getToken = function(){
  return app.spotifyToken;
}

app.handleError = function(err){
  console.log("APP: Error when making a call...", err);
  //console.error(err);
}

app.getTracks = function(searchterm){
  if(searchterm == null){
    console.log("APP: Cannot get tracks. No search term passed as a parameter");
    return null;
  }
  spotifyApi.searchTracks(searchterm)
  .then(function(data) {
    console.log('Search by "'+searchterm+'"', data);
  }, function(err) {
    app.handleError(err);
  });
}

app.getTrack = function(id, callback){

  spotifyApi.getTrack(id)
  .then(function(data) {
    console.log('Getting audio info', data);
    app.track.info = data; //save data for track to global app variable
    callback();

  }, function(err) {
    app.handleError(err);
  });
}

app.getAudioFeaturesForTrack = function(id, callback){

  spotifyApi.getAudioFeaturesForTrack(id)
  .then(function(data) {
    console.log('Getting audio features', data);
    app.track.features = data; //save data for track to global app variable
    callback();

  }, function(err) {
    app.handleError(err);
  });
}
