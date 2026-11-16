// Fonction pour gérer les erreurs d'authentification globalement
function handleAuthError(response) {
    if (response.status === 401 || response.redirected && response.url.includes('/users/login')) {
        alert('Votre session a expiré. Vous allez être redirigé vers la page de connexion.');
        window.location.href = '/users/login';
        return true;
    }
    return false;
}

// Fonction pour ajouter un plat au panier via AJAX
window.addToCart = async function(platId) {
    console.log('addToCart appelée avec platId:', platId); // Debug
    try {
        const response = await fetch(`/plats/add-to-cart/${platId}`, {
            method: 'POST'
        });

        // Vérifier si c'est une erreur d'authentification
        if (handleAuthError(response)) {
            return;
        }

        if (response.ok) {
            // Effet visuel sur le bouton "Ajouter au panier" spécifiquement
            let button = null;
            
            // Vérifier d'abord si le drawer est ouvert
            const drawer = document.getElementById('readProductDrawer');
            const isDrawerOpen = drawer && !drawer.classList.contains('-translate-x-full');
            
            if (isDrawerOpen) {
                // Si le drawer est ouvert, prioriser le bouton du drawer
                const drawerBtn = document.getElementById('drawer-add-to-cart-btn');
                if (drawerBtn && drawerBtn.getAttribute('data-plat-id') === platId) {
                    button = drawerBtn;
                }
            }
            
            // Si pas trouvé dans le drawer ou drawer fermé, chercher dans les cartes
            if (!button) {
                button = document.querySelector(`button[data-plat-id="${platId}"]:not(.view-details-btn):not(#drawer-add-to-cart-btn)`);
            }
            
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '✓ Ajouté !';
                button.style.backgroundColor = '#4CAF50';
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                    button.disabled = false;
                }, 1000);
            }

            // Rafraîchir le contenu du panier dans l'interface
            await updateCartDisplay();
            
            // Ouvrir automatiquement le dropdown du panier
            openCartDropdown();
            
        } else {
            console.error('Erreur de réponse:', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
    }
}

