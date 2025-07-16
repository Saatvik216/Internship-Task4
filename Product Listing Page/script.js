document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');
    const maxPriceDisplay = document.getElementById('max-price-display');
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    // State
    let products = [];
    let categories = [];
    let currentSort = 'rating';
    let currentCategory = 'all';
    let currentMaxPrice = 1000;
    
    // Initialize the app
    init();
    
    function init() {
        // Fetch products from API
        fetchProducts();
        
        // Event listeners
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            renderProducts();
        });
        
        priceRange.addEventListener('input', function() {
            currentMaxPrice = parseInt(this.value);
            maxPriceDisplay.textContent = `$${currentMaxPrice}`;
            renderProducts();
        });
        
        sortButtons.forEach(button => {
            button.addEventListener('click', function() {
                sortButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentSort = this.dataset.sort;
                renderProducts();
            });
        });
    }
    
    // Fetch products from FakeStoreAPI
    async function fetchProducts() {
        try {
            // Show loading state
            productGrid.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading products...</p>
                </div>
            `;
            
            // Fetch all products
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
            
            // Get unique categories
            categories = [...new Set(products.map(product => product.category))];
            
            // Populate category filter
            populateCategoryFilter();
            
            // Render products
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = `
                <div class="error-message">
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        }
    }
    
    // Populate category dropdown
    function populateCategoryFilter() {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = formatCategoryName(category);
            categoryFilter.appendChild(option);
        });
    }
    
    // Format category name for display
    function formatCategoryName(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Render products based on current filters and sort
    function renderProducts() {
        // Filter products
        let filteredProducts = products.filter(product => {
            const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
            const matchesPrice = product.price <= currentMaxPrice;
            return matchesCategory && matchesPrice;
        });
        
        // Sort products
        filteredProducts = sortProducts(filteredProducts, currentSort);
        
        // Display products
        displayProducts(filteredProducts);
    }
    
    // Sort products based on selected criteria
    function sortProducts(products, sortBy) {
        switch(sortBy) {
            case 'rating':
                return [...products].sort((a, b) => b.rating.rate - a.rating.rate);
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            case 'name':
                return [...products].sort((a, b) => a.title.localeCompare(b.title));
            default:
                return products;
        }
    }
    
    // Display products in the grid
    function displayProducts(products) {
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-results">
                    <p>No products match your filters. Try adjusting your criteria.</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <span class="product-category">${formatCategoryName(product.category)}</span>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        <div class="stars">
                            ${renderStars(product.rating.rate)}
                        </div>
                        <span>${product.rating.rate} (${product.rating.count})</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Render star rating
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }
});