const API_URL = "https://restcountries.com/v3.1/all?fields=name,population,region,capital,flags,cca3"


let allCountries = []
let filteredCountries = []


const countriesContainer = document.getElementById("countries-container")
const searchInput = document.getElementById("searchInput")
const filterRegion = document.getElementById("filter-region")
const darkModeToggle = document.getElementById("dark-mode-toggle")
const darkModeContainer = document.getElementById("dark-mode-container")
const modeIcon = document.getElementById("mode-icon")
const body = document.body


function initializeDarkMode() {
  const savedMode = localStorage.getItem("darkMode")
  if (savedMode === "light") {
    body.classList.add("light-mode")
    updateDarkModeUI()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode()
  fetchCountries()
  setupEventListeners()
})


async function fetchCountries() {
  try {
    showLoading()

    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from API")
    }

  
    allCountries = data
    filteredCountries = [...data]

    displayCountries(filteredCountries)
  } catch (error) {
    console.error("Error fetching countries:", error)
    showError("Failed to load countries. Please check your internet connection and try again.")
  }
}

function getCountryName(country) {
  return country.name?.common || country.name?.official || "Unknown Country"
}

function getCapital(country) {
  if (!country.capital || !Array.isArray(country.capital) || country.capital.length === 0) {
    return "N/A"
  }
  return country.capital[0]
}

function getFlag(country) {
  return country.flags?.png || country.flags?.svg || "https://via.placeholder.com/250x160?text=No+Flag"
}

function formatPopulation(population) {
  if (!population || isNaN(population)) return "N/A"
  return population.toLocaleString()
}

function displayCountries(countries) {
  if (!Array.isArray(countries)) {
    countries = []
  }

  if (countries.length === 0) {
    countriesContainer.innerHTML = '<div class="no-results">No countries found matching your criteria.</div>'
    return
  }

  const countriesHTML = countries
    .map((country) => {
      const name = getCountryName(country)
      const population = formatPopulation(country.population)
      const capital = getCapital(country)
      const region = country.region || "N/A"
      const flag = getFlag(country)

      return `
      <div class="country-card" data-country="${name}" style="cursor: pointer;">
        <img src="${flag}" alt="Flag of ${name}" onerror="this.src='https://via.placeholder.com/250x160?text=No+Flag'">
        <div class="card-content">
          <h3 class="country-name">${name}</h3>
          <div class="country-info">
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Region:</strong> ${region}</p>
            <p><strong>Capital:</strong> ${capital}</p>
          </div>
        </div>
      </div>
    `
    })
    .join("")

  countriesContainer.innerHTML = countriesHTML

  addCountryCardListeners()
}

function addCountryCardListeners() {
  const countryCards = document.querySelectorAll(".country-card")
  console.log("Adding listeners to", countryCards.length, "country cards") 

  countryCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const countryName = card.dataset.country
      console.log(`Card ${index + 1} clicked:`, countryName) 
      navigateToDetail(countryName)
    })

  
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)"
    })
  })
}

function navigateToDetail(countryName) {
  console.log("Navigating to:", countryName)
  window.location.href = `detail.html?country=${encodeURIComponent(countryName)}`
}

function filterCountries() {
  if (!Array.isArray(allCountries)) {
    filteredCountries = []
    displayCountries(filteredCountries)
    return
  }

  const searchTerm = searchInput.value.toLowerCase().trim()
  const selectedRegion = filterRegion.value

  filteredCountries = allCountries.filter((country) => {
    const name = getCountryName(country).toLowerCase()
    const matchesSearch = !searchTerm || name.includes(searchTerm)

    const region = country.region || ""
    const matchesRegion = !selectedRegion || region === selectedRegion

    return matchesSearch && matchesRegion
  })

  displayCountries(filteredCountries)
}

function setupEventListeners() {
  searchInput.addEventListener("input", filterCountries)
  filterRegion.addEventListener("change", filterCountries)
  darkModeToggle.addEventListener("click", toggleDarkMode)
  darkModeContainer.addEventListener("click", toggleDarkMode)
}

function toggleDarkMode() {
  body.classList.toggle("light-mode")
  updateDarkModeUI()

  const isLightMode = body.classList.contains("light-mode")
  localStorage.setItem("darkMode", isLightMode ? "light" : "dark")
}

function updateDarkModeUI() {
  const isLightMode = body.classList.contains("light-mode")

  if (isLightMode) {
    darkModeToggle.textContent = "Dark Mode"
    modeIcon.className = "bi bi-moon"
  } else {
    darkModeToggle.textContent = "Light Mode"
    modeIcon.className = "bi bi-moon-fill"
  }
}

function showLoading() {
  countriesContainer.innerHTML = '<div class="loading">Loading countries...</div>'
}

function showError(message) {
  countriesContainer.innerHTML = `
    <div class="error">
      ${message}
      <br><br>
      <button class="retry-btn" onclick="fetchCountries()">Try Again</button>
    </div>
  `
}
