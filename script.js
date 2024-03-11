// Função para obter as coordenadas geográficas a partir do nome do local
async function getCoordinatesFromLocation(locationName) {
  const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    locationName
  )}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      throw new Error("Localização não encontrada.");
    }
  } catch (error) {
    throw new Error("Erro ao obter a localização: " + error.message);
  }
}

// Função para obter as sugestões de bairros para uma cidade específica
async function getNeighborhoodSuggestions(cityName, input) {
  const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}, ${encodeURIComponent(cityName)}, Brazil&city`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.length > 0) {
      const suggestions = data.map((item) => item.display_name);
      return suggestions;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Erro ao obter sugestões de bairros:", error);
    return [];
  }
}

// Função para obter as sugestões de ruas para uma cidade específica
async function getStreetSuggestions(cityName, input) {
  const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}, ${encodeURIComponent(cityName)}, Brazil&street`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.length > 0) {
      const suggestions = data.map((item) => item.display_name);
      return suggestions;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Erro ao obter sugestões de ruas:", error);
    return [];
  }
}

// Função para configurar o autocomplete para um campo de entrada
function setupAutocomplete(input, cityName) {
  let timeoutId;

  input.addEventListener("input", async function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const neighborhoodSuggestions = await getNeighborhoodSuggestions(
        cityName,
        input.value
      );
      const streetSuggestions = await getStreetSuggestions(
        cityName,
        input.value
      );
      const suggestions = [...neighborhoodSuggestions, ...streetSuggestions];
      autocomplete(input, suggestions);
    }, 300); // Definir um atraso de 300 milissegundos
  });

  // Ocultar o menu de autocompletar quando uma opção é selecionada
  input.addEventListener("blur", function () {
    setTimeout(function () {
      const dropdown = input.parentNode.querySelector(".autocomplete-items");
      if (dropdown) {
        dropdown.remove();
      }
    }, 200); // Aguardar um curto período antes de remover o menu
  });
}

// Função para adicionar sugestões de autocomplete a um campo de entrada
function autocomplete(input, suggestions) {
  // Remover sugestões antigas
  const dropdown = input.parentNode.querySelector(".autocomplete-items");
  if (dropdown) {
    dropdown.remove();
  }

  // Adicionar novas sugestões
  const newDropdown = document.createElement("div");
  newDropdown.classList.add("autocomplete-items");
  input.parentNode.appendChild(newDropdown);

  for (let suggestion of suggestions) {
    const option = document.createElement("div");
    option.innerHTML = suggestion;
    option.addEventListener("click", function () {
      input.value = suggestion;
      newDropdown.remove();
    });
    newDropdown.appendChild(option);
  }
}

// Função para calcular a distância entre dois pontos usando a Fórmula de Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = ((lat2 - lat1) * Math.PI) / 180; // Diferença de latitude em radianos
  const dLon = ((lon2 - lon1) * Math.PI) / 180; // Diferença de longitude em radianos
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em quilômetros
  return distance;
}

// Função para calcular o valor da corrida com base na distância
function calculateFare(distance, farePerKm) {
  return distance * farePerKm;
}

// Função principal para calcular a rota e exibir o resultado
async function calculateRoute() {
  const startInput = document.getElementById("start").value;
  const endInput = document.getElementById("end").value;

  // Remover sugestões de autocomplete ao clicar em calcular
  const dropdowns = document.querySelectorAll(".autocomplete-items");
  dropdowns.forEach((dropdown) => dropdown.remove());

  try {
    // Obter as coordenadas da localização inicial e final
    const startCoordinates = await getCoordinatesFromLocation(startInput);
    const endCoordinates = await getCoordinatesFromLocation(endInput);

    // Calcular a distância entre os pontos
    const distance = calculateDistance(
      startCoordinates.latitude,
      startCoordinates.longitude,
      endCoordinates.latitude,
      endCoordinates.longitude
    );

    // Definir a tarifa por quilômetro (em reais)
    const farePerKm = 3; // Exemplo: R$ 3 por quilômetro

    // Calcular o valor da corrida
    const fare = calculateFare(distance, farePerKm);

    // Exibir o resultado
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `Distância: ${distance.toFixed(
      2
    )} km<br>Valor da corrida: R$ ${fare.toFixed(2)}`;
  } catch (error) {
    alert(error.message);
  }
}

// Chamada para configurar o autocomplete nos campos de entrada
document.addEventListener("DOMContentLoaded", function () {
  const cityName = "Mossoró"; // Definir o nome da cidade
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");
  setupAutocomplete(startInput, cityName);
  setupAutocomplete(endInput, cityName);
});
