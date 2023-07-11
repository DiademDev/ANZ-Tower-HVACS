// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjk5N2RlYS0zMGY2LTQxNWQtYjAwMy1iYWUyODI4ODY5YTUiLCJpZCI6MTE3OTUzLCJpYXQiOjE2NzA3Mzk4MTl9.k3I9be0G6cm7S9-U3lYsvSaUZ6mKVf0Capzojy3RZAU";
Cesium.GoogleMaps.defaultApiKey = "AIzaSyA1au3L6n6ZZvFqojyNMfB27DiGHLAX7h8"; // Turn on/off

async function main() {
  
    // Create viewer
    const viewer = new Cesium.Viewer("cesiumContainer", {
      //terrain: Cesium.Terrain.fromWorldTerrain(), // This can be turned off when using Google 3D tiles
      imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }),
      timeline: false,
      animation: false,
      infoBox: false,
      geocoder: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      searchButton: false,
      homeButton: false,
      selectionIndicator: false,
      sceneModePicker: false,
      baseLayerPicker: false,
    });

    // Cesium globe true or false
    viewer.scene.globe.show = false;

    // Remove Cesium logo
    viewer._cesiumWidget._creditContainer.style.display = "none";

    // Add Photorealistic 3D Tiles - Turn on/off
    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      viewer.scene.primitives.add(tileset);
    
      } catch (error) {//
      console.log(`Error loading Photorealistic 3D Tiles tileset.\n${error}`);
    }

    try {
      const tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(1974321) });
      viewer.scene.primitives.add(tileset);
  
    } catch (error) {
      console.log(error);
    }

    // Import data source file
    const dataSourcePromise = Cesium.CzmlDataSource.load("data.czml");
    viewer.dataSources.add(dataSourcePromise);
    
    // Sort data to get position values of each entity
    dataSourcePromise.then((dataSource) => {
      const entities = dataSource.entities.values;
      const numEntities = entities.length;

      let currentIndex = 0;

      // Function to handle the right button click
      function onNextButtonClick() {
        
        if (currentIndex >= numEntities) {
          currentIndex = 0;
        }
        const entity = entities[currentIndex];
        const positionValue = entity.position.getValue();
        viewer.selectedEntity = entity;
        var slider = document.getElementById('slider');
        slider.value = 0;
        previousValue = 0;
        camFlyTo(positionValue);

        currentIndex++;
      }

      // Function to handle the left button click
      function onPrevButtonClick() {

        if (currentIndex < 0) {
          currentIndex = numEntities - 1;
        }

        const entity = entities[currentIndex];
        const positionValue = entity.position.getValue();
        viewer.selectedEntity = entity;
        var slider = document.getElementById('slider');
        slider.value = 0;
        previousValue = 0;
        camFlyTo(positionValue);

        currentIndex--;
      }
      
      const rightButton = document.getElementById("RightBut");
      rightButton.addEventListener("click", onNextButtonClick);
    
      const leftButton = document.getElementById("LeftBut");
      leftButton.addEventListener("click", onPrevButtonClick);

      const button = document.getElementById("RightBut");
      setTimeout(function() {
        button.style.animation = "none";
      }, 3000);


    });

  // Camera look-at target
  const targetSphere = viewer.entities.add({
    name: "Target sphere",
    position: Cesium.Cartesian3.fromDegrees(174.7643523357, -36.8456472918, 180),
    ellipsoid: {
      radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
      material: Cesium.Color.GREEN.withAlpha(0.0)
    },
  });

  // Fly camera to entity position and look at target location
  function camFlyTo(positionValue) {

    var viewPosition = positionValue;

    var newPosition = Cesium.Cartesian3.add(viewPosition, new Cesium.Cartesian3(0, 0, 0), new Cesium.Cartesian3());
    var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetSphere.position.getValue(Cesium.JulianDate.now()), newPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    var right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(direction, viewer.camera.position, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    var up = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()), new Cesium.Cartesian3());

    viewer.camera.flyTo({
      destination: newPosition,
      orientation: {
        direction: direction,
        up: up
      },
      duration: 3
    });
  }

  const homeButton = document.getElementById('HomeBut');
  homeButton.addEventListener('click', function() {
    var slider = document.getElementById('slider');
    slider.value = 0;
    previousValue = 0;
    resetCameraPositionToHome();
  });

  // Create button Augmented
	const augmentedButton = document.getElementById('AugmentedBut');
	
	// Augmented button EventListener
	augmentedButton.addEventListener('click', function() {
		if (QRwindow.classList.contains('close')) {
		  QRwindow.classList.remove('close');
		  QRwindow.classList.add('open');
		} else if (QRwindow.classList.contains('open')) {
		  QRwindow.classList.remove('open');
		  QRwindow.classList.add('close');
		} else if (!QRwindow.classList.contains('open')) {
			QRwindow.classList.add('open');
		}
	  });

    // Select model from drop-down menu
    function createModel(url, height) {
      viewer.entities.removeAll();
    
      const position = Cesium.Cartesian3.fromDegrees(
        174.7643523357,
        -36.8456472918,
        height
      );
      const heading = Cesium.Math.toRadians(20.2);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
    
      const entity = viewer.entities.add({
        name: url,
        position: position,
        orientation: orientation,
        model: {
          uri: url,
          minimumPixelSize: 128,
          maximumScale: 20000,
        },
      });
    }

    // Create dropdown list
    const options = [
      {
        text: "LAYOUT OPTION 1",
        onselect: function () {
          createModel(
            "./models/ANZ_tower_01.glb",
            47.471523166
          );
        },
      },
      {
        text: "LAYOUT OPTION 2",
        onselect: function () {
          createModel(
            "./models/ANZ_tower_02.glb",
            47.471523166
          );
        },
      },
      {
        text: "LAYOUT OPTION 3",
        onselect: function () {
          createModel(
            "./models/ANZ_tower_03.glb",
            47.471523166
          );
        },
      },
    ];
    
    options.forEach(function(option) {
      var item = document.createElement('div');
      item.textContent = option.text;
      item.addEventListener('click', option.onselect);
      document.querySelector('.dropdown-content').appendChild(item);
    });

  // Camera home position
  function resetCameraPositionToHome(){
    viewer.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        174.75456162035914,
        -36.84025551996576,
        800
      ),
      orientation: {
        heading: 2.1657751293826166,
        pitch: -0.5620692925739612,
        roll: 6.283180478220932
      }
    });
    currentIndex = 0;
  };

  // Initial scene camera position
  viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      174.75456162035914,
      -36.84025551996576,
      800
    ),
    orientation: {
      heading: 2.1657751293826166,
      pitch: -0.5620692925739612,
      roll: 6.283180478220932
    }
  });

