const API_KEY = '37ad38d2450d470c9da53512d65687e0';
const API_BASE_URL = 'https://newsapi.org/v2';
const newsContainer = document.getElementById('newsContainer');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const loadMoreButton = document.createElement('button');
let currentPage = 1;
let currentQuery = '';
let isLoading = false;

// Initialize Load More button
loadMoreButton.textContent = 'Load More';
loadMoreButton.style.display = 'none';
loadMoreButton.addEventListener('click', () => fetchNews(currentQuery, currentPage + 1));
newsContainer.after(loadMoreButton);

// Fetch news articles
async function fetchNews(query = '', page = 1) {
    if (isLoading) return;
    isLoading = true;

    if (page === 1) {
        newsContainer.innerHTML = '<p>Loading news...</p>';
    }

    const endpoint = query ? 'everything' : 'top-headlines';
    const url = `${API_BASE_URL}/${endpoint}?country=us&page=${page}&q=${query}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || 'Unknown API Error');
        }

        if (data.articles.length === 0 && page === 1) {
            newsContainer.innerHTML = '<p>No news found.</p>';
            loadMoreButton.style.display = 'none';
        } else {
            if (page === 1) {
                newsContainer.innerHTML = '';
            }

            newsContainer.innerHTML += data.articles.map(createArticleHTML).join('');
            loadMoreButton.style.display = data.articles.length > 0 ? 'block' : 'none';
        }

        currentPage = page;
        currentQuery = query;
    } catch (error) {
        newsContainer.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        console.error('Error fetching news:', error);
    } finally {
        isLoading = false;
    }
}

// Generate HTML for each article
function createArticleHTML(article) {
    const defaultImage = 'https://via.placeholder.com/150';
    return `
        <article class="news-article">
            <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
            <img src="${article.urlToImage || defaultImage}" alt="${article.title}" class="article-image">
            <p>${article.description || 'No description available.'}</p>
            <p><small>Source: ${article.source.name || 'Unknown'}</small></p>
        </article>
    `;
}

// Handle search form submission
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    currentQuery = query;
    currentPage = 1;
    fetchNews(query);
});

// Initial fetch
fetchNews();
