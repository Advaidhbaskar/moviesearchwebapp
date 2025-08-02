// Enhanced Movie Search App JavaScript (Movies Only)
const API_KEY = '72bc447a';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const movieDetailsDiv = document.getElementById('movieDetails');
const loadingDiv = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const paginationDiv = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const modalClose = document.getElementById('modalClose');
const favoritesList = document.getElementById('favoritesList');
const closeMovieDetails = document.getElementById('closeMovieDetails');
const sortControls = document.getElementById('sortControls');
const sortBy = document.getElementById('sortBy');
const sortOrder = document.getElementById('sortOrder');
const genreFilter = document.getElementById('genreFilter');
const languageFilter = document.getElementById('languageFilter');
const backBtn = document.getElementById('backBtn');

let currentPage = 1;
let currentQuery = '';
let totalResults = 0;
let allMovies = [];
let favorites = [];
let isDetailsView = false;

// Initialize favorites from localStorage if available
try {
    if (typeof localStorage !== 'undefined') {
        favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];
    }
} catch (e) {
    favorites = [];
}

// Event listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        searchMovies(currentQuery, currentPage);
    }
});

nextPageBtn.addEventListener('click', () => {
    const maxPages = Math.ceil(totalResults / 10);
    if (currentPage < maxPages) {
        currentPage++;
        searchMovies(currentQuery, currentPage);
    }
});

sortBy.addEventListener('change', handleSortChange);
sortOrder.addEventListener('change', applySorting);
genreFilter.addEventListener('change', applySorting);
languageFilter.addEventListener('change', applySorting);

favoritesBtn.addEventListener('click', showFavorites);
modalClose.addEventListener('click', () => {
    favoritesModal.style.display = 'none';
});

closeMovieDetails.addEventListener('click', () => {
    backToMainScreen();
});

// Back button functionality
backBtn.addEventListener('click', () => {
    backToMainScreen();
});

window.addEventListener('click', (e) => {
    if (e.target === favoritesModal) {
        favoritesModal.style.display = 'none';
    }
});

function showBackButton() {
    backBtn.style.display = 'flex';
    setTimeout(() => {
        backBtn.classList.add('show');
    }, 100);
    isDetailsView = true;
}

function hideBackButton() {
    backBtn.classList.remove('show');
    setTimeout(() => {
        backBtn.style.display = 'none';
    }, 300);
    isDetailsView = false;
}

function backToMainScreen() {
    movieDetailsDiv.style.display = 'none';
    hideBackButton();
    
    // Scroll back to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Re-focus search input
    searchInput.focus();
}

function handleSortChange() {
    const sortField = sortBy.value;
    
    // Hide all filter dropdowns first
    sortOrder.style.display = 'inline-block';
    genreFilter.style.display = 'none';
    languageFilter.style.display = 'none';
    
    // Show appropriate filter based on selection
    if (sortField === 'genre') {
        sortOrder.style.display = 'none';
        genreFilter.style.display = 'inline-block';
    } else if (sortField === 'language') {
        sortOrder.style.display = 'none';
        languageFilter.style.display = 'inline-block';
    }
    
    applySorting();
}

function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showError('🎬 Please enter a movie title to search for amazing films!');
        return;
    }
    currentQuery = searchTerm;
    currentPage = 1;
    searchMovies(searchTerm, 1);
}

