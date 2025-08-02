// Futuristic Movie Search App JavaScript
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

// Enhanced loading messages
const loadingMessages = [
    'Scanning quantum database...',
    'Analyzing cinematic data streams...',
    'Processing movie neural networks...',
    'Decrypting film archives...',
    'Synchronizing with movie matrix...',
    'Loading holographic movie data...',
    'Calibrating entertainment algorithms...',
    'Accessing film dimension...'
];

// Initialize favorites from localStorage if available
try {
    if (typeof localStorage !== 'undefined') {
        favorites = JSON.parse(localStorage.getItem('cinevault_favorites')) || [];
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
    closeFavoritesModal();
});

closeMovieDetails.addEventListener('click', () => {
    backToMainScreen();
});

backBtn.addEventListener('click', () => {
    backToMainScreen();
});

// Modal backdrop click handlers
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        if (favoritesModal.style.display === 'block') {
            closeFavoritesModal();
        }
        if (movieDetailsDiv.style.display === 'block') {
            backToMainScreen();
        }
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
    
    // Add smooth scroll animation
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Re-focus search input with a subtle glow effect
    setTimeout(() => {
        searchInput.focus();
        searchInput.style.boxShadow = '0 0 25px rgba(0, 245, 255, 0.5)';
        setTimeout(() => {
            searchInput.style.boxShadow = '';
        }, 1000);
    }, 300);
}

function closeFavoritesModal() {
    favoritesModal.style.display = 'none';
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
        showError('🎬 Please enter a movie title to begin scanning the database!');
        return;
    }
    currentQuery = searchTerm;
    currentPage = 1;
    searchMovies(searchTerm, 1);
}

async function searchMovies(query, page = 1) {
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    showLoading(true, randomMessage);
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
            const detailedMovies = await fetchDetailedMovies(data.Search);
            allMovies = detailedMovies;
            displayMovies(detailedMovies);
            updatePagination();
            sortControls.style.display = 'flex';
        } else if (data.Error && data.Error.includes('Invalid API key')) {
            showError('🔑 API authentication failed. Trying backup protocols...');
            tryBackupAPIKey(query, page);
        } else {
            showNoResults(`🔍 ${data.Error || 'No movies found in the database. Try a different search term!'}`);
            hidePagination();
            sortControls.style.display = 'none';
        }
    } catch (error) {
        showLoading(false);
        console.error(error);
        showError('🌐 Connection to movie database failed. Please check your network and try again!');
        hidePagination();
        sortControls.style.display = 'none';
    }
}

async function fetchDetailedMovies(movies) {
    const detailedMovies = [];
    showLoading(true, 'Analyzing movie data matrices...');
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
            const detailed = await response.json();
            if (detailed.Response === "True") {
                detailedMovies.push(detailed);
            } else {
                detailedMovies.push({
                    ...movie,
                    BoxOffice: 'N/A',
                    Genre: movie.Genre || 'N/A',
                    Language: movie.Language || 'N/A',
                    imdbRating: 'N/A'
                });
            }
        } catch {
            detailedMovies.push({
                ...movie,
                BoxOffice: 'N/A',
                Genre: movie.Genre || 'N/A',
                Language: movie.Language || 'N/A',
                imdbRating: 'N/A'
            });
        }
        
        // Update loading progress with futuristic messages
        const progressMessages = [
            'Decoding movie metadata...',
            'Processing cinematic algorithms...',
            'Syncing with entertainment networks...',
            'Calibrating film databases...',
            'Finalizing movie compilation...'
        ];
        const messageIndex = Math.floor((i / movies.length) * progressMessages.length);
        loadingText.textContent = `${progressMessages[messageIndex]} ${i + 1}/${movies.length}`;
    }
    
    showLoading(false);
    return detailedMovies;
}

