var app = {
  loaded: false,
  currentView: "data",
  exploreState: "all",
  viz: {
    shape: "circle"
  }
};

app.initialize = function () {
  app.initLoader();
  // app.showLoader();
  app.setTabListeners();
  app.setFormListeners();

  // Initialize Spotify API
  datamodel.initSpotify(function () {
    console.log("APP: Spotify API loaded");
    app.hideLoader();
  });
};

app.initLoader = function () {
  $("#loadMe").modal({
    backdrop: "static", // Main UI cannot be clicked while modal is visible
    keyboard: false, // Keyboard cannot be used to dismiss modal
    show: false // Display modal loader
  });
}

app.showLoader = function () {
  $("#loadMe").modal("show");
}

app.hideLoader = function () {
  $("#loadMe").modal("hide");
}

app.setTabListeners = function () {
  console.log("APP: Setting up tab listeners");

  $("a[data-toggle=\"tab\"]").on("show.bs.tab", function (e) {
    var currentTarget = e.target;
    var oldTarget = e.relatedTarget;

    // Logs tab that was selected by the user
    console.log("APP: Tab switch called: " + currentTarget.id);

    switch (currentTarget.id) {
      case "searchandselect-tab":
        app.currentView = "searchandselect";
        app.hideLoader();
        break;
      case "explore-tab":
        app.currentView = "explore";
        if (app.viewExploreTab() == false) {
          return false;
        }
        break;
      case "publish-tab":
        app.currentView = "publish";
        break;
    }

    // Set current tab with ID of clicked target tab
    app.currentTab = currentTarget.id;
    app.lastTab = oldTarget.id;
  });
}


app.setFormListeners = function () {
  // Searches for and displays tracks from Spotify API that match/include searched text
  $("#search-btn").click(function () {
    var searchText = $("#search-field").val();
    console.log("Searching for: " + searchText);

    datamodel.searchTracks(searchText, function (data) {
      console.log("APP: data", datamodel.tracks);
      app.displaySearchResults();
    });
  });

  // Sets the default selected shape and color and allows for different selections
  $("#shape-form").on("change", function () {
    var selected = $(this)
      .find("option:selected")
      .attr("value");
    console.log("APP: Song shape changed to: " + selected);
    app.viz.shape = selected;
  });

  $("#color-form").on("change", function () {
    var selected = $(this)
      .find("option:selected")
      .attr("value");
    console.log("APP: Color changed to: " + selected);
    app.viz.color = app.track.features[selected];
  });
};

// Displays list of search results with track title and artist for each track
app.displaySearchResults = function () {
  var html = '<ul class="list-group">';
  for (var i = 0; i < datamodel.tracks.length; i++) {
    html += '<li data-id="' + i + '" class="list-group-item list-group-item-action select-track">';
    html += datamodel.tracks[i].name;
    html += " - " + datamodel.tracks[i].artists[0].name;
    html += '</li>';
  }
  html += '</ul>';

  // Display the dynamic HTML created above
  $("#search-results").html(html);

  // Set up click handlers on all the list items displayed in HTML
  // Logs array index for a track that's been clicked on
  $(".select-track").on("click", function (event) {
    var selectedIndex = $(event.target).data("id");
    console.log("Selected Index: " + selectedIndex);
    datamodel.addTrackFromSearch(selectedIndex, function () {
      app.displaySelectedTracks();
    });
  });
}

/*
app.selectTracks = function () {
  // Logs track that was clicked
  $('li').click(function() {
    var i = $(this).index();
    var trackTitle = datamodel.tracks[i].name;
    var artist = datamodel.tracks[i].artists[0].name;
    var trackID = datamodel.tracks[i].id;
    console.log("Selected track: " + trackTitle + " - " + artist);
    console.log("Track ID: " + trackID);

    datamodel.searchSelectedTrack(trackTitle, function (data) {
      console.log("APP: data", datamodel.selectedTracks);
      app.displaySelectedTracks();
    });
  });
}
*/

