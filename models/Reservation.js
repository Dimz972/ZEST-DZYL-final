const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  date: {
    type: String, // Stocker la date comme chaîne au format YYYY-MM-DD pour éviter les problèmes de fuseau horaire
    required: [true, 'La date est obligatoire']
  },
  heure: {
    type: String,
    required: [true, 'L\'heure est obligatoire'],
    enum: ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
  },
  personnes: {
    type: Number,
    required: [true, 'Le nombre de personnes est obligatoire'],
    min: [1, 'Minimum 1 personne'],
    max: [20, 'Maximum 20 personnes']
  },
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'annulee'],
    default: 'en_attente'
  },
  commentaire: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour optimiser les recherches par date
reservationSchema.index({ date: 1, heure: 1 });

// Méthode virtuelle pour formater la date
reservationSchema.virtual('dateFormatee').get(function() {
  if (!this.date) return '';
  const [year, month, day] = this.date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model('Reservation', reservationSchema);