// Fonction pour mettre à jour l'affichage du panier
async function updateCartDisplay() {
    try {
        // Récupérer le contenu mis à jour du panier
        const response = await fetch('/api/cart');
        
        // Vérifier si c'est une erreur d'authentification
        if (handleAuthError(response)) {
            return;
        }
        
        if (response.ok) {
            const cartData = await response.json();
            
            // Mettre à jour le dropdown du panier
            const cartDropdown = document.getElementById('myCartDropdown1');
            if (cartDropdown) {
                cartDropdown.innerHTML = generateCartHTML(cartData.cart, cartData.total);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du panier:', error);
    }
}

// Fonction pour générer le HTML du panier
function generateCartHTML(cart, total) {
    if (!cart || cart.length === 0) {
        return `
            <p>Votre panier est vide.</p>
            <div style="display: flex; gap: 5px; margin-top: 10px;">
                <a href="/plats" class="btn-hover-effect font-medium bg-blue-700 hover:bg-blue-800 dark:bg-blue-400 dark:hover:bg-blue-500 rounded-lg px-4 py-2 text-white">Voir nos plats</a>
                <a href="/boutique" class="btn-hover-effect font-medium bg-purple-700 hover:bg-purple-800 dark:bg-purple-400 dark:hover:bg-purple-500 rounded-lg px-4 py-2 text-white">Voir nos articles</a>
            </div>
        `;
    }

    let html = '';
    cart.forEach(item => {
        // Déterminer si c'est un plat ou un article
        const isPlat = item.plat !== undefined;
        const isArticle = item.article !== undefined;
        const currentItem = isPlat ? item.plat : item.article;
        const itemType = isPlat ? 'plat' : 'article';
        
        const sousTotal = (currentItem.price * item.quantity).toFixed(2);
        html += `
            <div style="border: 1px solid #ccc; margin: 5px; padding: 5px; border-radius: 5px;">
                <h3><b>${currentItem.name.length > 15 ? currentItem.name.substring(0, 15) + '...' : currentItem.name}</b></h3>
                <p><b>Prix unitaire:</b> ${currentItem.price} €</p>
                <p><b>Quantité:</b> ${item.quantity}</p>
                <p><b>Sous-total:</b> ${sousTotal} €</p>
                 <button onclick="removeFromCart('${currentItem._id}', '${itemType}')" type="button" title="Supprimer" class="btn-hover-effect cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-700 border border-transparent rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
            </div>
        `;
    });

    html += `
        <div style="margin-top: 5px; padding: 5px; background-color: #f8f9fa; border-radius: 5px;">
            <h2><b>Total du panier: ${(total || 0).toFixed(2)} €</b></h2>
        </div>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
            <a href="/panier" class="btn-hover-effect text-center text-sm font-medium bg-gray-700 hover:bg-gray-800 dark:bg-gray-400 dark:hover:bg-gray-500 rounded-lg px-3 py-1 text-white">Voir mon panier</a>
            <div style="display: flex; gap: 5px;">
                <a href="/plats" class="btn-hover-effect text-center text-sm font-medium bg-blue-700 hover:bg-blue-800 dark:bg-blue-400 dark:hover:bg-blue-500 rounded-lg px-3 py-1 text-white">Nos plats</a>
                <a href="/boutique" class="btn-hover-effect text-center text-sm font-medium bg-purple-700 hover:bg-purple-800 dark:bg-purple-400 dark:hover:bg-purple-500 rounded-lg px-3 py-1 text-white">Nos articles</a>
            </div>
            <a href="/commande" class="btn-hover-effect text-center text-sm font-medium bg-green-700 hover:bg-green-800 dark:bg-green-400 dark:hover:bg-green-500 rounded-lg px-3 py-1 text-white">Passer commande</a>
        </div>
    `;

    return html;
}

// Fonction pour ouvrir le dropdown du panier
function openCartDropdown() {
    const cartButton = document.getElementById('myCartDropdownButton1');
    
    if (cartButton) {
        // Simuler un clic sur le bouton du panier pour déclencher l'ouverture du dropdown
        // Cela utilise le système de dropdown déjà en place (Tailwind/Flowbite)
        cartButton.click();

        setTimeout(() => {

            // Fermer le dropdown du panier après 2 secondes
            const cartDropdown = document.getElementById('myCartDropdown1');
            if (cartDropdown) {
            cartDropdown.classList.remove('show');
            cartDropdown.classList.add('hidden');
            }
        }, 2000);
    } else {
        console.error('Bouton du panier non trouvé');
    }
}

// Fonction de validation du mot de passe en temps réel avec regex
function initPasswordValidation() {
    const form = document.getElementById('userForm') || document.getElementById('resetPasswordForm') || document.getElementById('updateProfileForm');
    if (!form) return; // Pas sur une page avec validation de mot de passe
    
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('confirmPassword');
    const caracteres = document.getElementById("contient");
    const majuscule = document.getElementById('maj');
    const speciale = document.getElementById('spe');
    const chiffre = document.getElementById('num');
    const ver = document.getElementById('ver');
    
    if (!password || !passwordConfirm) return;
    
    // Déterminer si on est sur le formulaire de profil (mot de passe optionnel)
    const isProfileForm = form.id === 'updateProfileForm';
    
    // Fonction de validation
    function validatePassword() {
        const passwordValue = password.value;
        const passwordConfirmValue = passwordConfirm.value;
        
        // Si on est sur le profil et que les champs sont vides, pas de validation
        if (isProfileForm && passwordValue === '' && passwordConfirmValue === '') {
            return;
        }
        
        // Validation de la longueur (au moins 8 caractères)
        if (passwordValue.length >= 8) {
            caracteres.style.color = 'green';
            caracteres.className = 'text-xs text-green-600 dark:text-green-400';
            caracteres.textContent = 'Le mot de passe contient au moins 8 caractères !';
        } else {
            caracteres.style.color = 'red';
            caracteres.className = 'text-xs text-red-600 dark:text-red-400';
            caracteres.textContent = 'Le mot de passe doit contenir au moins 8 caractères !';
        }
        
        // Validation des majuscules
        if (/[A-Z]/.test(passwordValue)) {
            majuscule.style.color = 'green';
            majuscule.className = 'text-xs text-green-600 dark:text-green-400';
            majuscule.textContent = 'Le mot de passe contient au moins une majuscule !';
        } else {
            majuscule.style.color = 'red';
            majuscule.className = 'text-xs text-red-600 dark:text-red-400';
            majuscule.textContent = 'Le mot de passe doit contenir au moins une majuscule !';
        }
        
        // Validation des caractères spéciaux
        if (passwordValue.match(/[\W_]/)) {
            speciale.style.color = 'green';
            speciale.className = 'text-xs text-green-600 dark:text-green-400';
            speciale.textContent = 'Le mot de passe contient au moins un caractère spécial !';
        } else {
            speciale.style.color = 'red';
            speciale.className = 'text-xs text-red-600 dark:text-red-400';
            speciale.textContent = 'Le mot de passe doit contenir au moins un caractère spécial !';
        }
        
        // Validation des chiffres
        if (/[0-9]/.test(passwordValue)) {
            chiffre.style.color = 'green';
            chiffre.className = 'text-xs text-green-600 dark:text-green-400';
            chiffre.textContent = 'Le mot de passe contient au moins un chiffre !';
        } else {
            chiffre.style.color = 'red';
            chiffre.className = 'text-xs text-red-600 dark:text-red-400';
            chiffre.textContent = 'Le mot de passe doit contenir au moins un chiffre !';
        }
        
        // Validation de la correspondance des mots de passe
        if (passwordValue === passwordConfirmValue && passwordValue !== '' && passwordConfirmValue !== '') {
            ver.style.color = 'green';
            ver.className = 'text-xs text-green-600 dark:text-green-400';
            ver.textContent = 'Les mots de passe correspondent !';
        } else if (passwordConfirmValue !== '' || passwordValue !== '') {
            ver.style.color = 'red';
            ver.className = 'text-xs text-red-600 dark:text-red-400';
            ver.textContent = 'Les mots de passe ne correspondent pas !';
        }
    }
    
    // Écouter les événements keyup sur les champs de mot de passe
    password.addEventListener('keyup', validatePassword);
    passwordConfirm.addEventListener('keyup', validatePassword);
    
    // Validation avant la soumission du formulaire
    form.addEventListener('submit', function(e) {
        const passwordValue = password.value;
        const passwordConfirmValue = passwordConfirm.value;
        
        // Si on est sur le profil et que les mots de passe sont vides, pas de validation
        if (isProfileForm && passwordValue === '' && passwordConfirmValue === '') {
            return true; // Laisser passer, pas de changement de mot de passe
        }
        
        // Si un mot de passe est fourni, valider
        if (passwordValue !== '' || passwordConfirmValue !== '') {
            // Vérifier toutes les conditions
            const hasMinLength = passwordValue.length >= 8;
            const hasUppercase = /[A-Z]/.test(passwordValue);
            const hasSpecial = passwordValue.match(/[\W_]/);
            const hasNumber = /[0-9]/.test(passwordValue);
            const passwordsMatch = passwordValue === passwordConfirmValue;
            
            if (!hasMinLength || !hasUppercase || !hasSpecial || !hasNumber || !passwordsMatch) {
                e.preventDefault();
                alert('Veuillez corriger les erreurs de validation du mot de passe avant de continuer.');
                return false;
            }
        }
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script panier chargé avec succès');
    console.log('Fonction addToCart disponible:', typeof window.addToCart);
    
    // Initialiser la validation du mot de passe
    initPasswordValidation();
    
    // Attacher les event listeners aux boutons "Ajouter au panier"
    const addToCartButtons = document.querySelectorAll('[onclick*="addToCart"]');
    console.log('Nombre de boutons trouvés:', addToCartButtons.length);
    
    addToCartButtons.forEach(button => {
        // Récupérer l'ID depuis l'onclick
        const onclickAttr = button.getAttribute('onclick');
        const platIdMatch = onclickAttr.match(/addToCart\('([^']+)'\)/);
        
        if (platIdMatch) {
            const itemId = platIdMatch[1];
            console.log('Bouton configuré pour ID:', itemId);
            
            // Remplacer l'onclick par un event listener
            button.removeAttribute('onclick');
            
            // Déterminer si c'est un plat ou un article basé sur l'URL de l'action du formulaire parent
            const form = button.closest('form');
            const isArticle = form && form.action.includes('/articles/');
            
            if (isArticle) {
                button.setAttribute('data-article-id', itemId);
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.addToCartArticle(itemId);
                });
            } else {
                button.setAttribute('data-plat-id', itemId);
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.addToCart(itemId);
                });
            }
        }
    });

    // Attacher les event listeners aux boutons "Voir les détails"
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    console.log('Nombre de boutons détails trouvés:', viewDetailsButtons.length);
    
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Vérifier si c'est un plat ou un article
            const isPlat = this.hasAttribute('data-plat-id');
            const isArticle = this.hasAttribute('data-article-id');
            
            if (isPlat) {
                // Récupérer les données du plat depuis les attributs data
                const platData = {
                    id: this.getAttribute('data-plat-id'),
                    name: this.getAttribute('data-plat-name'),
                    price: this.getAttribute('data-plat-price'),
                    origin: this.getAttribute('data-plat-origin'),
                    ingredients: this.getAttribute('data-plat-ingredients'),
                    description: this.getAttribute('data-plat-description'),
                    image: this.getAttribute('data-plat-image'),
                    isSpicy: this.getAttribute('data-plat-spicy') === 'true',
                    isVegetarian: this.getAttribute('data-plat-vegetarian') === 'true'
                };
                
                // Mettre à jour le contenu du drawer pour les plats
                updateDrawerContent(platData);
            } else if (isArticle) {
                // Récupérer les données de l'article depuis les attributs data
                const articleData = {
                    id: this.getAttribute('data-article-id'),
                    name: this.getAttribute('data-article-name'),
                    price: this.getAttribute('data-article-price'),
                    origin: this.getAttribute('data-article-origin'),
                    ingredients: this.getAttribute('data-article-ingredients'),
                    description: this.getAttribute('data-article-description'),
                    image: this.getAttribute('data-article-image'),
                    isSpicy: this.getAttribute('data-article-spicy') === 'true',
                    isVegetarian: this.getAttribute('data-article-vegetarian') === 'true'
                };
                
                // Mettre à jour le contenu du drawer pour les articles
                updateArticleDrawerContent(articleData);
            }
        });
    });
});