// Displays tracks that have been selected from search results in an adjacent list
app.displaySelectedTracks = function () {
  var html = '<ul class="list-group">';
  for (var i = 0; i < datamodel.selectedTracks.length; i++) {
    html += '<li data-id="' + i + '" class="list-group-item list-group-item-action remove-track">'
    html += datamodel.selectedTracks[i].name;
    html += " - " + datamodel.selectedTracks[i].artists[0].name;
    html += '</li>';
  }
  html += '</ul>';

  $("#selected-tracks").html(html);

  // Set up click handlers on all the list items in the HTML just posted
  // Logs array index for a track that's been clicked on
  $(".remove-track").on("click", function (event) {
    var selectedIndex = $(event.target).data("id");
    console.log("Removing Index: " + selectedIndex);
    datamodel.removeSelectedTrack(selectedIndex, function () {
      app.displaySelectedTracks();
    });
  });
}

// This tab can only be opened if the user has successfully selected tracks in Step 1
app.viewExploreTab = function () {
  console.log("APP: viewExploreTab() called");

  // Returns an error message if user has not selected any tracks
  if (datamodel.tracks.length < 1) {
    alert("ERROR: You must first search and select tracks you want to work with");
    return false;
  }

  datamodel.getAudioFeaturesBatch(function () {
    app.displaySelectedTracklist();
    app.loaded = true;
    app.hideLoader();
  });

  return true;
};

// Display list of selected tracks
app.displaySelectedTracklist = function () {
  if (datamodel.selectedTracks.length < 1) {
    console.log("APP: No tracks available");
    return;
  }

  var html = "<h5># Of Tracks: " + datamodel.selectedTracks.length + "</h5>";
  html += '<button id="explore-alltracks-btn">Visualize All Tracks</button>'
  html += '<ul class="list-unstyled">';

  // Display album artwork, track title, and artist for each track
  for (var i = 0; i < datamodel.selectedTracks.length; i++) {
    html += '<li data-trackid="' + i + '" class="media select-track-btn list-group-item list-group-item-action">';
    html += '<img src="' + datamodel.selectedTracks[i].album.images[1].url + '" class="mr-3" height="32px" width="32px">';
    html += '<div class="media-body">';
    html += '<h5 class="mt-0 mb-1">' + datamodel.selectedTracks[i].name + '</h5>';
    html += datamodel.selectedTracks[i].artists[0].name;
    //html += 'Album: ' + datamodel.tracks[y].album.name; TODO: put this on a new line with gray text color
    html += '<br><button data-trackid="' + i + '" class="play-track-btn">Preview</button>';
    html += '</div>';
    html += '</li>';
  }
  html += '</ul>';

  $("#track-list").html(html);

  // Update the p5 canvas
  draw();

  // Update click handler for music tracks
  // TODO: Fix layered playback when track is clicked more than once
  $(".play-track-btn").on("click", function (event) {
    var selectedIndex = $(event.currentTarget).data("trackid");
    console.log("Playing Index: " + selectedIndex);
    var previewURL = datamodel.selectedTracks[selectedIndex].preview_url;
    console.log("Playing URL: " + previewURL);
    app.playTrack(previewURL, function () {
      console.log("Track is playing...");
    });
  });

  $(".select-track-btn").on("click", function (event) {
    var selectedIndex = $(event.currentTarget).data("trackid");
    console.log("Selected Track Index: " + selectedIndex);
    app.viewTrackFeaturesByIndex(selectedIndex);
  });

  $("#explore-alltracks-btn").on("click", function () {
    app.exploreState = "all";
    draw();
  });
};

app.viewTrackFeaturesByIndex = function (index) {
  var selectedTrack = datamodel.selectedTracks[index];
  var html = "<h5>Features for Track: <b>" + selectedTrack.name + "</b></h5>";
  $.each(selectedTrack.features, function (key, value) {
    html += "<b>" + key + "</b>: " + value + "<br>";
  });

  $("#track-features").html(html);

  // Update p5 canvas for single-track view
  app.exploreState = index;
  draw();
};


app.viewTrackFeatures = function () {
  if (app.track.features == null) {
    console.log("APP: Cannot load track features. Null object");
  }

  var html = "<h3>Track Features</h3>";
  $.each(app.track.features, function (key, value) {
    html += "<b>" + key + "</b>: " + value + "<br>";
  });

  $("#track-features").html(html);
};

app.playTrack = function (trackurl, callback) {
  var sound = new Howl({
    src: [trackurl],
    format: ['mp3'],
    onplayerror: function () {
      console.log("ERROR: Cannot play track");
    }
  });

  sound.play();
  callback();
};