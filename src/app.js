var app = {
  loaded: false,
  currentView: "data",
  viz: {
    shape: "circle"
  }
};


app.initialize = function () {
  app.initLoader();
  app.setFormListeners();
  app.setTabListeners();

  // Initialize Spotify API
  datamodel.initSpotify(function () {
    console.log("APP: Spotify API loaded");
    app.hideLoader();
  });
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
  for (var y = 0; y < datamodel.tracks.length; y++) {
    html += '<li class="media">';
    html += '<img src="' + datamodel.tracks[y].album.images[1].url + '" class="mr-3" height="64px" width="64px">';
    html += '<div class="media-body">';
    html += '<h5 class="mt-0 mb-1">' + datamodel.tracks[y].name + '</h5>';
    html += datamodel.tracks[y].artists[0].name;
    //html += 'Album: ' + datamodel.tracks[y].album.name; TODO: put this on a new line with gray text color
    html += '</div>';
    html += '</li>';
  }
  html += '</ul>';

  $("#tracklist").html(html);
};


app.viewTrackFeatures = function () {
  if (app.track.features == null) {
    console.log("APP: Cannot load track features. Null object");
  }

  var html = "<h3>Track Features</h3>";
  $.each(app.track.features, function (key, value) {
    html += "<b>" + key + "</b>: " + value + "<br>";
  });

  $("#trackfeatures").html(html);
};

app.setFormListeners = function () {
  // Searches for and displays tracks from Spotify API that match/include searched text
  // TODO: change 'displayTracksData();'
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

app.setTabListeners = function () {
  console.log("APP: Setting up tab listeners");

  $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
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
      case "design-tab":
        app.currentView = "publish";
        break;
    }

    // Set current tab with id of clicked target tab
    app.currentTab = currentTarget.id;
    app.lastTab = oldTarget.id;
  });
}

app.initLoader = function () {
  $("#loadMe").modal({
    backdrop: "static", // Main UI cannot be clicked while modal is visible
    keyboard: false, // Keyboard cannot be used to dismiss modal
    show: true // Display modal loader
  });
}

app.hideLoader = function () {
  $("#loadMe").modal("hide");
}

app.showLoader = function () {
  $("#loadMe").modal("show");

  var loader = $(this);
  clearTimeout(loader.data('hideInterval'));
  loader.data('hideInterval', setTimeout(function () {
    loader.modal('hide');
  },1000));
}

// Displays list of search results with track title and artist for each track
app.displaySearchResults = function () {
  var html = '<ul class="list-group">';
  for (var i = 0; i < datamodel.tracks.length; i++) {
    html += '<li class="list-group-item list-group-item-action">' // list-group-item-action makes items in lists selectable
    html += datamodel.tracks[i].name;
    html += " - " + datamodel.tracks[i].artists[0].name
    html += '</li>';
  }
  html += '</ul>';

  $("#search-results").html(html);

  // Logs track id for a track that has been clicked on
  $(".select-btn").on("click", function (event) {
    var selectedIndex = $(event.target).data("id");
    console.log("Selected Index: " + selectedIndex);

  });
}

// Displays tracks that have been selected from search results in an adjacent list
app.displaySelectedTracks = function () {
  var html = '<ul class="list-group">';
  for (var i = 0; i < datamodel.tracks.length; i++) {
    html += '<li class="list-group-item">'
    html += datamodel.tracks[i].name;
    html += " - " + datamodel.tracks[i].artists[0].name
    html += '</li>';
  }
  html += '</ul>';

  $("#selected-tracks").html(html);
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