async function tryBackupAPIKey(query, page = 1) {
    const backupKeys = ['2f6435d9', 'trilogy', '8691812a', 'b9bd27d6'];
    showLoading(true, 'Accessing backup data streams...');
    
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
    showError('🚫 All database connections are currently offline. Please try again later!');
}

function displayMovies(movies) {
    resultsDiv.innerHTML = '';
    
    // Add enhanced results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'results-header';
    resultsHeader.innerHTML = `
        <h3>🎬 ${movies.length} Movies Found</h3>
        <p>Click any movie card to access detailed information</p>
    `;
    resultsDiv.appendChild(resultsHeader);
    
    movies.forEach((movie, index) => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        const isFavorited = favorites.some(fav => fav.imdbID === movie.imdbID);
        
        // Enhanced box office display
        let boxOfficeHTML = '';
        if (movie.BoxOffice && movie.BoxOffice !== 'N/A') {
            boxOfficeHTML = `<div class="box-office">💰 ${movie.BoxOffice}</div>`;
        } else {
            boxOfficeHTML = `<div class="box-office not-available">📊 Box Office: N/A</div>`;
        }
        
        // Add staggered entrance animation
        movieItem.style.animationDelay = `${index * 0.1}s`;
        movieItem.style.animation = 'fadeInUp 0.6s ease forwards';
        movieItem.style.opacity = '0';
        movieItem.style.transform = 'translateY(30px)';
        
        movieItem.innerHTML = `
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}"
                onclick="toggleFavorite('${movie.imdbID}', '${(movie.Title || '').replace(/'/g, "\\'")}', '${movie.Year}', '${movie.Poster}')">
                ${isFavorited ? '💎' : '🤍'}
            </button>
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/320x480/1a1a2e/00f5ff?text=🎬+No+Image'}" alt="${movie.Title}" loading="lazy">
            <h3>${movie.Title}</h3>
            <p><strong>📅 Year:</strong> ${movie.Year}</p>
            <p><strong>🎭 Type:</strong> ${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</p>
            ${movie.Genre && movie.Genre !== 'N/A' ? `<p><strong>🎪 Genre:</strong> ${movie.Genre}</p>` : ''}
            ${movie.Language && movie.Language !== 'N/A' ? `<p><strong>🌍 Language:</strong> ${movie.Language}</p>` : ''}
            ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `<p><strong>⭐ Rating:</strong> ${movie.imdbRating}/10</p>` : ''}
            ${boxOfficeHTML}
        `;
        
        // Enhanced click handler with haptic feedback simulation
        movieItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn')) {
                // Add click effect
                movieItem.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    movieItem.style.transform = '';
                }, 150);
                fetchMovieDetails(movie.imdbID);
            }
        });
        
        resultsDiv.appendChild(movieItem);
    });
    
    // Add CSS for enhanced animations if not already present
    if (!document.querySelector('#enhancedAnimations')) {
        const style = document.createElement('style');
        style.id = 'enhancedAnimations';
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
        filteredMovies.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    } else if (sortField === 'language') {
        const selectedLanguage = languageFilter.value;
        if (selectedLanguage) {
            filteredMovies = allMovies.filter(movie => 
                movie.Language && movie.Language.toLowerCase().includes(selectedLanguage.toLowerCase())
            );
        }
        filteredMovies.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    } else {
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
    const cleaned = boxOffice.replace(/[\$,]/g, '');
    return parseFloat(cleaned) || 0;
}

async function fetchMovieDetails(id) {
    showLoading(true, 'Loading comprehensive movie analysis...');
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
            showError('🚫 Could not access movie details. Database may be temporarily unavailable!');
        }
    } catch (error) {
        showLoading(false);
        showError('🌐 Error connecting to movie database. Check your network connection!');
        console.error(error);
    }
}

