var app = {
  loaded: false,
  currentView: "data",
  viz: {
    songshape: "circle"
  }
};


//--------- APP CONTROLLER -------
app.initialize = function () {
  //display the loading screen
  app.initLoading();

  //set listeners
  app.setFormListeners();
  app.setupTabListeners();

  //load spotify API
  datamodel.initSpotify(function () {
    console.log("APP: Spotify loaded");

    //trigger off the loading modal
    app.hideLoading();

  });
};

//--------- APP UI ---------------

/*
DEPRECATED SINCE NOW DISPLAYING MORE THAN ONE TRACK
app.viewTrackInfo = function() {
  if (app.track.info == null) {
    console.log("APP: Cannot load track data. Null object.");
  }

  //generate html and display
  var html = "<h3>Tracks</h3>";
  html += "<h4>Track Title:</h4> " + app.track.info.name + "<br>";
  html += "<h4>Album:</h4> " + app.track.info.album.name + "<br><br>";
  html += "<img src='" + app.track.info.album.images[1].url + "' width='150' height='150'>";
  $("#trackinfo").html(html);
};
*/
app.viewTracksInfo = function () {
  if (datamodel.tracks.length < 1) {
    console.log("APP: Cannot load tracks info");
    return;
  }

  //generate html and display
  var html = "<h3># Of Tracks: " + datamodel.tracks.length + "</h3>";
  html += '<ul class="list-unstyled">';
  for (var y = 0; y < datamodel.tracks.length; y++) {
    html += '<li class="media">';
    html += '<img src="' + datamodel.tracks[y].album.images[1].url + '" class="mr-3" height="64px" width="64px">';
    html += '<div class="media-body">';
    html += '<h5 class="mt-0 mb-1">' + datamodel.tracks[y].name + '</h5>';
    //html += 'Album: ' + datamodel.tracks[y].album.name;
    html += datamodel.tracks[y].artists[0].name;
    html += '</div>';
    html += '</li>';
  }
  html += '</ul>';

  $("#tracksinfo").html(html);
};

/*
<ul class="list-unstyled">
  <li class="media">
    <img src="..." class="mr-3" alt="...">
    <div class="media-body">
      <h5 class="mt-0 mb-1">List-based media object</h5>
      Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
    </div>
  </li>
  <li class="media my-4">
    <img src="..." class="mr-3" alt="...">
    <div class="media-body">
      <h5 class="mt-0 mb-1">List-based media object</h5>
      Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
    </div>
  </li>
  <li class="media">
    <img src="..." class="mr-3" alt="...">
    <div class="media-body">
      <h5 class="mt-0 mb-1">List-based media object</h5>
      Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
    </div>
  </li>
</ul>

*/

app.viewTrackFeatures = function () {
  if (app.track.features == null) {
    console.log("APP: Cannot load track data. Null object");
  }

  //generate html and display
  var html = "<h3>Track Features</h3>";
  $.each(app.track.features, function (key, value) {
    html += "<b>" + key + "</b>: " + value + "<br>";
  });

  $("#trackfeatures").html(html);
};

app.setFormListeners = function () {

  //----- Step 1: Selecting Data Elements
  $("#tracksearch-btn").click(function () {
    var searchText = $("#tracksearch-field").val();
    console.log("Searching for: " + searchText);
    datamodel.searchTracks(searchText, function (data) {
      console.log("APP: data", datamodel.tracks);
      app.displayTracksData();
    });
  });

  //----- Step 2: Design Form Elements
  $("#form_songshape").on("change", function () {
    var selected = $(this)
      .find("option:selected")
      .attr("value");
    console.log("APP: Song shape changed to: " + selected);
    app.viz.songshape = selected;
  });
  $("#form_color").on("change", function () {
    var selected = $(this)
      .find("option:selected")
      .attr("value");
    console.log("APP: Color changed to: " + selected);
    app.viz.color = app.track.features[selected];
  });
};

app.setupTabListeners = function () {
  console.log("APP: Setting up listeners for tabs");

  $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

    //save targets
    var currentTarget = e.target;
    var oldTarget = e.relatedTarget;

    //trigger loading
    console.log("APP: Tab switch called: " + currentTarget.id);

    switch (currentTarget.id) {
      case "nav-selecttracks-tab":
        app.currentView = "data";
        app.hideLoading();
        break;
      case "nav-design-tab":
        app.currentView = "design";
        if (app.viewDesignTab() == false) {
          return false;
        }
        break;
      case "nav-publish-tab":
        app.currentView = "publish";
        break;
    }

    //set current tab
    app.currentTab = currentTarget.id;
    app.lastTab = oldTarget.id;
  });
}

app.initLoading = function () {
  $("#loadMe").modal({
    backdrop: "static", //remove ability to close modal with click
    keyboard: false, //remove option to close with keyboard
    show: true //Display loader!
  });
}

app.hideLoading = function () {
  $("#loadMe").modal("hide");
}
app.showLoading = function () {
  $("#loadMe").modal("show");

  //set a timer
  var myModal = $(this);
  clearTimeout(myModal.data('hideInterval'));
  myModal.data('hideInterval', setTimeout(function () {
    myModal.modal('hide');
  }, 3000));
}

//loops through the targeted tracks and displays their info
app.displayTracksData = function () {
  var html = '<ul class="list-group">';
  for (var i = 0; i < datamodel.tracks.length; i++) {
    html += '<li class="list-group-item">'
    html += datamodel.tracks[i].name; //display track info
    html += " - " + datamodel.tracks[i].artists[0].name
    html += '</li>';
  }
  html += '</ul>';

  //display HTML
  $("#selecttracks-list").html(html);

  /*
  <div class="card-columns">
  <div class="card">
    <img src="..." class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">Card title that wraps to a new line</h5>
      <p class="card-text">This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
    </div>
  </div>
  <div class="card p-3">
    <blockquote class="blockquote mb-0 card-body">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
      <footer class="blockquote-footer">
        <small class="text-muted">
          Someone famous in <cite title="Source Title">Source Title</cite>
        </small>
      </footer>
    </blockquote>
  </div>
  <div class="card">
    <img src="..." class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This card has supporting text below as a natural lead-in to additional content.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
  <div class="card bg-primary text-white text-center p-3">
    <blockquote class="blockquote mb-0">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat.</p>
      <footer class="blockquote-footer text-white">
        <small>
          Someone famous in <cite title="Source Title">Source Title</cite>
        </small>
      </footer>
    </blockquote>
  </div>
  <div class="card text-center">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This card has a regular title and short paragraphy of text below it.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
  <div class="card">
    <img src="..." class="card-img-top" alt="...">
  </div>
  <div class="card p-3 text-right">
    <blockquote class="blockquote mb-0">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
      <footer class="blockquote-footer">
        <small class="text-muted">
          Someone famous in <cite title="Source Title">Source Title</cite>
        </small>
      </footer>
    </blockquote>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This is another card with title and supporting text below. This card has some additional content to make it slightly taller overall.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
</div>
  */
}

app.viewDesignTab = function () {
  console.log("APP: viewDesignTab() called");

  //check to see if there is any data there
  if (datamodel.tracks.length < 1) {
    alert("ERROR: You must first search for tracks you want to work with");
    return false;
  }

  //go grab the audio features
  datamodel.getAudioFeaturesBatch(function () {

    //display the tracks data
    app.viewTracksInfo();

    //set application to loaded
    app.loaded = true;

    //hide modal window       
    app.hideLoading();
  });
  return true;
};