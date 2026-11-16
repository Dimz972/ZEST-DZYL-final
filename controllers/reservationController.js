const Reservation = require('../models/Reservation');




//Controller pour afficher la page de réservation
exports.index = async (req, res) => {
  // Récupérer les informations de l'utilisateur depuis la session
  const user = req.session.user || {};
  
  res.render('pages/reservation', { 
    title: 'Réserver une table',
    message: null,
    userInfo: {
      nom: user.fname && user.lname ? `${user.fname} ${user.lname}` : '',
      telephone: user.phone_number || '',
      email: user.email || ''
    }
  });
};

//Controller pour traiter la réservation
exports.create = async (req, res) => {
  try {
    const { date, heure, personnes, nom, telephone, email, commentaire } = req.body;
    console.log('Date reçue du formulaire:', date);
    
    // Récupérer les informations de l'utilisateur pour pré-remplir en cas d'erreur
    const user = req.session.user || {};
    const userInfo = {
      nom: nom || (user.fname && user.lname ? `${user.fname} ${user.lname}` : ''),
      telephone: telephone || user.phone_number || '',
      email: email || user.email || ''
    };
    
    // Validation basique
    if (!date || !heure || !personnes || !nom || !telephone) {
      return res.render('pages/reservation', {
        title: 'Réserver une table',
        message: { 
          type: 'error', 
          text: 'Veuillez remplir tous les champs obligatoires.' 
        },
        userInfo
      });
    }

    // Vérifier que la date et l'heure ne sont pas dans le passé
    const maintenant = new Date();
    
    const [year, month, day] = date.split('-').map(Number);
    const dateCheck = new Date(year, month - 1, day);
    
    // Extraire l'heure et les minutes du créneau sélectionné
    const [heureReservation, minutesReservation] = heure.split(':').map(Number);
    const dateHeureReservation = new Date(year, month - 1, day, heureReservation, minutesReservation);
    
    // Vérifier si la date/heure de réservation est dans le passé
    if (dateHeureReservation < maintenant) {
      return res.render('pages/reservation', {
        title: 'Réserver une table',
        message: { 
          type: 'error', 
          text: 'Impossible de réserver à une date ou heure passée.' 
        },
        userInfo
      });
    }

    // Vérifier la disponibilité (optionnel - limite de 50 places par créneau)
    const reservations = await Reservation.find({
      date: date,
      heure: heure,
      statut: { $ne: 'annulee' }
    });
    
    // Calculer le nombre total de personnes déjà réservées
    const personnesReservees = reservations.reduce((total, reservation) => {
      return total + (reservation.personnes || 0);
    }, 0);
    
    // Vérifier s'il reste assez de places
    const placesRestantes = 50 - personnesReservees;
    const personnesDemandees = parseInt(personnes);
    
    if (placesRestantes < personnesDemandees) {
      return res.render('pages/reservation', {
        title: 'Réserver une table',
        message: { 
          type: 'error', 
          text: `Désolé, il ne reste que ${placesRestantes} place(s) disponible(s) pour ce créneau. Vous demandez ${personnesDemandees} place(s).` 
        },
        userInfo
      });
    }

    // Créer la réservation
    const nouvelleReservation = new Reservation({
      userId: req.session.user._id, // Lier la réservation à l'utilisateur connecté
      date: date, // Stocker la date comme chaîne (YYYY-MM-DD)
      heure,
      personnes: parseInt(personnes),
      nom,
      telephone,
      email: email || undefined,
      commentaire: commentaire || undefined,
      statut: 'confirmee'
    });

    await nouvelleReservation.save();

    // Formater la date pour l'affichage
    const dateFormatee = dateCheck.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    res.render('pages/reservation', {
      title: 'Réserver une table',
      message: { 
        type: 'success', 
        text: `Réservation confirmée pour ${personnes} personne(s) le ${dateFormatee} à ${heure}. Merci ${nom} ! Nous avons hâte de vous accueillir.` 
      },
      userInfo
    });

  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    
    const user = req.session.user || {};
    const userInfo = {
      nom: user.fname && user.lname ? `${user.fname} ${user.lname}` : '',
      telephone: user.phone_number || '',
      email: user.email || ''
    };
    
    res.render('pages/reservation', {
      title: 'Réserver une table',
      message: { 
        type: 'error', 
        text: 'Une erreur est survenue lors de la réservation. Veuillez réessayer.' 
      },
      userInfo
    });
  }
};