async function searchMovies(query, page = 1) {
    showLoading(true, '🔍 Searching for amazing movies...');
    movieDetailsDiv.style.display = 'none';
    hideBackButton();
    
    try {
        const response = await fetch(
            `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${API_KEY}`
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        showLoading(false);
        
        if (data.Response === "True") {
            totalResults = parseInt(data.totalResults);
            // Fetch detailed info for each movie including box office
            const detailedMovies = await fetchDetailedMovies(data.Search);
            allMovies = detailedMovies;
            displayMovies(detailedMovies);
            updatePagination();
            sortControls.style.display = 'flex';
        } else if (data.Error && data.Error.includes('Invalid API key')) {
            showError('🔑 API key issue. Trying backup method...');
            tryBackupAPIKey(query, page);
        } else {
            showNoResults(`🎬 ${data.Error || 'No movies found with that title. Try searching for something else!'}`);
            hidePagination();
            sortControls.style.display = 'none';
        }
    } catch (error) {
        showLoading(false);
        console.error(error);
        showError('🌐 Connection error. Please check your internet and try again!');
        hidePagination();
        sortControls.style.display = 'none';
    }
}

async function fetchDetailedMovies(movies) {
    const detailedMovies = [];
    showLoading(true, '🎞️ Loading detailed movie information...');
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
            const detailed = await response.json();
            if (detailed.Response === "True") {
                detailedMovies.push(detailed);
            } else {
                // If detailed fetch fails, use basic info with N/A for missing fields
                detailedMovies.push({
                    ...movie,
                    BoxOffice: 'N/A',
                    Genre: movie.Genre || 'N/A',
                    Language: movie.Language || 'N/A',
                    imdbRating: 'N/A'
                });
            }
        } catch {
            // On error, use basic info
            detailedMovies.push({
                ...movie,
                BoxOffice: 'N/A',
                Genre: movie.Genre || 'N/A',
                Language: movie.Language || 'N/A',
                imdbRating: 'N/A'
            });
        }
        
        // Update loading progress with colorful messages
        const progressMessages = [
            '🎬 Loading movie magic...',
            '🍿 Gathering cinema data...',
            '🎭 Collecting film details...',
            '🌟 Preparing movie info...',
            '🎪 Almost ready...'
        ];
        const messageIndex = Math.floor((i / movies.length) * progressMessages.length);
        loadingText.textContent = `${progressMessages[messageIndex]} ${i + 1}/${movies.length}`;
    }
    
    showLoading(false);
    return detailedMovies;
}

async function tryBackupAPIKey(query, page = 1) {
    const backupKeys = ['2f6435d9', 'trilogy', '8691812a', 'b9bd27d6'];
    showLoading(true, '🔄 Trying alternative sources...');
    
    for (let key of backupKeys) {
        try {
            const response = await fetch(
                `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${key}`
            );
            const data = await response.json();
            if (data.Response === "True") {
                totalResults = parseInt(data.totalResults);
                const detailedMovies = await fetchDetailedMovies(data.Search);
                allMovies = detailedMovies;
                displayMovies(detailedMovies);
                updatePagination();
                sortControls.style.display = 'flex';
                return;
            }
        } catch {}
    }
    showLoading(false);
    showError('🚫 All sources are currently unavailable. Please try again later!');
}

