document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    // Cart functionality
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    let cart = [];
    

    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        updateCart();
    }
    

    cartBtn.addEventListener('click', function() {
        cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
    
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('open');
        document.body.style.overflow = '';
    });
    
    // Add to cart
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            // Check if item already in cart
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id,
                    name,
                    price,
                    quantity: 1
                });
            }
            
            updateCart();
            showAddedToCart(name);
        });
    });
    
    // Update cart UI
    function updateCart() {
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart items
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
        } else {
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price} ₽ x ${item.quantity}</div>
                    </div>
                    <div class="cart-item-total">${item.price * item.quantity} ₽</div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                
                // Add event listener to remove button
                const removeButton = cartItemElement.querySelector('.cart-item-remove');
                removeButton.addEventListener('click', function() {
                    removeFromCart(item.id);
                });
            });
        }
        
        // Update total and count
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartTotal.textContent = total;
        cartCount.textContent = count;
    }
    
    // Remove from cart
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }
    
    // Show "added to cart" notification
    function showAddedToCart(name) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${name} добавлен в корзину</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Hero slider
    const heroSlider = document.getElementById('heroSlider');
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');
    const sliderDots = document.getElementById('sliderDots');
    const slides = document.querySelectorAll('.hero-slide');
    
    let currentSlide = 0;
    
    slides[0].classList.add('active');
    // Create dots
    slides.forEach((slide, index) => {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        sliderDots.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.slider-dot');
    
    // Next slide
    sliderNext.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    });
    
    // Previous slide
    sliderPrev.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
    });
    
    // Go to specific slide
    function goToSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }
    
    // Auto slide
    let slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }, 5000);
    
    // Pause on hover
    heroSlider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    heroSlider.addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        }, 5000);
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            }
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Here you would typically send the form data to the server
            // For this example, we'll just show a success message
            alert('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }
    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Ваша корзина пуста');
                return;
            }
            
            // Here you would typically proceed to checkout
            alert('Переход к оформлению заказа');
        });
    }
    
    // Debug: Check if hero buttons are working
    const heroButtons = document.querySelectorAll('.hero .btn');
    heroButtons.forEach(button => {
        console.log('Hero button found:', button.href);
        button.addEventListener('click', function(e) {
            console.log('Hero button clicked, href:', this.href);
        });
    });
});