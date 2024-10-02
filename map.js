var finalsrc;
var finaldest;
let map, userMarker;
let sourceMarker, destinationMarker;
let routeLayer, distanceElement;
var currentLat;
var currentLong;
var currentCat;
var state;
var allFeatures = [];
var markersArray = [];
var flag = false;

function setSource(name, lat, lng) {
  if (sourceMarker) {
    sourceMarker.remove();
  }
  sourceMarker = L.marker([lat, lng]).addTo(map);
  document.querySelector("#src").textContent = `Source: ${name}`;
}

function setDestination(name, lat, lng) {
  if (destinationMarker) {
    destinationMarker.remove();
  }
  destinationMarker = L.marker([lat, lng]).addTo(map);
  document.querySelector("#dest").textContent = `Destination: ${name}`;
}

function loadCategory() {
  fetch(`http://localhost:3000/fetchCat`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        currentCat = data.category;
        document.getElementById("category-map").textContent =
          currentCat.charAt(0).toUpperCase() +
          currentCat.slice(1).toLowerCase();

        console.log("category is :", currentCat);
        run();
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
loadCategory();

function run() {
  // const apiUrl =
  //   "https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.9629,20.5937,1000000&limit=100&apiKey=cb9afc3637854797aba60e556899ece5";

  function initializeMap() {
    // Initialize the map
    map = L.map("map").setView([19.076, 72.8777], 13); // Set initial view to latitude and longitude, zoom level

    // Add a tile layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Initialize distance element
    distanceElement = document.querySelector("#distance");

    // Get user location and add markers for historic places
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;

        const userLocation = [latitude, longitude];
        currentLat = latitude;
        currentLong = longitude;
        // Add a marker for the user location
        // Create a custom icon with a local image
        const redMarkerIcon = L.icon({
          iconUrl: "myLocation.png", // Path to your local image
          iconSize: [35, 41], // Size of the icon [width, height]
          iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location [horizontal, vertical]
          popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor [horizontal, vertical]
        });

        // Assuming userLocation, latitude, and longitude are already defined
        userMarker = L.marker(userLocation, { icon: redMarkerIcon }).addTo(map)
          .bindPopup(`
  <div>
      <b>Your Location</b><br>
      <div class="popup-buttons">
          <button onclick="setSource('Your Location', ${latitude}, ${longitude})">Set as Source</button>
          <button onclick="setDestination('Your Location', ${latitude}, ${longitude})">Set as Destination</button>
      </div>
  </div>
`);

        document.querySelector(
          "#src"
        ).textContent = `Your location: ${userLocation}`;

        // Update map view to user location
        map.setView(userLocation, 13);

        // Fetch and add markers for historic places from API
        fetchHistoricPlaces();
      },
      function (error) {
        console.error("Geolocation error:", error);
      }
    );

    // Add event listener for the Generate Route button
    document
      .querySelector("#generate")
      .addEventListener("click", generateRoute);
    document.querySelector("#confirm").addEventListener("click", confirmInfo);
  }

  const historicList = [
    "maharashtra",
    "rajasthan",
    "karnataka",
    "tamilnadu",
    "gujarat",
    "westbengal",
    "punjab",
    "haryana",
    "uttarpradesh",
    "andhrapradesh",
    "telangana",
    "uttarakhand",
    "himachal",
    "jammuandkashmir",
    "ladakh",
    "puducherry",
    "sikkim",
  ];
  const natureList = [
    "rajasthan",
    "maharashtra",
    "karnataka",
    "tamilnadu",
    "madhyapradesh",
    "himachalpradesh",
    "odisha",
    "westbengal",
    "assam",
    "kerala",
    "uttarakhand",
    "jharkhand",
  ];
  const snowList = [
    "himachalpradesh",
    "uttarakhand",
    "jammuandkashmir",
    "ladakh",
    "sikkim",
  ];
  const beachList = [
    "maharashtra",
    "goa",
    "karnataka",
    "kerala",
    "tamilnadu",
    "andhrapradesh",
    "odisha",
    "westbengal",
  ];
  const wildlifeList = [
    "rajasthan",
    "maharashtra",
    "karnataka",
    "tamilnadu",
    "madhyapradesh",
    "himachalpradesh",
    "odisha",
    "westbengal",
    "assam",
    "kerala",
    "uttarakhand",
    "jharkhand",
  ];
  const culturalList = [
    "andhrapradesh",
    "arunachalpradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachalpradesh",
    "jammuandkashmir",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhya_pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamilnadu",
    "telangana",
    "tripura",
    "uttarakhand",
    "westbengal",
  ];
  const offcityList = [
    "andhrapradesh",
    "arunachalpradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachalpradesh",
    "jammuandkashmir",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhyapradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamilnadu",
    "telangana",
    "tripura",
    "uttarpradesh",
    "uttarakhand",
    "westbengal",
  ];
  const adventuresportsList = [
    "andhrapradesh",
    "arunachalpradesh",
    "himachalpradesh",
    "uttarakhand",
    "maharashtra",
    "goa",
    "rajasthan",
    "karnataka",
    "kerala",
    "uttarpradesh",
  ];

  function removeAllMarkers(allFeatures) {
    allFeatures.forEach((marker) => {
      marker.remove(); // Remove marker from the map
    });
    allFeatures = []; // Clear the array
  }
  // Function to populate the dropdown with options from the list
  function populateDropdown(options) {
    const dropdown = document.getElementById("dropdownMenu");
    // Clear existing options
    dropdown.innerHTML = "";
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option; // Set the value of the option
      opt.textContent = option; // Set the text of the option
      dropdown.appendChild(opt); // Append option to dropdown
    });
    state = `${dropdown.value}_apiUrls`;
    dropdown.addEventListener("change", function () {
      state = `${dropdown.value}_apiUrls`;
      console.log(state); // Store the selected option's value in the 'state' variable
      console.log("Selected option:", state); // You can log the selected option to see the change

      fetchHistoricPlaces();
    });
  }

  // Populate the dropdown on page load
  switch (currentCat) {
    case "snow":
      populateDropdown(snowList);
      break;
    case "nature":
      populateDropdown(natureList);
      break;
    case "cultural":
      populateDropdown(culturalList);
      break;
    case "historic":
      populateDropdown(historicList);
      break;
    case "offcity":
      populateDropdown(offcityList);
      break;
    case "adventure-sports":
      populateDropdown(adventuresportsList);
      break;
    case "wildlife":
      populateDropdown(wildlifeList);
      break;
    case "beach":
      populateDropdown(beachList);
      break;
    default:
      console.log("No match found.");
  }

  async function fetchHistoricPlaces() {
    const beach_apiUrlList = {
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:73.1528,19.2183,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Other URLs...
      ],
      goa_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:73.7518,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:74.8625,14.9146,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:76.2419,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      tamilnadu_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:80.2785,13.0827,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      andhrapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:83.3181,17.6868,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      odisha_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:86.9295,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      westbengal_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=beach&filter=circle:88.2445,22.5697,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
    };

    const historic_apiUrlList = {
      maharashtra_apiUrls: [
        // Maharashtra
        `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:73.1528,19.2183,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.3433,19.8762,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.0882,21.1458,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:73.7898,19.9975,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      rajasthan_apiUrls:
        // Rajasthan
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.7873,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:73.6832,24.5714,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:73.0243,26.2389,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:74.6369,26.4533,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      karnataka_apiUrls:
        // Karnataka
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.0152,12.9716,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:76.6552,12.2958,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:76.4603,15.3356,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:74.8462,12.9141,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      tamilnadu_apiUrls:
        // Tamil Nadu
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:80.2785,13.0827,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.1145,9.9254,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.0045,11.0168,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.6824,10.7905,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      gujarat_apiUrls:
        // Gujarat
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:72.5714,23.0225,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:72.8311,21.1702,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:73.1880,22.3072,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:70.8022,22.3039,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      westbengal_apiUrls:
        // West Bengal
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.3639,22.5726,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.2639,27.0353,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.3182,22.5755,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:86.9922,23.6825,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      punjab_apiUrls:
        // Punjab
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:74.8760,31.6340,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:76.7794,30.7333,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.8573,30.9009,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.5762,31.3260,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      haryana_apiUrls:
        // Haryana
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.0850,28.4595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.2930,28.4082,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:76.9687,29.3910,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:76.7781,30.3784,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      uttarpradesh_apiUrls:
        // Uttar Pradesh
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:80.9462,26.8467,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.0421,27.1767,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:82.9688,25.3176,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:80.3489,26.4475,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      andhrapradesh_apiUrls:
        // Andhra Pradesh
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:80.6184,16.5062,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:82.5882,17.6854,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:83.2185,14.9118,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:81.8462,17.5256,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      telangana_apiUrls:
        // Telangana
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.4744,17.3850,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.6962,17.5228,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.4914,17.2705,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.0242,16.9203,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      uttarakhand_apiUrls:
        // Uttarakhand
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.4687,30.3165,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.0685,30.3210,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.7885,30.4502,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.6777,30.2724,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      himachal_apiUrls:
        // Himachal Pradesh
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.1875,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.1521,32.0617,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.1963,30.6854,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:77.3600,32.0458,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      jammuandkashmir_apiUrls:
        // Jammu and Kashmir
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.5788,33.7782,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:74.3292,34.0868,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.0813,33.5556,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:75.2500,34.0991,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      ladakh_apiUrls:
        // Ladakh
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.2072,34.1526,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.2344,34.0983,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.5833,34.2852,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:78.3672,34.2481,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      puducherry_apiUrls:
        // Puducherry
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.8323,11.9342,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.7850,11.9336,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.8775,11.9345,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:79.8270,11.9197,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
      sikkim_apiUrls:
        // Sikkim
        [
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.6150,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.6130,27.4405,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.7047,27.0347,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
          `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:88.5150,27.1824,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        ],
    };

    const wildlife_apiUrls = {
      rajasthan_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:73.8144,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:75.2509,26.5547,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:73.1528,19.2183,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:75.3433,19.8762,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:75.1162,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:76.7841,12.9716,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      tamilnadu_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:80.2707,13.0827,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:77.7099,11.0168,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      madhyapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:78.6569,22.9734,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:77.1739,23.1638,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:77.1983,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:77.1304,32.0838,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      odisha_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:85.8315,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:85.8315,19.7984,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      westbengal_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:88.3639,22.5726,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:87.8554,23.1345,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      assam_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:91.5800,26.2006,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:92.3438,26.7513,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:76.2711,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:76.4975,9.9298,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:78.5688,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:78.7459,30.3194,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      jharkhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:85.2799,23.6102,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.forest&filter=circle:85.3220,23.0258,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
    };

    const nature_apiUrls = {
      rajasthan_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:73.8144,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:75.2509,26.5547,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:73.1528,19.2183,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:75.3433,19.8762,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:75.1162,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:76.7841,12.9716,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      tamilnadu_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:80.2707,13.0827,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:77.7099,11.0168,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      madhyapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:78.6569,22.9734,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:77.1739,23.1638,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:77.1983,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:77.1304,32.0838,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      odisha_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:85.8315,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:85.8315,19.7984,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      westbengal_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:88.3639,22.5726,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:87.8554,23.1345,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      assam_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:91.5800,26.2006,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:92.3438,26.7513,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:76.2711,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:76.4975,9.9298,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:78.5688,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:78.7459,30.3194,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
      jharkhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:85.2799,23.6102,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=nature&filter=circle:85.3220,23.0258,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        // Add more URLs as needed
      ],
    };

    const snowy_apiUrls = {
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=ski&filter=circle:77.1896,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.mountain&filter=circle:77.1896,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=ski&filter=circle:78.5385,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.mountain&filter=circle:78.5385,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      jammuandkashmir_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=ski&filter=circle:75.7789,34.0836,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.mountain&filter=circle:75.7789,34.0836,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      ladakh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=ski&filter=circle:78.3223,34.1549,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.mountain&filter=circle:78.3223,34.1549,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      sikkim_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=ski&filter=circle:88.6139,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=natural.mountain&filter=circle:88.6139,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
    };
    const cultural_apiUrls = {
      andhrapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      arunachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      assam_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:92.9376,26.2006,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      bihar_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:85.3131,25.0961,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      chhattisgarh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:81.7362,21.2787,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      goa_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:74.0784,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      gujarat_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:72.5714,22.2587,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      haryana_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:76.0856,29.0588,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:77.1896,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      jammuandkashmir_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:75.7789,34.0836,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      jharkhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:85.2799,23.6102,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:76.2711,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      madhya_pradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:78.6569,22.9734,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:72.8777,19.0760,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      manipur_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:93.6154,24.6637,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      meghalaya_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:91.5822,25.4670,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      mizoram_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:92.7195,23.1645,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      nagaland_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:94.5624,26.1584,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      odisha_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:85.8319,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      punjab_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:75.3405,30.7333,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      rajasthan_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:73.3452,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      sikkim_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:88.6139,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      tamilnadu_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:78.6569,11.1271,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      telangana_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:78.5562,17.3850,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      tripura_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:91.9866,23.9400,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:78.5385,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      westbengal_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=entertainment.culture.arts_centre&filter=circle:88.3639,22.9868,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
    };

    const offcity_apiUrls = {
      andhrapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      arunachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      assam_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:92.9376,26.2006,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:92.9376,26.2006,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      bihar_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:85.3131,25.0961,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:85.3131,25.0961,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      chhattisgarh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:81.7362,21.2787,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:81.7362,21.2787,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      goa_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:74.0784,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:74.0784,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      gujarat_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:72.5714,22.2587,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:72.5714,22.2587,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      haryana_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:76.0856,29.0588,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:76.0856,29.0588,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:77.1896,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:77.1896,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      jammuandkashmir_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:75.7789,34.0836,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:75.7789,34.0836,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      jharkhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:85.2799,23.6102,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:85.2799,23.6102,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:76.2711,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:76.2711,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      madhyapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:78.6569,22.9734,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:78.6569,22.9734,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:72.8777,19.0760,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:72.8777,19.0760,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      manipur_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:93.7781,24.6637,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:93.7781,24.6637,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      meghalaya_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:91.5822,25.4670,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:91.5822,25.4670,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      mizoram_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:92.7276,23.1645,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:92.7276,23.1645,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      nagaland_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:94.5624,26.1585,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:94.5624,26.1585,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      odisha_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:85.8319,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:85.8319,20.9517,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      punjab_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:75.8423,30.9009,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:75.8423,30.9009,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      rajasthan_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:73.4162,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:73.4162,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      sikkim_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:88.6149,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:88.6149,27.5330,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      tamilnadu_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:78.6569,11.1271,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:78.6569,11.1271,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      telangana_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:78.5783,17.3688,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:78.5783,17.3688,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      tripura_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:91.5623,23.9408,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:91.5623,23.9408,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:80.9462,27.0979,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:80.9462,27.0979,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      westbengal_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=tourism.sights.bridge&filter=circle:87.8552,22.9868,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:87.8552,22.9868,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
    };

    const adventure_sports_apiUrls = {
      andhrapradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:80.2184,15.9129,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      arunachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:93.6150,28.2180,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      himachalpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:77.1300,31.1048,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarakhand_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:78.9629,30.0668,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      maharashtra_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:75.7139,19.7515,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      goa_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=commercial.outdoor_and_sport.water_sports&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:73.7499,15.2993,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      rajasthan_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:73.4478,27.0238,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      karnataka_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:75.7139,15.3173,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      kerala_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:76.6372,10.8505,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
      uttarpradesh_apiUrls: [
        `https://api.geoapify.com/v2/places?categories=activity&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=entertainment.activity_park.climbing&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.dive_centre&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.horse_riding&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.ice_rink&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
        `https://api.geoapify.com/v2/places?categories=sport.swimming_pool&filter=circle:80.9462,27.0595,300000&limit=10&apiKey=cb9afc3637854797aba60e556899ece5`,
      ],
    };

    // var state = "maharashtra_apiUrls";
    try {
      // const responses = await Promise.all(
      //   wildlife_apiUrls[state].map((url) => fetch(url))
      // );
      switch (currentCat) {
        case "snow":
          var responses = await Promise.all(
            snowy_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "nature":
          var responses = await Promise.all(
            nature_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "cultural":
          var responses = await Promise.all(
            cultural_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "historic":
          var responses = await Promise.all(
            historic_apiUrlList[state].map((url) => fetch(url))
          );
          break;
        case "offcity":
          var responses = await Promise.all(
            offcity_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "adventure-sports":
          var responses = await Promise.all(
            adventure_sports_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "wildlife":
          var responses = await Promise.all(
            wildlife_apiUrls[state].map((url) => fetch(url))
          );
          break;
        case "beach":
          var responses = await Promise.all(
            beach_apiUrlList[state].map((url) => fetch(url))
          );
          break;
        default:
          console.log("No match found.");
      }

      // Check if all responses are OK
      const dataPromises = responses.map(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch places data.");
        }
        return response.json();
      });

      // Wait for all the data to be resolved
      const dataArrays = await Promise.all(dataPromises);

      // Combine all features from the fetched data
      if (allFeatures.length > 0) {
        markersArray.forEach((marker) => {
          map.removeLayer(marker); // Remove the marker from the map
        });
        allFeatures = [];
      }
      allFeatures = dataArrays.flatMap((data) => data.features);

      // Log the full response to see the structure
      console.log("All features", allFeatures);

      // Add markers for the fetched historic places
      addHistoricPlaceMarkers(allFeatures);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  }

  function addHistoricPlaceMarkers(places) {
    console.log(name, "2nd time");
    places.forEach((place) => {
      // Access the properties and coordinates from the API response
      if (!flag) {
        var name = place.properties.name || "Unnamed Place";
      }

      if (name === "Unnamed Place" && flag) {
        //  use !flag for turning on the function
        console.log("flag:", !flag);
        console.log("unnamed dataaaa");
        const apiKey = "34458786a76947d8b02c08a7b34221c9";
        const latitude = place.properties.lat;
        const longitude = place.properties.lon;

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            if (data.results && data.results.length > 0) {
              var finalLocation =
                data.results[0].components.city ||
                data.results[0].components.town ||
                data.results[0].components.village ||
                "Unnamed Place";
              console.log(finalLocation);
              name = finalLocation;
              flag = true;
              const redMarkerIcon = L.icon({
                iconUrl: "myLocation.png", // Path to your local image
                iconSize: [35, 41], // Size of the icon [width, height]
                iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location [horizontal, vertical]
                popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor [horizontal, vertical]
              });
              console.log(place.geometry.coordinates);
              L.marker(
                [place.geometry.coordinates[1], place.geometry.coordinates[0]],
                {
                  icon: redMarkerIcon,
                }
              ).addTo(map).bindPopup(`
                      <div>
                          <b>${finalLocation}</b><br>
                          <div class="popup-buttons">
                              <button onclick="setSource( '${finalLocation}',${latitude} , ${longitude})">Set as Source</button>
                              <button onclick="setDestination( '${finalLocation}',${latitude} , ${longitude})">Set as Destination</button>
                          </div>
                      </div>
                          `);
              // run();
            } else {
              console.log("No place found.");
            }
          })
          .catch((error) => {
            console.error("Error fetching place:", error);
          });
      }
      const [lng, lat] = place.geometry.coordinates;

      const placeLocation = [lat, lng];

      // Create a marker for each place
      // const marker = L.marker(placeLocation).addTo(map);

      // Define icons for each category
      const icons = {
        snow: L.icon({
          iconUrl: "snowMarker.png", // Replace with the correct path to your snow icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        nature: L.icon({
          iconUrl: "natureMarker.png", // Replace with the correct path to your nature icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        cultural: L.icon({
          iconUrl: "culturalMarker.png", // Replace with the correct path to your cultural icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        historic: L.icon({
          iconUrl: "historicMarker.png", // Replace with the correct path to your historic icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        offcity: L.icon({
          iconUrl: "offcityMarker.png", // Replace with the correct path to your offcity icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        "adventure-sports": L.icon({
          iconUrl: "adventureMarker.png", // Replace with the correct path to your adventure-sports icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        wildlife: L.icon({
          iconUrl: "wildlifeMarker.png", // Replace with the correct path to your wildlife icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        beach: L.icon({
          iconUrl: "beachMarker.png", // Replace with the correct path to your beach icon
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      };

      // Switch statement to determine category and add the marker
      switch (currentCat) {
        case "snow":
          marker = L.marker(placeLocation, { icon: icons.snow }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "nature":
          marker = L.marker(placeLocation, { icon: icons.nature }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "cultural":
          marker = L.marker(placeLocation, { icon: icons.cultural }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "historic":
          marker = L.marker(placeLocation, { icon: icons.historic }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "offcity":
          marker = L.marker(placeLocation, { icon: icons.offcity }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "adventure-sports":
          marker = L.marker(placeLocation, {
            icon: icons["adventure-sports"],
          }).addTo(map).bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "wildlife":
          marker = L.marker(placeLocation, { icon: icons.wildlife }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        case "beach":
          marker = L.marker(placeLocation, { icon: icons.beach }).addTo(map)
            .bindPopup(`
      <div>
        <b>${name}</b><br>
        <div class="popup-buttons">
          <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
          <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
        </div>
      </div>
    `);
          markersArray.push(marker);
          break;
        default:
          console.log("No match found.");
      }

      // Bind a custom popup to the marker
      //   marker.bindPopup(`
      //   <div>
      //     <b>${name}</b><br>
      //     <div class="popup-buttons">
      //       <button onclick="setSource('${name}', ${lat}, ${lng})">Set as Source</button>
      //       <button onclick="setDestination('${name}', ${lat}, ${lng})">Set as Destination</button>
      //     </div>
      //   </div>
      // `);
    });
  }

  function generateRoute() {
    if (!sourceMarker || !destinationMarker) {
      alert("Please select both source and destination.");
      return;
    }

    const sourceLatLng = sourceMarker.getLatLng();
    const destLatLng = destinationMarker.getLatLng();

    // Remove existing route layer if any
    if (routeLayer) {
      routeLayer.remove();
    }

    // Draw a line between source and destination
    console.log(sourceLatLng.lat);

    // Create the routing control
    var apiKey = "ac238553-2737-4483-95e6-8bd892a3e2aa"; // Replace with your actual API key
    var startLat = sourceLatLng.lat;
    var startLng = sourceLatLng.lng;
    var endLat = destLatLng.lat;
    var endLng = destLatLng.lng;

    // Polyline decoding function
    function decodePolyline(encoded) {
      var len = encoded.length;
      var index = 0,
        lat = 0,
        lng = 0;
      var coordinates = [];

      while (index < len) {
        var b,
          shift = 0,
          result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        var dlat = (result >> 1) ^ -(result & 1);
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        var dlng = (result >> 1) ^ -(result & 1);
        lng += dlng;

        coordinates.push(L.latLng(lat / 1e5, lng / 1e5));
      }
      return coordinates;
    }

    // Build the request URL
    var url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=en&key=${apiKey}`;

    console.log("Fetching URL:", url); // Log the request URL

    // Fetch the route from GraphHopper
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data); // Log the entire API response for inspection

        if (data.paths && Array.isArray(data.paths) && data.paths.length > 0) {
          var route = data.paths[0]; // Get the first route

          // Check for encoded points
          if (route.points && route.points_encoded) {
            var latLngs = decodePolyline(route.points);

            // Create a polyline for the route
            var polyline = L.polyline(latLngs, { color: "red" }).addTo(map);
            map.fitBounds(polyline.getBounds()); // Adjust the map view to the route
          } else {
            console.error("Route points are missing:", route);
          }
        } else {
          console.error("No route found:", data);
        }
      })
      .catch((error) => console.error("Error fetching the route:", error));

    const distance = sourceLatLng.distanceTo(destLatLng).toFixed(2); // Distance in meters
    distanceElement.textContent = `Distance: ${distance / 1000} Km`;
  }

  function confirmInfo() {
    const source = document
      .querySelector("#src")
      .textContent.replace("Source: ", "")
      .trim();
    const destination = document
      .querySelector("#dest")
      .textContent.replace("Destination: ", "")
      .trim();

    if (source === "" || destination === "") {
      alert("Please choose both a source and destination!");
      return;
    }

    // Prepare data to be sent to the server
    const data = JSON.stringify({ action: "setLocation", source, destination });

    // Send the source and destination to the server for storage
    fetch("http://localhost:3000/insertLocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert("Location stored !!!!!");
          // Optionally redirect to another page or handle successful operation
        } else {
          alert("Location not stored :(");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error connecting to server");
      });
  }

  // Initialize the map when the page loads
  initializeMap();
}
