console.log("Page running")
let data;

document.querySelector("#btn").addEventListener("click", async () => {
  await getDinoname();
  await getDinoimage();
});

async function getDinoname() {
  try {
    const response = await fetch(`http://localhost:3000/dinoname`);
    
    const data = await response.json();
    let dinoName = data[0].join(" ");
    console.log(dinoName);
    document.querySelector("#dinoName").textContent = dinoName;
  } catch (err) {
    console.error("No Dinosaurs?", err);
    response.status(500).send("Error fetching dinosaur names");
  }
}

async function apiImage() {
  const key = "NwNGhz-9UH1AKdVJ6xTL6bzA8pE659GhVSErTtVzGaM";
  
  const fetchapi = await fetch(
    `https://api.unsplash.com/search/photos?page=1&query=dinosaur&client_id=${key}&per_page=50`
  );
  data = await fetchapi.json();
}

window.addEventListener("DOMContentLoaded", () => {
  apiImage();
});

function changeImage(url) {
  imgElement.src = url;
}

async function getDinoimage() {
  try {
    console.log(data);
    const dinoimage = data.results[Math.floor(Math.random() * data.results.length)].urls.thumb;
    changeImage(dinoimage);
  } catch (err) {
    console.error("No Dinosaurs?", err);
    response.status(500).send("Error fetching dinosaur names");
  }
}

const imgElement = document.createElement("img");
imgElement.id = "dinoimage";
document.querySelector("body").appendChild(imgElement);