// Fonction pour mettre à jour le contenu du drawer avec les détails du plat
function updateDrawerContent(platData) {
    // Mettre à jour le nom
    document.getElementById('drawer-plat-name').textContent = platData.name;
    
    // Mettre à jour le prix
    document.getElementById('drawer-plat-price').textContent = platData.price + ' €';
    
    // Mettre à jour l'origine
    document.getElementById('drawer-plat-origin').textContent = platData.origin;
    
    // Mettre à jour les ingrédients
    document.getElementById('drawer-plat-ingredients').textContent = platData.ingredients;
    
    // Mettre à jour la description
    document.getElementById('drawer-plat-description').textContent = platData.description;
    
    // Mettre à jour l'image
    const imageElement = document.getElementById('drawer-plat-image');
    imageElement.src = platData.image;
    imageElement.alt = platData.name;
    
    // Mettre à jour les badges
    const badgesContainer = document.getElementById('drawer-plat-badges');
    badgesContainer.innerHTML = '';
    
    if (platData.isSpicy) {
        badgesContainer.innerHTML += `
            <span class="rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                Épicé 🌶️
            </span>
        `;
    }
    
    if (platData.isVegetarian) {
        badgesContainer.innerHTML += `
            <span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                Végétarien 🌱
            </span>
        `;
    }
    
    // Mettre à jour le formulaire d'ajout au panier
    const addToCartForm = document.getElementById('drawer-add-to-cart-form');
    addToCartForm.action = `/plats/add-to-cart/${platData.id}`;
    
    const addToCartBtn = document.getElementById('drawer-add-to-cart-btn');
    addToCartBtn.setAttribute('data-plat-id', platData.id);
    addToCartBtn.onclick = function(e) {
        e.preventDefault();
        window.addToCart(platData.id);
        return false;
    };
    
    console.log('Drawer mis à jour avec les données du plat:', platData.name);
}

