// REST Countries API v3.1 endpoint
const API_URL = "https://restcountries.com/v3.1/all?fields=name,population,region,capital,flags,cca3"

// Global variables
let allCountries = []
let filteredCountries = []

// DOM Elements
const countriesContainer = document.getElementById("countries-container")
const searchInput = document.getElementById("searchInput")
const filterRegion = document.getElementById("filter-region")
const darkModeToggle = document.getElementById("dark-mode-toggle")
const darkModeContainer = document.getElementById("dark-mode-container")
const modeIcon = document.getElementById("mode-icon")
const body = document.body


document.addEventListener("DOMContentLoaded", () => {
  fetchCountries()
  setupEventListeners()
})

// function to fetch countries from the REST Countries API
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

    // used to store the countries data
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
  // creating country array
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
      <div class="country-card" data-country="${name}">
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
}

// Filter countries based on search term and selected region
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

//event listeners function
function setupEventListeners() {

  searchInput.addEventListener("input", filterCountries)

  filterRegion.addEventListener("change", filterCountries)

  darkModeToggle.addEventListener("click", toggleDarkMode)
  darkModeContainer.addEventListener("click", toggleDarkMode)
}

// function to toggle between dark and light mode
function toggleDarkMode() {
  body.classList.toggle("light-mode")

  if (body.classList.contains("light-mode")) {
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