function displayMovies(movies) {
    resultsDiv.innerHTML = '';
    
    // Add a results header with count
    const resultsHeader = document.createElement('div');
    resultsHeader.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        margin-bottom: 20px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
        border-radius: 20px;
        border: 2px solid rgba(255, 107, 107, 0.2);
        backdrop-filter: blur(10px);
    `;
    resultsHeader.innerHTML = `
        <h3 style="
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.5em;
            margin-bottom: 10px;
            font-weight: 700;
        ">🎬 Found ${movies.length} Amazing Movies!</h3>
        <p style="color: #666; font-size: 1.1em;">Click on any movie to see detailed information</p>
    `;
    resultsDiv.appendChild(resultsHeader);
    
    movies.forEach((movie, index) => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        const isFavorited = favorites.some(fav => fav.imdbID === movie.imdbID);
        
        // Handle box office display - show even if N/A
        let boxOfficeHTML = '';
        if (movie.BoxOffice && movie.BoxOffice !== 'N/A') {
            boxOfficeHTML = `<div class="box-office">💰 ${movie.BoxOffice}</div>`;
        } else {
            boxOfficeHTML = `<div class="box-office not-available">📊 Box Office: N/A</div>`;
        }
        
        // Add animation delay for staggered entrance
        movieItem.style.animationDelay = `${index * 0.1}s`;
        movieItem.style.animation = 'fadeInUp 0.6s ease forwards';
        movieItem.style.opacity = '0';
        movieItem.style.transform = 'translateY(30px)';
        
        movieItem.innerHTML = `
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}"
                onclick="toggleFavorite('${movie.imdbID}', '${(movie.Title || '').replace(/'/g, "\\'")}', '${movie.Year}', '${movie.Poster}')">
                ${isFavorited ? '❤️' : '🤍'}
            </button>
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x350/ff6b6b/ffffff?text=🎬+No+Image'}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p><strong>📅 Year:</strong> ${movie.Year}</p>
            <p><strong>🎭 Type:</strong> ${movie.Type}</p>
            ${movie.Genre && movie.Genre !== 'N/A' ? `<p><strong>🎪 Genre:</strong> ${movie.Genre}</p>` : ''}
            ${movie.Language && movie.Language !== 'N/A' ? `<p><strong>🌍 Language:</strong> ${movie.Language}</p>` : ''}
            ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `<p><strong>⭐ Rating:</strong> ${movie.imdbRating}/10</p>` : ''}
            ${boxOfficeHTML}
        `;
        
        movieItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn')) {
                fetchMovieDetails(movie.imdbID);
            }
        });
        
        resultsDiv.appendChild(movieItem);
    });
    
    // Add CSS for the animation
    if (!document.querySelector('#fadeInUpStyle')) {
        const style = document.createElement('style');
        style.id = 'fadeInUpStyle';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function applySorting() {
    if (allMovies.length === 0) return;

    const sortField = sortBy.value;
    let filteredMovies = [...allMovies];

    if (sortField === 'genre') {
        const selectedGenre = genreFilter.value;
        if (selectedGenre) {
            filteredMovies = allMovies.filter(movie => 
                movie.Genre && movie.Genre.toLowerCase().includes(selectedGenre.toLowerCase())
            );
        }
        // Sort alphabetically by title for genre filtering
        filteredMovies.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    } else if (sortField === 'language') {
        const selectedLanguage = languageFilter.value;
        if (selectedLanguage) {
            filteredMovies = allMovies.filter(movie => 
                movie.Language && movie.Language.toLowerCase().includes(selectedLanguage.toLowerCase())
            );
        }
        // Sort alphabetically by title for language filtering
        filteredMovies.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    } else {
        // For other fields, use ascending/descending order
        const order = sortOrder.value;
        
        filteredMovies.sort((a, b) => {
            let aVal, bVal;

            switch (sortField) {
                case 'title':
                    aVal = (a.Title || '').toLowerCase();
                    bVal = (b.Title || '').toLowerCase();
                    break;
                case 'year':
                    aVal = parseInt(a.Year) || 0;
                    bVal = parseInt(b.Year) || 0;
                    break;
                case 'boxoffice':
                    aVal = parseBoxOffice(a.BoxOffice);
                    bVal = parseBoxOffice(b.BoxOffice);
                    break;
                case 'rating':
                    aVal = parseFloat(a.imdbRating) || 0;
                    bVal = parseFloat(b.imdbRating) || 0;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string') {
                return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return order === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });
    }

    displayMovies(filteredMovies);
}

function parseBoxOffice(boxOffice) {
    if (!boxOffice || boxOffice === 'N/A') return 0;
    // Remove currency symbols and commas, then parse
    const cleaned = boxOffice.replace(/[\$,]/g, '');
    return parseFloat(cleaned) || 0;
}

async function fetchMovieDetails(id) {
    showLoading(true, '🎬 Loading detailed movie information...');
    try {
        let response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
        let movie = await response.json();
        
        if (movie.Response !== "True") {
            const backupKeys = ['2f6435d9', 'trilogy', '8691812a', 'b9bd27d6'];
            for (let key of backupKeys) {
                try {
                    response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${key}`);
                    movie = await response.json();
                    if (movie.Response === "True") break;
                } catch {}
            }
        }
        
        showLoading(false);
        if (movie.Response === "True") {
            displayMovieDetails(movie);
        } else {
            showError('🚫 Could not load movie details. Please try again!');
        }
    } catch (error) {
        showLoading(false);
        showError('🌐 Error loading movie details. Check your connection!');
        console.error(error);
    }
}

function displayMovieDetails(movie) {
    let detailsContent = movieDetailsDiv.querySelector('.movie-details-content');
    if (!detailsContent) {
        detailsContent = document.createElement('div');
        detailsContent.className = 'movie-details-content';
        movieDetailsDiv.appendChild(detailsContent);
    }

    const boxOfficeHTML = movie.BoxOffice && movie.BoxOffice !== 'N/A' 
        ? `<p><strong>💰 Box Office:</strong> ${movie.BoxOffice}</p>` 
        : '<p><strong>📊 Box Office:</strong> Not Available</p>';

    detailsContent.innerHTML = `
        <div class="details-header">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/240x360/ff6b6b/ffffff?text=🎬+No+Image'}" class="poster-large">
            <div class="info">
                <h2>🎬 ${movie.Title} (${movie.Year})</h2>
                <p><strong>🎭 Genre:</strong> ${movie.Genre || 'N/A'}</p>
                <p><strong>🎬 Director:</strong> ${movie.Director || 'N/A'}</p>
                <p><strong>✍️ Writer:</strong> ${movie.Writer || 'N/A'}</p>
                <p><strong>🎭 Actors:</strong> ${movie.Actors || 'N/A'}</p>
                <p><strong>⏱️ Runtime:</strong> ${movie.Runtime || 'N/A'}</p>
                <p><strong>⭐ IMDb Rating:</strong> ${movie.imdbRating || 'N/A'}/10</p>
                <p><strong>🌍 Language:</strong> ${movie.Language || 'N/A'}</p>
                <p><strong>🌎 Country:</strong> ${movie.Country || 'N/A'}</p>
                <p><strong>🏆 Awards:</strong> ${movie.Awards || 'N/A'}</p>
                ${boxOfficeHTML}
                ${movie.Production && movie.Production !== 'N/A' ? `<p><strong>🏭 Production:</strong> ${movie.Production}</p>` : ''}
                ${movie.Released && movie.Released !== 'N/A' ? `<p><strong>📅 Released:</strong> ${movie.Released}</p>` : ''}
                ${movie.Rated && movie.Rated !== 'N/A' ? `<p><strong>🎫 Rated:</strong> ${movie.Rated}</p>` : ''}
                ${movie.Metascore && movie.Metascore !== 'N/A' ? `<p><strong>📊 Metascore:</strong> ${movie.Metascore}/100</p>` : ''}
            </div>
        </div>
        <div class="plot-section">
            <h3>📖 Plot Synopsis</h3>
            <p>${movie.Plot || 'No plot information available.'}</p>
        </div>
    `;
    
    movieDetailsDiv.style.display = 'block';
    showBackButton();
    movieDetailsDiv.scrollIntoView({ behavior: 'smooth' });
}

