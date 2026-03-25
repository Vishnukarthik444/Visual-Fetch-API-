console.log("Page running");

// 🌐 BACKEND BASE URL (IMPORTANT)
const BASE_URL = "https://visual-fetch-api.onrender.com";


// =======================
// 🟢 GENERATE DINO
// =======================

document.querySelector("#btn").addEventListener("click", async () => {
  await getDinoname();
  await getDinoimage();
});


// 🦖 Get Dino Name
async function getDinoname() {
  try {
    const response = await fetch(`${BASE_URL}/dinoname`);
    const data = await response.json();

    const dinoName = data[0].join(" ");
    console.log(dinoName);

    const nameBox = document.querySelector("#dinoName");
    nameBox.textContent = dinoName;
    nameBox.style.display = "block";

  } catch (err) {
    console.error("No Dinosaurs?", err);
  }
}


// =======================
// 🦕 DINO IMAGE
// =======================

function changeImage(url) {
  const container = document.querySelector("#dinoImage");

  imgElement.onload = () => {
    container.style.display = "block";
  };

  imgElement.onerror = () => {
    console.error("Image failed to load");
  };

  imgElement.src = url;
}

async function getDinoimage() {
  try {
    const res = await fetch(`${BASE_URL}/dinoimage`);
    const data = await res.json();

    const randomImg =
      data.images[Math.floor(Math.random() * data.images.length)];

    changeImage(randomImg);

  } catch (err) {
    console.error("Image fetch error:", err);
  }
}


// Create image element once
const imgElement = document.createElement("img");
imgElement.id = "dinoimage";
document.querySelector("#dinoImage").appendChild(imgElement);


// =======================
// 📊 SIDEBAR ANALYTICS
// =======================

const sidebar = document.getElementById("sidebar");
const btnAnalytics = document.getElementById("analyticsBtn");

btnAnalytics.addEventListener("click", async () => {
  sidebar.classList.toggle("active");
  await loadAnalyticsSidebar();
});


async function loadAnalyticsSidebar() {
  try {
    // Fetch analytics
    const totalRes = await fetch(`${BASE_URL}/analytics/total`);
    const totalData = await totalRes.json();

    const avgRes = await fetch(`${BASE_URL}/analytics/avg-time`);
    const avgData = await avgRes.json();

    const dailyRes = await fetch(`${BASE_URL}/analytics/daily`);
    const dailyData = await dailyRes.json();

    const total = totalData[0]?.total || 0;
    const avg = Math.round(avgData[0]?.avg || 0);

    // 🧾 Display cards
    document.getElementById("analyticsCards").innerHTML = `
      <div class="analytics-card">
        <p>Total Generations</p>
        <h1>${total}</h1>
      </div>

      <div class="analytics-card">
        <p>Avg Response Time</p>
        <h1>${avg} ms</h1>
      </div>
    `;

    // 📊 Chart
    const labels = dailyData.map(d => {
      const date = new Date(d.day);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    });

    const values = dailyData.map(d => d.count);

    const ctx = document.getElementById("myChart");

    if (window.chart) {
      window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Usage",
            data: values,
            backgroundColor: values.map((v, i) =>
              i === values.length - 1 ? "#3498db" : "rgba(255,255,255,0.2)"
            ),
            borderRadius: 8,
            barThickness: 25
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "white" }
          },
          tooltip: {
            backgroundColor: "#1e1e1e",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "white" }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.1)" },
            ticks: { color: "white" }
          }
        }
      }
    });

  } catch (err) {
    console.error("Analytics error:", err);
  }
}