// Slider window controller
var slider = document.getElementById('slider');
var previousValue = parseFloat(slider.value);
var zoomMultiplier = 2.2; // Adjust the zoom multiplier as needed
var maxZoomFactor = 10; // Adjust the maximum zoom factor as needed
var minZoomFactor = 0.1; // Adjust the minimum zoom factor as needed

// Connect slider value to camera zoom
slider.addEventListener('input', function(event) {
  var currentValue = parseFloat(event.target.value);
  var zoomFactor;

  if (currentValue > previousValue) {
    zoomFactor = Math.pow(maxZoomFactor, Math.abs(currentValue - previousValue) * zoomMultiplier);
    viewer.camera.zoomIn(zoomFactor);
  } else if (currentValue < previousValue) {
    zoomFactor = Math.pow(minZoomFactor, Math.abs(previousValue - currentValue) * zoomMultiplier);
    zoomFactor = zoomFactor*25156;
    viewer.camera.zoomOut(zoomFactor);
  } else {
    return; // Do nothing if the slider value hasn't changed
  }
  console.log(previousValue);
  console.log(currentValue);
  console.log(zoomFactor);
  previousValue = currentValue;
});

}

main();

/*

  function flyto(positionValue) {

    var viewPosition = positionValue;
    var newPosition = Cesium.Cartesian3.add(viewPosition, new Cesium.Cartesian3(0, 0, 0), new Cesium.Cartesian3());
    var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetSphere.position.getValue(Cesium.JulianDate.now()), newPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    var right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(direction, viewer.camera.position, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    var up = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()), new Cesium.Cartesian3());

    viewer.camera.flyTo({
      destination: newPosition,
      orientation: {
        direction: direction,
        up: up // Use the newly calculated up vector
      },
      duration: 3
    });
  }



  // Console log out cameras coordinates as well as HeadingPitchRoll in radians
  viewer.scene.postUpdate.addEventListener(function() {
  var camera = viewer.scene.camera;
  var headingPitchRoll = new Cesium.HeadingPitchRoll(camera.heading, camera.pitch, camera.roll);

  var ellipsoid = viewer.scene.globe.ellipsoid;

  var cartesian = camera.positionWC;
  var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  
  var longitude = Cesium.Math.toDegrees(cartographic.longitude);
  var latitude = Cesium.Math.toDegrees(cartographic.latitude);

  console.log("Longitude: " + longitude + ", Latitude: " + latitude);
  console.log(headingPitchRoll);
});

  
  // Create a instructions window
  document.addEventListener("DOMContentLoaded", function() {
    var introWindow = document.getElementById("introWindow");
    introWindow.style.display = "block";
    
    setTimeout(function() {
      introWindow.style.opacity = "0";
    }, 12000);
    
    setTimeout(function() {
      introWindow.parentNode.removeChild(introWindow);
    }, 13000);
  });

  // Create a custom QRwindow
	const container = document.getElementById("cesiumContainer");
	const QRwindow = document.createElement("div");
	const topQRwindowDiv = document.createElement("div");
	const botQRwindowDiv = document.createElement("div");
	const midQRwindowDiv = document.createElement("div");

	QRwindow.classList.add("custom-QRwindow");
	topQRwindowDiv.classList.add("top-div-QRwindow");
	botQRwindowDiv.classList.add("bot-div-QRwindow");
	midQRwindowDiv.classList.add("mid-div-QRwindow");

	topQRwindowDiv.innerHTML = "<img src='img/model.png' alt='QR code' width= '250' height='250'>";
	botQRwindowDiv.innerHTML = "<p>Use your mobile device to</br>scan the QR code.</br><hr>If you have an iPhone you will</br>need to download XRViewer</br>first from the App store to scan the QR code.</p>";
	midQRwindowDiv.innerHTML = "<img src='img/QR_WebXR.png' alt='QR code' width='120' height='120'><p>XRViewer</p>";

	QRwindow.appendChild(topQRwindowDiv);
	QRwindow.appendChild(botQRwindowDiv);
	QRwindow.appendChild(midQRwindowDiv);

	container.appendChild(QRwindow);

  */