function displayMovieDetails(movie) {
    let detailsContent = movieDetailsDiv.querySelector('.movie-details-content');
    if (!detailsContent) {
        detailsContent = document.createElement('div');
        detailsContent.className = 'movie-details-content';
        movieDetailsDiv.querySelector('.modal-content').appendChild(detailsContent);
    }

    const boxOfficeHTML = movie.BoxOffice && movie.BoxOffice !== 'N/A' 
        ? `<p><strong>💰 Box Office:</strong> ${movie.BoxOffice}</p>` 
        : '<p><strong>📊 Box Office:</strong> Data Not Available</p>';

    detailsContent.innerHTML = `
        <div class="details-header">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/280x420/1a1a2e/00f5ff?text=🎬+No+Image'}" class="poster-large" loading="lazy">
            <div class="info">
                <h2>🎬 ${movie.Title} (${movie.Year})</h2>
                <p><strong>🎭 Genre:</strong> ${movie.Genre || 'N/A'}</p>
                <p><strong>🎬 Director:</strong> ${movie.Director || 'N/A'}</p>
                <p><strong>✍️ Writer:</strong> ${movie.Writer || 'N/A'}</p>
                <p><strong>🎭 Cast:</strong> ${movie.Actors || 'N/A'}</p>
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
            <p>${movie.Plot || 'No plot information available in the database.'}</p>
        </div>
    `;
    
    movieDetailsDiv.style.display = 'block';
    showBackButton();
    
    // Smooth scroll to modal with enhanced animation
    setTimeout(() => {
        movieDetailsDiv.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function toggleFavorite(imdbID, title, year, poster) {
    const index = favorites.findIndex(f => f.imdbID === imdbID);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ imdbID, title, year, poster });
    }
    
    // Save to localStorage with enhanced key
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('cinevault_favorites', JSON.stringify(favorites));
        }
    } catch (e) {
        console.log('Could not save to localStorage');
    }
    
    const btn = document.querySelector(`[onclick*="${imdbID}"]`);
    if (btn) {
        const isFavorited = favorites.some(f => f.imdbID === imdbID);
        btn.innerHTML = isFavorited ? '💎' : '🤍';
        btn.classList.toggle('favorited', isFavorited);
        
        // Enhanced favorite animation
        if (isFavorited) {
            btn.style.animation = 'favoriteGlow 0.8s ease-in-out';
            // Add particle effect simulation
            createParticleEffect(btn);
            setTimeout(() => {
                btn.style.animation = '';
            }, 800);
        }
    }
}

function createParticleEffect(element) {
    // Simple particle effect simulation
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            top: ${rect.top + rect.height/2}px;
            left: ${rect.left + rect.width/2}px;
            width: 4px;
            height: 4px;
            background: var(--secondary-glow);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = (Math.PI * 2 * i) / 5;
        const distance = 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}

function showFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div style="
                text-align: center; 
                color: var(--text-secondary); 
                padding: 80px 20px;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 2px dashed var(--border-glow);
                border-radius: 20px;
                grid-column: 1 / -1;
            ">
                <div style="font-size: 4em; margin-bottom: 30px;">💔</div>
                <h3 style="
                    background: linear-gradient(45deg, var(--secondary-glow), var(--accent-glow));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 1.8em;
                    margin-bottom: 20px;
                    font-weight: 700;
                ">Your Collection is Empty</h3>
                <p style="font-size: 1.2em; line-height: 1.6; color: var(--text-secondary);">
                    Start building your personal movie vault by clicking the heart icon (🤍) on movies you love!<br>
                    Your favorites will be stored here for quick access.
                </p>
            </div>
        `;
    } else {
        favoritesList.innerHTML = '';
        
        // Enhanced favorites header
        const favoritesHeader = document.createElement('div');
        favoritesHeader.className = 'results-header';
        favoritesHeader.innerHTML = `
            <h3>💎 Your Collection (${favorites.length} Movie${favorites.length !== 1 ? 's' : ''})</h3>
            <p>Your personally curated movie collection</p>
        `;
        favoritesList.appendChild(favoritesHeader);
        
        favorites.forEach((movie, index) => {
            const item = document.createElement('div');
            item.classList.add('movie-item');
            
            // Staggered animation
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'fadeInUp 0.6s ease forwards';
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            item.innerHTML = `
                <button class="favorite-btn favorited"
                    onclick="toggleFavorite('${movie.imdbID}', '${movie.title.replace(/'/g, "\\'")}', '${movie.year}', '${movie.poster}'); updateFavoritesDisplay();">
                    💎
                </button>
                <img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/280x350/1a1a2e/ff006e?text=🎬+No+Image'}" alt="${movie.title}" loading="lazy">
                <h3>${movie.title}</h3>
                <p><strong>📅 Year:</strong> ${movie.year}</p>
                <div style="
                    margin-top: 20px;
                    padding: 12px 20px;
                    background: linear-gradient(45deg, var(--secondary-glow), var(--accent-glow));
                    color: var(--text-primary);
                    border-radius: 15px;
                    font-size: 0.9em;
                    font-weight: bold;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(255, 0, 110, 0.3);
                ">💎 In Collection</div>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('favorite-btn')) {
                    closeFavoritesModal();
                    setTimeout(() => {
                        fetchMovieDetails(movie.imdbID);
                    }, 300);
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

