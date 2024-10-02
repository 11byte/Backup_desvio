const catTitle = document.querySelector(".cat-title");
const navigation = document.getElementById("nav-Bar");
const toolSphere = document.getElementById("tool-sphere");
const toolFrame = document.getElementById("tool-frame");
var toolCount = 0;
const loading = document.getElementById("loading-screen");
const screenDisable = document.querySelector(".screen-disable");
const container1 = document.querySelector(".cat-container-1");
const container2 = document.querySelector(".cat-container-2");
const categories = document.querySelectorAll(".category");
const srctxt = document.getElementById("src");
const desttxt = document.getElementById("dest");
const totalCategories = categories.length;
const categoryWidth = categories[0].offsetWidth + 100;
const offset = categoryWidth * totalCategories;
let currentIndex = 0;
var catChoice = " ";
var darkModeToggle = 0;
var currentBg = document.body.style.backgroundImage;

document.getElementById("darkMode").addEventListener("click", function () {
  if (darkModeToggle === 0) {
    document.querySelectorAll(".tools").forEach(function (element) {
      element.style.backgroundColor = "aliceblue";
    });
    navigation.style.color = "black";
    srctxt.style.color = "navy";
    desttxt.style.color = "navy";
    catTitle.style.background =
      "-webkit-linear-gradient(rgb(249, 42, 42), #dfb0b0, #182644)";
    catTitle.style.webkitBackgroundClip = "text";
    catTitle.style.color = "transparent";
    catTitle.style.animation = "darkBoxShadowAnimation 5s infinite ease-in-out";
    toolFrame.style.background =
      "linear-gradient(135deg, #d4f1f982, #b6abffd3)";

    document.getElementById("choose-travel-spot").style.color = "navy";
    document.querySelectorAll(".tool-img").forEach(function (element) {
      element.style.filter = "invert(0%)";
    });

    document.getElementById("darkMode").src = "moon.png";
    document.getElementById("darkMode").title = "Dark mode";
    currentBg = document.body.style.backgroundImage;
    document.body.style.backgroundImage =
      "linear-gradient( to bottom,#fffaf0,#ffdab9,#ffb6c1,#87ceeb)";

    darkModeToggle = 1;
  } else {
    document.querySelectorAll(".tools").forEach(function (element) {
      element.style.backgroundColor = "rgb(0, 15, 56)";
    });
    navigation.style.color = "aliceblue";
    srctxt.style.color = "rgb(255, 224, 233)";
    desttxt.style.color = "rgb(255, 224, 233)";
    catTitle.style.background =
      "-webkit-linear-gradient(rgba(255, 102, 102, 1), #fefefe, #95b5fa)";
    catTitle.style.webkitBackgroundClip = "text";
    catTitle.style.color = "transparent";
    catTitle.style.animation = "boxShadowAnimation 5s infinite ease-in-out";
    toolFrame.style.background =
      "linear-gradient(135deg, #57d1f382, #9d8effd3)";

    document.getElementById("choose-travel-spot").style.color =
      "rgb(255, 224, 233)";
    document.querySelectorAll(".tool-img").forEach(function (element) {
      element.style.filter = "invert(100%)";
    });
    document.getElementById("darkMode").src = "sun.png";
    document.getElementById("darkMode").title = "Light mode";
    document.body.style.backgroundImage = currentBg;
    darkModeToggle = 0;
  }
});

document.querySelectorAll(".tools").forEach(function (element) {
  element.addEventListener("mouseenter", function () {
    if (darkModeToggle === 0) {
      element.style.backgroundColor = "rgb(55, 71, 116)";
    }
  });
  element.addEventListener("mouseleave", function () {
    if (darkModeToggle === 0) {
      element.style.backgroundColor = "rgb(0, 15, 56)";
    }
  });
});

var themeCounter = 0;
document.getElementById("themeBtn").addEventListener("click", function () {
  if (themeCounter === 0) {
    document.getElementById("themeBox").style.height = "120px";
    document.getElementById("themeBox").style.width = "200px";
    document.getElementById("themeBox").style.opacity = "1";

    document.querySelectorAll(".themeColors").forEach(function (element) {
      element.style.height = "50px";
      element.style.width = "50px";
      element.style.opacity = "1";
    });
    themeCounter = 1;
  } else {
    document.getElementById("themeBox").style.height = "0px";
    document.getElementById("themeBox").style.width = "0px";
    document.getElementById("themeBox").style.opacity = "0";
    document.querySelectorAll(".themeColors").forEach(function (element) {
      element.style.height = "0px";
      element.style.width = "0px";
      element.style.opacity = "0";
    });
    themeCounter = 0;
  }
});

document.querySelectorAll(".themeColors").forEach(function (element) {
  element.addEventListener("click", function () {
    document.body.style.backgroundImage = this.style.backgroundImage;
    this.style.borderStyle = "solid";
    this.style.borderColor = "aliceblue";
    var myData = this.dataset.ch;
    document.querySelectorAll(".themeColors").forEach(function (inner) {
      if (inner.dataset.ch !== myData) {
        console.log("ok");
        inner.style.borderStyle = "none";
      }
    });
  });
});

function enterMap() {
  if (catChoice === " ") {
    alert("Please Select a Category !!!");
    return;
  }

  // Prepare data to be sent to the server
  const data = JSON.stringify({ action: "setCategory", catChoice });

  // Send the source and destination to the server for storage
  fetch("http://localhost:3000/category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.log("category stored successfully!");
        // Optionally redirect to another page or handle successful operation
      } else {
        console.log("Category not stored :(");
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Error connecting to server");
    });

  window.open("map.html", "_blank");
}