function toggleFavorite(imdbID, title, year, poster) {
    const index = favorites.findIndex(f => f.imdbID === imdbID);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ imdbID, title, year, poster });
    }
    
    // Save to localStorage if available
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('movieFavorites', JSON.stringify(favorites));
        }
    } catch (e) {
        console.log('Could not save to localStorage');
    }
    
    const btn = document.querySelector(`[onclick*="${imdbID}"]`);
    if (btn) {
        const isFavorited = favorites.some(f => f.imdbID === imdbID);
        btn.innerHTML = isFavorited ? '❤️' : '🤍';
        btn.classList.toggle('favorited', isFavorited);
        
        // Add celebratory animation for adding to favorites
        if (isFavorited) {
            btn.style.animation = 'favoriteGlow 0.8s ease-in-out';
            setTimeout(() => {
                btn.style.animation = '';
            }, 800);
        }
    }
}

function showFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div style="
                text-align: center; 
                color: #666; 
                padding: 60px 20px;
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
                border-radius: 20px;
                border: 3px dashed rgba(255, 107, 107, 0.3);
                grid-column: 1 / -1;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">💔</div>
                <h3 style="
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 1.5em;
                    margin-bottom: 15px;
                    font-weight: 700;
                ">No Favorite Movies Yet!</h3>
                <p style="font-size: 1.1em; line-height: 1.6;">
                    Start building your collection by clicking the heart icon (🤍) on movies you love!<br>
                    Your favorites will appear here for easy access.
                </p>
            </div>
        `;
    } else {
        favoritesList.innerHTML = '';
        
        // Add favorites header
        const favoritesHeader = document.createElement('div');
        favoritesHeader.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255, 159, 243, 0.1), rgba(84, 160, 255, 0.1));
            border-radius: 20px;
            border: 2px solid rgba(255, 159, 243, 0.2);
            backdrop-filter: blur(10px);
        `;
        favoritesHeader.innerHTML = `
            <h3 style="
                background: linear-gradient(45deg, #ff9ff3, #54a0ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 1.5em;
                margin-bottom: 10px;
                font-weight: 700;
            ">💖 Your ${favorites.length} Favorite Movie${favorites.length !== 1 ? 's' : ''}!</h3>
            <p style="color: #666; font-size: 1.1em;">Click on any movie to view details</p>
        `;
        favoritesList.appendChild(favoritesHeader);
        
        favorites.forEach((movie, index) => {
            const item = document.createElement('div');
            item.classList.add('movie-item');
            
            // Add staggered animation
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'fadeInUp 0.6s ease forwards';
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            item.innerHTML = `
                <button class="favorite-btn favorited"
                    onclick="toggleFavorite('${movie.imdbID}', '${movie.title.replace(/'/g, "\\'")}', '${movie.year}', '${movie.poster}'); updateFavoritesDisplay();">
                    ❤️
                </button>
                <img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/250x300/ff9ff3/ffffff?text=🎬+No+Image'}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p><strong>📅 Year:</strong> ${movie.year}</p>
                <div style="
                    margin-top: 15px;
                    padding: 8px 15px;
                    background: linear-gradient(45deg, #ff9ff3, #54a0ff);
                    color: white;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: bold;
                    text-align: center;
                ">💖 Favorite</div>
            `;
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('favorite-btn')) {
                    favoritesModal.style.display = 'none';
                    fetchMovieDetails(movie.imdbID);
                }
            });
            favoritesList.appendChild(item);
        });
    }
    favoritesModal.style.display = 'block';
}