// Fonction pour mettre à jour le contenu du drawer avec les détails de l'article
function updateArticleDrawerContent(articleData) {
    // Mettre à jour le nom
    document.getElementById('drawer-article-name').textContent = articleData.name;
    
    // Mettre à jour le prix
    document.getElementById('drawer-article-price').textContent = articleData.price + ' €';
    
    // Mettre à jour l'origine
    document.getElementById('drawer-article-origin').textContent = articleData.origin;
    
    // Mettre à jour les ingrédients
    document.getElementById('drawer-article-ingredients').textContent = articleData.ingredients;
    
    // Mettre à jour la description
    document.getElementById('drawer-article-description').textContent = articleData.description;
    
    // Mettre à jour l'image
    const imageElement = document.getElementById('drawer-article-image');
    imageElement.src = articleData.image;
    imageElement.alt = articleData.name;
    
    // Mettre à jour les badges
    const badgesContainer = document.getElementById('drawer-article-badges');
    badgesContainer.innerHTML = '';
    
    if (articleData.isSpicy) {
        badgesContainer.innerHTML += `
            <span class="rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                Épicé 🌶️
            </span>
        `;
    }
    
    if (articleData.isVegetarian) {
        badgesContainer.innerHTML += `
            <span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                Végétarien 🌱
            </span>
        `;
    }
    
    // Mettre à jour le formulaire d'ajout au panier
    const addToCartForm = document.getElementById('drawer-add-to-cart-form');
    addToCartForm.action = `/articles/add-to-cart/${articleData.id}`;
    
    const addToCartBtn = document.getElementById('drawer-add-to-cart-btn');
    addToCartBtn.setAttribute('data-article-id', articleData.id);
    addToCartBtn.onclick = function(e) {
        e.preventDefault();
        addToCartArticle(articleData.id);
        return false;
    };
    
    console.log('Drawer mis à jour avec les données de l\'article:', articleData.name);
}