document.getElementById("map-icon").addEventListener("click", enterMap);

document.addEventListener("DOMContentLoaded", function () {
  // Define the labels where the data will be displayed
  const srctxt = document.getElementById("src"); // Assuming this is the ID for the source label
  const desttxt = document.getElementById("dest"); // Assuming this is the ID for the destination label

  const id = 1; // The ID you want to fetch

  fetch(`http://localhost:3000/location?id=${id}`)
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
        // Assuming the `location` table has `src` and `destination` columns
        srctxt.textContent = `${data.src}`; // Adjust according to your actual data structure
        desttxt.textContent = `${data.destination}`; // Adjust according to your actual data structure
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // document.getElementById("src").textContent = "Error fetching data";
    });
});

document
  .querySelector(".cat-arrow-front")
  .addEventListener("click", function () {
    if (currentIndex < totalCategories - 4) {
      currentIndex++;
      container1.style.transform = `translateX(-${
        categoryWidth * currentIndex
      }px)`;
      container2.style.transform = `translateX(-${
        categoryWidth * currentIndex
      }px)`;
    }
  });

document
  .querySelector(".cat-arrow-back")
  .addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      container1.style.transform = `translateX(-${
        categoryWidth * currentIndex
      }px)`;
      container2.style.transform = `translateX(-${
        categoryWidth * currentIndex
      }px)`;
    }
  });

document.querySelector("#hotel").addEventListener("click", function () {
  loading.style.zIndex = "50";
  loading.style.display = "block";
  document.querySelector("#load-symbol").style.display = "block";

  setTimeout(function () {
    loading.style.zIndex = "-5";
    document.querySelector("#load-symbol").style.display = "none";
    loading.style.display = "none";
    window.open("hotel.html", "_blank");
  }, 2500);
});

document.querySelector("#eco-coins").addEventListener("click", function () {
  loading.style.zIndex = "50";
  loading.style.display = "block";
  document.querySelector("#load-symbol").style.display = "block";

  setTimeout(function () {
    loading.style.zIndex = "-5";
    document.querySelector("#load-symbol").style.display = "none";
    loading.style.display = "none";
    window.open("Evocoins.html", "_blank");
  }, 2500);
});

document.querySelector("#iternary").addEventListener("click", function () {
  loading.style.zIndex = "50";
  loading.style.display = "block";
  document.querySelector("#load-symbol").style.display = "block";

  setTimeout(function () {
    loading.style.zIndex = "-5";
    document.querySelector("#load-symbol").style.display = "none";
    loading.style.display = "none";
    window.open("iternary.html", "_blank");
  }, 2000);
});

toolSphere.addEventListener("mouseenter", function () {
  toolSphere.style.borderStyle = "double";
  toolSphere.style.borderColor = "navy";
});
toolSphere.addEventListener("mouseleave", function () {
  toolSphere.style.border = "none";
});
toolSphere.addEventListener("click", function () {
  if (toolCount === 0) {
    toolFrame.style.zIndex = "10";
    toolFrame.style.width = "550px";
    toolFrame.style.height = "550px";
    toolFrame.style.opacity = "1";
    toolCount = 1;
  } else {
    toolFrame.style.zIndex = "-10";
    toolFrame.style.width = "0px";
    toolFrame.style.height = "0px";
    toolFrame.style.opacity = "0";
    toolCount = 0;
  }
});

categories.forEach((category) => {
  category.addEventListener("click", function () {
    catChoice = this.dataset.ch;
    console.log(catChoice);

    categories.forEach((cat) => {
      if (cat.classList.contains("active") && this != cat) {
        cat.querySelector("img").style.opacity = "0.6";
        cat.classList.remove("active");
      }
    });
    const img = this.querySelector("img"); // Select the image within the clicked category
    if (!this.classList.contains("active")) {
      this.classList.add("active");
      img.style.opacity = "1"; // Make the image fully opaque
    } else {
      this.classList.remove("active");
      img.style.opacity = "0.6"; // Make the image slightly transparent
    }
  });

  category.addEventListener("mouseenter", function () {
    this.classList.add("hover");
    this.querySelector("img").style.opacity = "1";
    // console.log(this.dataset.ch);
    this.querySelector(".overlay").style.opacity = "1";
    category.style.cursor = "pointer";
  });

  category.addEventListener("mouseleave", function () {
    this.classList.remove("hover");
    this.querySelector(".overlay").style.opacity = "0";
  });
  category.addEventListener("mouseleave", function () {
    if (!this.classList.contains("active")) {
      this.querySelector("img").style.opacity = "0.6";
    }
  });
});

// Add CSS for active and hover states
const style = document.createElement("style");
style.innerHTML = `
  .category.active {
    height: 370px;
    width: 345px;
    box-shadow: 25px 20px 30px rgb(169, 222, 255);
  }
  .category {
    height: 320px;
    width: 300px;
    box-shadow: 10px 10px 10px rgb(0, 0, 40);
    transition: all 0.3s ease;
  }
  .category.hover {
    height: 370px;
    width: 345px;
    box-shadow: 25px 20px 50px rgba(153, 153, 245, 0.638);
  }
`;
document.head.appendChild(style);
