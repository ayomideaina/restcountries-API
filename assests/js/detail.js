
const countryDetails = document.getElementById("detail-content-container")
const backButton = document.getElementById("back-button")
const darkModeToggle = document.getElementById("dark-mode-toggle")
const darkModeContainer = document.getElementById("dark-mode-container")
const modeIcon = document.getElementById("mode-icon")
const body = document.body


const params = new URLSearchParams(window.location.search)
const countryName = params.get("country")

document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode()
  setupEventListeners()
  loadCountryDetail()
})


function initializeDarkMode() {
  const savedMode = localStorage.getItem("darkMode")
  if (savedMode === "light") {
    body.classList.add("light-mode")
    updateDarkModeUI()
  }
}


function setupEventListeners() {
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "index.html"
    })
  }

  darkModeToggle.addEventListener("click", toggleDarkMode)
  darkModeContainer.addEventListener("click", toggleDarkMode)
}


function loadCountryDetail() {
  if (!countryName) {
    showError("No country specified. Please go back and select a country.")
    return
  }

  showLoading()
  fetchCountryDetail(countryName)
}

async function fetchCountryDetail(name) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const country = data[0]

    await displayCountryDetail(country)
  } catch (error) {
    console.error("Error fetching country detail:", error)
    showError("Country not found or failed to load.")
  }
}

async function displayCountryDetail(country) {
  try {
    const { name, flags, population, region, subregion, capital, tld, currencies, languages, borders } = country

    const currencyNames = currencies
      ? Object.values(currencies)
          .map((c) => c.name)
          .join(", ")
      : "N/A"

    const languageList = languages ? Object.values(languages).join(", ") : "N/A"

    const nativeName = name.nativeName ? Object.values(name.nativeName)[0]?.common || name.common : name.common


    let borderList = '<span class="no-borders">No border countries</span>'
    if (borders && borders.length > 0) {
      try {
        const borderData = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borders.join(",")}`)

        if (borderData.ok) {
          const borderCountries = await borderData.json()
          borderList = borderCountries
            .map((borderCountry) => {
              const borderName = borderCountry.name.common
              return `<button class="border-country-btn" onclick="navigateToCountry('${borderName}')">${borderName}</button>`
            })
            .join("")
        } else {
          borderList = '<span class="error-text">Error loading border countries</span>'
        }
      } catch (error) {
        console.error("Error fetching border countries:", error)
        borderList = '<span class="error-text">Error loading border countries</span>'
      }
    }

    countryDetails.innerHTML = `
      <div id="country-detail-content" class="country-detail-content">
        <div class="country-detail-layout">
          <div class="country-flag-section">
            <img id="country-flag" src="${flags.svg || flags.png}" alt="Flag of ${name.common}" />
          </div>
          
          <div class="country-info-section">
            <h2 id="country-name">${name.common}</h2>
            
            <div class="country-details-grid">
              <div class="details-column">
                <p><strong>Native Name:</strong> <span id="native-name">${nativeName}</span></p>
                <p><strong>Population:</strong> <span id="population">${population.toLocaleString()}</span></p>
                <p><strong>Region:</strong> <span id="region">${region}</span></p>
                <p><strong>Sub Region:</strong> <span id="sub-region">${subregion || "N/A"}</span></p>
                <p><strong>Capital:</strong> <span id="capital">${capital?.[0] || "N/A"}</span></p>
              </div>
              
              <div class="details-column">
                <p><strong>Top Level Domain:</strong> <span id="top-level-domain">${tld?.[0] || "N/A"}</span></p>
                <p><strong>Currencies:</strong> <span id="currencies">${currencyNames}</span></p>
                <p><strong>Languages:</strong> <span id="languages">${languageList}</span></p>
              </div>
            </div>
            
            <div class="border-countries-section">
              <p><strong>Border Countries:</strong></p>
              <div id="border-countries" class="border-countries-list">
                ${borderList}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  } catch (error) {
    console.error("Error displaying country detail:", error)
    showError("Error displaying country information.")
  }
}


function navigateToCountry(countryName) {
  window.location.href = `detail.html?country=${encodeURIComponent(countryName)}`
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
  countryDetails.innerHTML = '<div class="loading">Loading country details...</div>'
}

function showError(message) {
  countryDetails.innerHTML = `
    <div class="error">
      <p>${message}</p>
      <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
    </div>
  `
}