// Fonction pour ajouter un article au panier via AJAX
window.addToCartArticle = async function(articleId) {
    console.log('addToCartArticle appelée avec articleId:', articleId); // Debug
    try {
        const response = await fetch(`/articles/add-to-cart/${articleId}`, {
            method: 'POST'
        });

        // Vérifier si c'est une erreur d'authentification
        if (handleAuthError(response)) {
            return;
        }

        if (response.ok) {
            // Effet visuel sur le bouton "Ajouter au panier" spécifiquement
            let button = null;
            
            // Vérifier d'abord si le drawer est ouvert
            const drawer = document.getElementById('readArticleDrawer');
            const isDrawerOpen = drawer && !drawer.classList.contains('-translate-x-full');
            
            if (isDrawerOpen) {
                // Si le drawer est ouvert, prioriser le bouton du drawer
                const drawerBtn = document.getElementById('drawer-add-to-cart-btn');
                if (drawerBtn && drawerBtn.getAttribute('data-article-id') === articleId) {
                    button = drawerBtn;
                }
            }
            
            // Si pas trouvé dans le drawer ou drawer fermé, chercher dans les cartes
            if (!button) {
                button = document.querySelector(`button[data-article-id="${articleId}"]:not(.view-details-btn):not(#drawer-add-to-cart-btn)`);
            }
            
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '✓ Ajouté !';
                button.style.backgroundColor = '#4CAF50';
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                    button.disabled = false;
                }, 1000);
            }

            // Rafraîchir le contenu du panier dans l'interface
            await updateCartDisplay();
            
            // Ouvrir automatiquement le dropdown du panier
            openCartDropdown();
            
        } else {
            console.error('Erreur de réponse:', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'article au panier:', error);
    }
}

// Fonction pour supprimer un élément du panier via AJAX
window.removeFromCart = async function(itemId, itemType) {
    console.log('removeFromCart appelée avec itemId:', itemId, 'itemType:', itemType);
    try {
        // Utiliser la route spécifique selon le type d'élément
        const route = itemType === 'article' ? 
            `/panier/delete-article/${itemId}?_method=DELETE` : 
            `/panier/delete-plat/${itemId}?_method=DELETE`;
            
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `${itemType}Id=${itemId}`
        });

        // Vérifier si c'est une erreur d'authentification
        if (handleAuthError(response)) {
            return;
        }

        if (response.ok) {
            // Rafraîchir le contenu du panier dans l'interface
            await updateCartDisplay();
            console.log(`${itemType} supprimé du panier avec succès`);
        } else {
            console.error('Erreur lors de la suppression:', response.status);
            alert('Erreur lors de la suppression de l\'élément du panier');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'élément du panier');
    }
}