//Controller pour annule sa propre réservation (client)
exports.cancel = async (req, res) => {
     try {
        // Vérifier que la réservation appartient bien à l'utilisateur connecté
        const reservation = await Reservation.findOne({
          _id: req.params.id,
          userId: req.session.user._id
        });
    
        if (!reservation) {
          return res.status(403).send('Vous n\'avez pas le droit d\'annuler cette réservation');
        }
    
        // Annuler la réservation
        await Reservation.findByIdAndUpdate(req.params.id, { 
          statut: 'annulee' 
        });
        
        res.redirect('/reservation/en-cours');
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        res.status(500).send('Erreur lors de l\'annulation');
      }
    };

//Controller pour vérifier la disponibilité des places (ajax)
exports.check = async (req, res) => {
     try {
        const { date, heure } = req.query;
        
        if (!date) {
          return res.json({ disponible: false, message: 'Date manquante' });
        }
    
        // Si on demande tous les créneaux pour une date
        if (heure === 'all') {
          const timeSlots = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
          const slots = {};
          
          for (const slot of timeSlots) {
            const reservations = await Reservation.find({
              date: date,
              heure: slot,
              statut: { $ne: 'annulee' }
            });
            
            // Calculer le nombre total de personnes réservées
            const personnesReservees = reservations.reduce((total, reservation) => {
              return total + (reservation.personnes || 0);
            }, 0);
            
            const placesRestantes = Math.max(0, 50 - personnesReservees);
            
            slots[slot] = {
              disponible: placesRestantes > 0,
              placesRestantes: placesRestantes
            };
          }
          
          return res.json({ slots });
        }
        
        // Pour un créneau spécifique
        if (!heure) {
          return res.json({ disponible: false, message: 'Heure manquante' });
        }
    
        const reservations = await Reservation.find({
          date: date,
          heure: heure,
          statut: { $ne: 'annulee' }
        });
        
        // Calculer le nombre total de personnes réservées
        const personnesReservees = reservations.reduce((total, reservation) => {
          return total + (reservation.personnes || 0);
        }, 0);
        
        const placesRestantes = Math.max(0, 50 - personnesReservees);
    
        res.json({
          disponible: placesRestantes > 0,
          placesRestantes: placesRestantes
        });
      } catch (error) {
        console.error('Erreur API disponibilité:', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    };

//Controller pour afficher la réservation en cours (client)
exports.view = async (req, res) => {
  try {
    // Récupérer la prochaine réservation confirmée ou en attente de l'utilisateur connecté
    const reservation = await Reservation.findOne({ 
      userId: req.session.user._id, // Filtrer par utilisateur connecté
      statut: { $in: ['confirmee', 'en_attente'] }
    })
      .sort({ date: 1, heure: 1 })
      .lean();

    res.render('pages/reservation-en-cours', {
      title: 'Réservation en cours',
      reservation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation en cours:', error);
    res.status(500).send('Erreur lors de la récupération de la réservation en cours');
  }
};

 
//Admin Controllers 
//Controller pour voir toutes les réservations (admin)
exports.viewAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
          .sort({ date: 1, heure: 1 })
          .lean();
    
        res.render('pages/adminReservation', {
          title: "Administration des réservations - ZEST' D'ZYL",
          reservations
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).send('Erreur lors de la récupération des réservations');
      }
    };

//Controller pour annuler une réservation (admin)
exports.cancelReservationAdmin = async (req, res) => {
  try { 
      await Reservation.findByIdAndUpdate(req.params.id, { 
        statut: 'annulee' 
      });
      res.redirect('/reservation/admin');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      res.status(500).send('Erreur lors de l\'annulation');
    }
  };

//Controller pour supprimer une réservation (admin)
exports.deleteReservationAdmin = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservation/admin');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).send('Erreur lors de la suppression');
  }
};


//Controller pour annule sa propre réservation (client)
exports.cancelOwnReservation = async (req, res) => {
     try {
        // Vérifier que la réservation appartient bien à l'utilisateur connecté
        const reservation = await Reservation.findOne({
          _id: req.params.id,
          userId: req.session.user._id
        });
    
        if (!reservation) {
          return res.status(403).send('Vous n\'avez pas le droit d\'annuler cette réservation');
        }
    
        // Annuler la réservation
        await Reservation.findByIdAndUpdate(req.params.id, { 
          statut: 'annulee' 
        });
        
        res.redirect('/reservation/en-cours');
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        res.status(500).send('Erreur lors de l\'annulation');
      }
    };


