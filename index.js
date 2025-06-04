const express = require("express");
const app = express();
const cors = require("cors")
const port = 3000;
const fetch = require('node-fetch');


app.use(cors())
app.use(express.static('Dinosaur'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/dinoname", async (request, response) => {
  try {
    const fetchapi = await fetch("https://dinoipsum.com/api/?format=json&words=2&paragraphs=1")
    const data = await fetchapi.json()
    response.json(data);
  } catch (error) {
    console.error("No Dinosaurs Name");
  }
});



app.get("/dinoimage", async (request, response) => {
  try {
    const key = "NwNGhz-9UH1AKdVJ6xTL6bzA8pE659GhVSErTtVzGaM"
    const fetchapi = await fetch(`https://api.unsplash.com/search/photos?page=1&query=Dinosaur&client_id=${key}`)
  
    const data = await fetchapi.json()
    const imageUrls = data.results.map(image => image.urls.full);
    response.status(200).json({ images: imageUrls });
  } catch (error) {
    console.error("No Dinosaur Image");
  }
});
