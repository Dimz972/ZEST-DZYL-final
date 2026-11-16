// Utilitaire pour la validation des mots de passe - Validation côté serveur (Node.js)
// Centralise les règles de validation pour éviter la duplication de code

/**
 * Valide la force d'un mot de passe selon les critères définis
 * @param {string} password - Le mot de passe à valider
 * @returns {Object} - Objet contenant isValid (boolean) et errors (array)
 */
function validatePassword(password) {
    const errors = [];
    
    // Vérification de la longueur minimum (8 caractères)
    if (!password || password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    // Vérification de la présence d'au moins une majuscule
    if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    // Vérification de la présence d'au moins un chiffre
    if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    // Vérification de la présence d'au moins un caractère spécial
    if (!/[\W_]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Valide que deux mots de passe correspondent
 * @param {string} password - Le mot de passe
 * @param {string} confirmPassword - La confirmation du mot de passe
 * @returns {Object} - Objet contenant isValid (boolean) et message (string)
 */
function validatePasswordMatch(password, confirmPassword) {
    const isValid = password === confirmPassword && password !== '' && confirmPassword !== '';
    return {
        isValid: isValid,
        message: isValid ? 'Les mots de passe correspondent !' : 'Les mots de passe ne correspondent pas !'
    };
}

/**
 * Validation complète d'un mot de passe (force + correspondance)
 * @param {string} password - Le mot de passe
 * @param {string} confirmPassword - La confirmation du mot de passe
 * @returns {Object} - Objet contenant isValid (boolean), passwordErrors (array) et matchError (string)
 */
function validatePasswordComplete(password, confirmPassword) {
    const passwordValidation = validatePassword(password);
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    
    return {
        isValid: passwordValidation.isValid && matchValidation.isValid,
        passwordErrors: passwordValidation.errors,
        matchError: matchValidation.isValid ? null : matchValidation.message
    };
}

module.exports = {
    validatePassword,
    validatePasswordMatch,
    validatePasswordComplete
};