function updateFavoritesDisplay() {
    showFavorites();
}

function updatePagination() {
    const maxPages = Math.ceil(totalResults / 10);
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === maxPages;
    pageInfo.textContent = `Page ${currentPage} of ${maxPages}`;
    paginationDiv.style.display = maxPages > 1 ? 'flex' : 'none';
}

function hidePagination() {
    paginationDiv.style.display = 'none';
}

function showLoading(show, text = '🎬 Loading...') {
    loadingDiv.style.display = show ? 'block' : 'none';
    loadingText.textContent = text;
    searchButton.disabled = show;
    if (show) {
        resultsDiv.innerHTML = '';
        hidePagination();
    }
}

function showError(msg) {
    resultsDiv.innerHTML = `<div class="error-message">❌ ${msg}</div>`;
    hidePagination();
}

function showNoResults(msg) {
    resultsDiv.innerHTML = `<div class="no-results">${msg}</div>`;
    hidePagination();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC key to go back or close modals
    if (e.key === 'Escape') {
        if (favoritesModal.style.display === 'block') {
            favoritesModal.style.display = 'none';
        } else if (isDetailsView) {
            backToMainScreen();
        }
    }
    
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // Enter in search to search
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        handleSearch();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
    sortControls.style.display = 'flex';
    
    // Add welcome message with colorful styling
    resultsDiv.innerHTML = `
        <div class="no-results" style="
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1), rgba(69, 183, 209, 0.1));
            border: 3px solid transparent;
            background-clip: padding-box;
            position: relative;
            overflow: hidden;
        ">
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
                background-size: 300% 300%;
                opacity: 0.1;
                animation: gradientShift 8s ease infinite;
                z-index: -1;
            "></div>
            <div style="font-size: 3em; margin-bottom: 20px;">🎬✨</div>
            <h3 style="
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 2em;
                margin-bottom: 20px;
                font-weight: 800;
            ">Welcome to Enhanced Movie Search!</h3>
            
            <div style="
                background: rgba(255, 255, 255, 0.7);
                padding: 25px;
                border-radius: 15px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 107, 107, 0.2);
            ">
                <p style="font-size: 1.2em; margin-bottom: 15px; color: #444;">
                    🔍 Search for movies by title and explore detailed information including box office collections!
                </p>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 25px;
                ">
                    <div style="
                        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05));
                        padding: 20px;
                        border-radius: 12px;
                        border: 2px solid rgba(255, 107, 107, 0.2);
                    ">
                        <h4 style="color: #ff6b6b; margin-bottom: 10px; font-size: 1.2em;">🔀 Sorting Options:</h4>
                        <ul style="text-align: left; color: #555; line-height: 1.6;">
                            <li>📝 Title, 📅 Year, ⭐ Rating: Ascending/Descending</li>
                            <li>💰 Box Office: High to Low earnings</li>
                            <li>🎭 Genre: Filter by specific genres</li>
                            <li>🌍 Language: Filter by languages</li>
                        </ul>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
                        padding: 20px;
                        border-radius: 12px;
                        border: 2px solid rgba(78, 205, 196, 0.2);
                    ">
                        <h4 style="color: #4ecdc4; margin-bottom: 10px; font-size: 1.2em;">💡 Pro Tips:</h4>
                        <ul style="text-align: left; color: #555; line-height: 1.6;">
                            <li>💖 Click hearts to save favorites</li>
                            <li>🎬 Click movies for detailed info</li>
                            <li>⌨️ Use Ctrl+F to focus search</li>
                            <li>⌨️ Press ESC to go back</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div style="
                margin-top: 30px;
                padding: 20px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border-radius: 15px;
                font-weight: 600;
                font-size: 1.1em;
            ">
                🚀 Start by entering a movie title above and clicking Search!
            </div>
        </div>
    `;
    
    // Add some interactive hover effects to the welcome message
    const welcomeDiv = resultsDiv.querySelector('.no-results');
    if (welcomeDiv) {
        welcomeDiv.addEventListener('mouseenter', () => {
            welcomeDiv.style.transform = 'scale(1.02)';
            welcomeDiv.style.transition = 'transform 0.3s ease';
        });
        
        welcomeDiv.addEventListener('mouseleave', () => {
            welcomeDiv.style.transform = 'scale(1)';
        });
    }
});