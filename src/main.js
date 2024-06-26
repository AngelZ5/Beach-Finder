document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const input = document.querySelector('input[type="text"]');
  const resultsContainer = document.querySelector(".results");
  let beachQualityChart = null; // Variável para armazenar a instância do gráfico

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const location = input.value;
    const beaches = await findBeaches(location);
    const filteredBeaches = beaches.filter(
      (beach) => beach.tags.name !== "Unknown Beach"
    );
    displayResults(filteredBeaches);
    updateQualityChart(filteredBeaches);
  });

  async function findBeaches(location) {
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
      );
      const geocodeData = await geocodeResponse.json();
      const { lat, lon } = geocodeData[0];

      const overpassQuery = `[out:json];node(around:50000,${lat},${lon})["natural"="beach"];out;`;
      const overpassResponse = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          overpassQuery
        )}`
      );
      const overpassData = await overpassResponse.json();

      return overpassData.elements;
    } catch (error) {
      console.error("Error fetching beach data:", error);
      return [];
    }
  }

  function displayResults(beaches) {
    resultsContainer.innerHTML = "";
    if (beaches.length === 0) {
      resultsContainer.innerHTML = "<p>No beaches found.</p>";
      return;
    }

    beaches.forEach((beach) => {
      const beachElement = document.createElement("div");
      beachElement.classList.add("beach");

      beachElement.innerHTML = `
                <h3 class="text-xl font-semibold">${beach.tags.name}</h3>
                <p>Latitude: ${beach.lat}, Longitude: ${beach.lon}</p>
            `;

      resultsContainer.appendChild(beachElement);
    });
  }

  function updateQualityChart(beaches) {
    const beachNames = beaches.map((beach) => beach.tags.name);
    const beachQualityData = beaches.map((beach) => getRandomQuality());

    // Limpar o gráfico anterior se existir
    if (beachQualityChart) {
      beachQualityChart.destroy();
    }

    const ctx = document.getElementById("beachQualityChart").getContext("2d");
    beachQualityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: beachNames,
        datasets: [
          {
            label: "Beach Quality",
            data: beachQualityData,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return value;
              },
            },
          },
        },
      },
    });
  }

  function getRandomQuality() {
    return Math.floor(Math.random() * 5) + 1;
  }
});
