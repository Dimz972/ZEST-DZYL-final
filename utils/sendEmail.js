const nodemailer = require('nodemailer');

/**
 * Fonction pour envoyer un email
 * @param {Object} options - Options pour l'envoi de l'email
 * @param {string} options.to - Destinataire de l'email
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 */
async function sendEmail({ to, subject, html }) {
  try {
    // Configuration du transporteur d'email pour Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Utilise la configuration Gmail prédéfinie
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true pour le port 465, false pour 587
      auth: {
        user: process.env.EMAIL_USER, // Votre adresse Gmail
        pass: process.env.EMAIL_PASS, // Votre mot de passe d'application Gmail
      },
      tls: {
        rejectUnauthorized: false // Permet d'éviter les erreurs de certificat
      }
    });

    // Options de l'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ZEST\'D\'ZYL Restaurant" <noreply@zestdzyl.com>',
      to,
      subject,
      html,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email envoyé via Gmail:', info.messageId);
    console.log('✅ Email envoyé avec succès à:', to);
    
    return info;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

module.exports = sendEmail;
