// OMDb API Configuration
const API_KEY = 'fbe592b8';
const API_BASE_URL = 'https://www.omdbapi.com/';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const movieCard = document.getElementById('movieCard');
const recentSearchesSection = document.getElementById('recentSearches');
const recentList = document.getElementById('recentList');

// Movie Details Elements
const moviePoster = document.getElementById('moviePoster');
const movieTitle = document.getElementById('movieTitle');
const movieYear = document.getElementById('movieYear');
const movieRuntime = document.getElementById('movieRuntime');
const movieGenre = document.getElementById('movieGenre');
const moviePlot = document.getElementById('moviePlot');
const movieDirector = document.getElementById('movieDirector');
const movieActors = document.getElementById('movieActors');
const ratingValue = document.getElementById('ratingValue');
const ratingBadge = document.getElementById('ratingBadge');

// Placeholder poster for missing images
const PLACEHOLDER_POSTER = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster+Available';

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRecentSearches();

    // Show/hide clear button based on input
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim()) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    });
});

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
clearBtn.addEventListener('click', clearSearch);

// Press Enter to search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

/**
 * Handle movie search
 */
async function handleSearch() {
    const searchTerm = searchInput.value.trim();

    // Validate input
    if (!searchTerm) {
        showError('Please enter a movie title');
        return;
    }

    // Show loading state
    showLoading();
    hideError();
    hideMovieCard();

    try {
        // Fetch movie data from OMDb API
        const movie = await fetchMovieData(searchTerm);

        // Display movie details
        displayMovie(movie);

        // Save to recent searches
        saveRecentSearch(searchTerm);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Fetch movie data from OMDb API
 * @param {string} title - Movie title to search
 * @returns {Promise<Object>} Movie data
 */
async function fetchMovieData(title) {
    const url = `${API_BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Check if movie was found
        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movie not found');
        }

        return data;

    } catch (error) {
        throw new Error('Failed to fetch movie data. Please try again.');
    }
}

/**
 * Display movie details on the page
 * @param {Object} movie - Movie data object
 */
function displayMovie(movie) {
    // Set poster with fallback to placeholder
    moviePoster.src = movie.Poster !== 'N/A' ? movie.Poster : PLACEHOLDER_POSTER;
    moviePoster.alt = `${movie.Title} Poster`;

    // Set movie details
    movieTitle.textContent = movie.Title;
    movieYear.textContent = movie.Year;
    movieRuntime.textContent = movie.Runtime !== 'N/A' ? movie.Runtime : 'Runtime N/A';
    movieGenre.textContent = movie.Genre !== 'N/A' ? movie.Genre : 'Genre N/A';
    moviePlot.textContent = movie.Plot !== 'N/A' ? movie.Plot : 'Plot information not available.';
    movieDirector.textContent = movie.Director !== 'N/A' ? movie.Director : 'Not available';
    movieActors.textContent = movie.Actors !== 'N/A' ? movie.Actors : 'Not available';

    // Set IMDb rating
    if (movie.imdbRating !== 'N/A') {
        ratingValue.textContent = movie.imdbRating;
        ratingBadge.style.display = 'flex';
    } else {
        ratingBadge.style.display = 'none';
    }

    // Show movie card
    showMovieCard();
}

/**
 * Save search term to localStorage
 * @param {string} searchTerm - Movie title searched
 */
function saveRecentSearch(searchTerm) {
    let recentSearches = getRecentSearches();

    // Remove if already exists (to avoid duplicates)
    recentSearches = recentSearches.filter(term =>
        term.toLowerCase() !== searchTerm.toLowerCase()
    );

    // Add to beginning of array
    recentSearches.unshift(searchTerm);

    // Keep only last 5 searches
    recentSearches = recentSearches.slice(0, 5);

    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    // Update UI
    loadRecentSearches();
}

/**
 * Get recent searches from localStorage
 * @returns {Array<string>} Array of recent search terms
 */
function getRecentSearches() {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
}

/**
 * Load and display recent searches
 */
function loadRecentSearches() {
    const recentSearches = getRecentSearches();

    // Clear existing items
    recentList.innerHTML = '';

    if (recentSearches.length === 0) {
        recentSearchesSection.classList.add('hidden');
        return;
    }

    // Show recent searches section
    recentSearchesSection.classList.remove('hidden');

    // Create and append recent search items
    recentSearches.forEach(searchTerm => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.textContent = searchTerm;

        // Click to search again
        item.addEventListener('click', () => {
            searchInput.value = searchTerm;
            clearBtn.classList.add('visible');
            handleSearch();
        });

        recentList.appendChild(item);
    });
}

/**
 * Clear search input
 */
function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    searchInput.focus();
}

/**
 * Show loading animation
 */
function showLoading() {
    loading.classList.remove('hidden');
}

/**
 * Hide loading animation
 */
function hideLoading() {
    loading.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show movie card
 */
function showMovieCard() {
    movieCard.classList.remove('hidden');
}

/**
 * Hide movie card
 */
function hideMovieCard() {
    movieCard.classList.add('hidden');
}