function showLoading(show, text = 'Processing...') {
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

// Enhanced keyboard shortcuts with futuristic feel
document.addEventListener('keydown', (e) => {
    // ESC key functionality
    if (e.key === 'Escape') {
        if (favoritesModal.style.display === 'block') {
            closeFavoritesModal();
        } else if (isDetailsView) {
            backToMainScreen();
        }
    }
    
    // Ctrl/Cmd + F to focus search with glow effect
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
        // Add focus glow effect
        searchInput.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.6)';
        setTimeout(() => {
            searchInput.style.boxShadow = '';
        }, 1500);
    }
    
    // Ctrl/Cmd + L to show favorites
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        showFavorites();
    }
    
    // Enter in search
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        handleSearch();
    }
});

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    // Focus search input with subtle animation
    setTimeout(() => {
        searchInput.focus();
        searchInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            searchInput.style.transform = '';
        }, 300);
    }, 500);
    
    sortControls.style.display = 'flex';
    
    // Add welcome animation to the search bar
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.opacity = '0';
    searchBar.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        searchBar.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        searchBar.style.opacity = '1';
        searchBar.style.transform = 'translateY(0)';
    }, 200);
    
    // Add interactive hover effects to controls
    const controls = document.querySelectorAll('.futuristic-select, .search-btn, .favorites-btn');
    controls.forEach(control => {
        control.addEventListener('mouseenter', () => {
            control.style.transform = 'translateY(-2px)';
        });
        
        control.addEventListener('mouseleave', () => {
            control.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to subtitle
    const subtitle = document.querySelector('.subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    let i = 0;
    
    const typeEffect = setInterval(() => {
        if (i < originalText.length) {
            subtitle.textContent += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typeEffect);
        }
    }, 100);
});

// Add smooth scroll behavior for better UX
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.floating-orb');
    
    orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Enhanced error handling with retry functionality
window.addEventListener('online', () => {
    if (currentQuery && allMovies.length === 0) {
        const retryMessage = document.createElement('div');
        retryMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, var(--success-glow), var(--warning-glow));
            color: var(--primary-bg);
            padding: 15px 25px;
            border-radius: 15px;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.5s ease;
        `;
        retryMessage.textContent = '🌐 Connection restored! Click to retry search.';
        
        retryMessage.addEventListener('click', () => {
            retryMessage.remove();
            handleSearch();
        });
        
        document.body.appendChild(retryMessage);
        
        setTimeout(() => {
            if (retryMessage.parentNode) {
                retryMessage.remove();
            }
        }, 5000);
    }
});

// Add slide in animation
if (!document.querySelector('#slideInRight')) {
    const style = document.createElement('style');
    style.id = 'slideInRight';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}