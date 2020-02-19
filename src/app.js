var app = {
  loaded: false,
  currentView: "data",
  viz: {
    shape: "circle"
  }
};

app.initialize = function () {
  app.initLoader();
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
    show: true // Display modal loader
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
      case "design-tab":
        app.currentView = "design";
        if (app.viewDesignTab() == false) {
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
    html += '<li data-id="'+i+'" class="list-group-item select-btn list-group-item-action">';
    html += datamodel.tracks[i].name;
    html += " - " + datamodel.tracks[i].artists[0].name;
    html += '</li>';
  }
  html += '</ul>';

  //display the dynamic html created above
  $("#search-results").html(html);

  //setup click handlers on all the list items in the html just posted
  // Logs track id for a track that has been clicked on
  $(".select-btn").on("click", function (event) {
    var selectedIndex = $(event.target).data("id");
    console.log("Selected Index: " + selectedIndex);
    datamodel.addTrackFromSearch(selectedIndex,function(){
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
    html += '<li data-id="'+i+'" class="list-group-item remove-btn list-group-item-action">'
    html += datamodel.selectedTracks[i].name;
    html += " - " + datamodel.selectedTracks[i].artists[0].name;
    html += '</li>';
  }
  html += '</ul>';

  $("#selected-tracks").html(html);

  //setup click handlers on all the list items in the html just posted
  // Logs track id for a track that has been clicked on
  $(".remove-btn").on("click", function (event) {
    var selectedIndex = $(event.target).data("id");
    console.log("Removing Index: " + selectedIndex);
    datamodel.removeSelectedTrack(selectedIndex,function(){
      app.displaySelectedTracks();
    });
  });
}

// This tab can only be opened if the user has successfully selected tracks in Step 1
app.viewDesignTab = function () {
  console.log("APP: viewDesignTab() called");

  // Returns an error message if user has not selected any tracks
  if (datamodel.tracks.length < 1) {
    alert("ERROR: You must first search and select tracks you want to work with");
    return false;
  }

  datamodel.getAudioFeaturesBatch(function () {
    app.displayTracklist();
    app.loaded = true;
    app.hideLoader();
  });

  return true;
};

// Display list of tracks selected from Step 1 in HTML for Step 2
app.displayTracklist = function () {
  if (datamodel.tracks.length < 1) {
    console.log("APP: No tracks available");
    return;
  }

  var html = "<h3># Of Tracks: " + datamodel.tracks.length + "</h3>";
  html += '<ul class="list-unstyled">';

  // Display album artwork, track title, and artist for each track
  for (var i = 0; i < datamodel.tracks.length; i++) {
    html += '<li class="media">';
    html += '<img src="' + datamodel.tracks[i].album.images[1].url + '" class="mr-3" height="64px" width="64px">';
    html += '<div class="media-body">';
    html += '<h5 class="mt-0 mb-1">' + datamodel.tracks[i].name + '</h5>';
    html += datamodel.tracks[i].artists[0].name;
    //html += 'Album: ' + datamodel.tracks[y].album.name; TODO: put this on a new line with gray text color
    html += '</div>';
    html += '</li>';
  }
  html += '</ul>';

  $("#track-features").html(html);
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