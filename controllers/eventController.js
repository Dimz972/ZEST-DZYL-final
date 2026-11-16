const Event = require('../models/Event');

// ===== MÉTHODES UTILITAIRES DÉPLACÉES DU MODÈLE =====

// Vérifier si l'événement est complet
const isEventFull = (event) => {
    return event.currentParticipants >= event.maxParticipants;
};

// Ajouter un participant avec ses détails (permet les réservations multiples)
const addParticipantToEvent = async (event, userId, notes = '', numberOfPeople = 1) => {
    if (event.currentParticipants + numberOfPeople > event.maxParticipants) {
        throw new Error(`Plus assez de places disponibles. Places restantes: ${event.maxParticipants - event.currentParticipants}`);
    }
    
    // Ajouter une entrée pour chaque personne réservée
    for (let i = 0; i < numberOfPeople; i++) {
        event.participants.push({
            userId: userId,
            registrationDate: new Date(),
            status: 'confirmed',
            notes: notes
        });
    }
    
    event.currentParticipants = event.participants.filter(p => p.status === 'confirmed').length;
    return await event.save();
};

// Retirer un participant (supprime toutes ses réservations confirmées et annulées)
const removeParticipantFromEvent = async (event, userId, numberOfPeople = 1) => {
    // Compter toutes les réservations de l'utilisateur (confirmées et annulées)
    const userReservations = event.participants.filter(
        p => p.userId.toString() === userId.toString()
    );
    
    if (userReservations.length === 0) {
        throw new Error('Aucune réservation trouvée pour cet utilisateur');
    }
    
    // Supprimer TOUTES les réservations de cet utilisateur (confirmées ET annulées)
    event.participants = event.participants.filter(
        p => p.userId.toString() !== userId.toString()
    );
    
    // Recalculer le nombre de participants confirmés
    event.currentParticipants = event.participants.filter(p => p.status === 'confirmed').length;
    
    return await event.save();
};

// Annuler l'inscription d'un participant (toutes ses réservations)
const cancelParticipantFromEvent = async (event, userId) => {
    const userParticipants = event.participants.filter(
        p => p.userId.toString() === userId.toString() && p.status === 'confirmed'
    );
    
    if (userParticipants.length === 0) {
        throw new Error('Aucune réservation confirmée trouvée pour cet utilisateur');
    }
    
    // Marquer toutes les réservations de l'utilisateur comme annulées
    userParticipants.forEach(participant => {
        participant.status = 'cancelled';
    });
    
    event.currentParticipants = event.participants.filter(p => p.status === 'confirmed').length;
    return await event.save();
};

// Obtenir le nombre de réservations d'un utilisateur
const getUserReservationCount = (event, userId) => {
    return event.participants.filter(
        participant => participant.userId.toString() === userId.toString() && 
        participant.status === 'confirmed'
    ).length;
};

// Obtenir la liste des participants confirmés
const getConfirmedParticipants = (event) => {
    return event.participants.filter(participant => participant.status === 'confirmed');
};

// ===== CONTRÔLEURS =====

//Controller pour Afficher tous les événements
exports.index = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true })
            .sort({ date: 1 }); // Trier par date croissante

        res.render("pages/event", { events, title: "Evénements - ZEST' D'ZYL" });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).render('pages/error', { 
            message: 'Erreur lors du chargement des événements' 
        });
    }
};

// Réserver une place à un événement
exports.reserve = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Événement non trouvé' 
            });
        }

        // Utiliser l'ID de l'utilisateur connecté depuis le token JWT
        const userId = req.user.sub; // Le JWT stocke l'ID dans la propriété 'sub'
        
        console.log('Données utilisateur depuis JWT:', req.user);
        console.log('ID utilisateur extrait:', userId);
        
        if (!userId) {
            console.error('Erreur: userId non trouvé dans le token JWT');
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non authentifié' 
            });
        }
        
        const numberOfPeople = parseInt(req.body.numberOfPeople) || 1;
        const notes = req.body.notes || '';

        // Vérifier s'il y a assez de places disponibles
        if (event.currentParticipants + numberOfPeople > event.maxParticipants) {
            return res.status(400).json({ 
                success: false, 
                message: `Plus assez de places disponibles. Places restantes: ${event.maxParticipants - event.currentParticipants}` 
            });
        }

        await addParticipantToEvent(event, userId, notes, numberOfPeople);
        
        const userReservationCount = getUserReservationCount(event, userId);
        
        res.json({ 
            success: true, 
            message: `Réservation confirmée pour ${numberOfPeople} personne(s) !`,
            currentParticipants: event.currentParticipants,
            userReservations: userReservationCount
        });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Erreur lors de la réservation' 
        });
    }
};

// Annuler l'inscription d'un utilisateur à un événement
exports.cancelParticipant = async (req, res) => {
    try {
        const { eventId, userId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        await cancelParticipantFromEvent(event, userId);

        res.redirect('/events/en-cours');
       

    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'annulation de l\'inscription'
        });
    }
};


// Vérifier si un événement est complet
exports.checkEventAvailability = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const isFull = isEventFull(event);
        const availableSpots = event.maxParticipants - event.currentParticipants;

        res.json({
            success: true,
            isFull: isFull,
            availableSpots: availableSpots,
            maxParticipants: event.maxParticipants,
            currentParticipants: event.currentParticipants
        });

    } catch (error) {
        console.error('Erreur lors de la vérification de la disponibilité:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de la disponibilité'
        });
    }
};

// Obtenir le nombre de réservations d'un utilisateur pour un événement spécifique
exports.getUserReservations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.sub; // JWT

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const reservationCount = getUserReservationCount(event, userId);

        res.json({
            success: true,
            reservationCount: reservationCount,
            eventTitle: event.title
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des réservations utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réservations'
        });
    }
};

// Afficher les événements de l'utilisateur connecté
exports.userEvents = async (req, res) => {
    try {
        const userId = req.user.sub; // ID de l'utilisateur depuis le JWT
        
        if (!userId) {
            return res.status(401).render('pages/error', {
                message: 'Utilisateur non authentifié'
            });
        }

        // Trouver tous les événements où l'utilisateur est participant
        const events = await Event.find({
            'participants.userId': userId,
            'participants.status': 'confirmed'
        }).sort({ date: 1 });

        // Structurer les données pour la vue
        const userEvents = [];
        
        events.forEach(event => {
            // Compter les réservations de l'utilisateur pour cet événement
            const userParticipations = event.participants.filter(
                p => p.userId.toString() === userId.toString() && p.status === 'confirmed'
            );
            
            if (userParticipations.length > 0) {
                // Prendre la première participation pour les détails (date d'inscription, notes)
                const firstParticipation = userParticipations[0];
                
                userEvents.push({
                    event: {
                        _id: event._id,
                        title: event.title,
                        description: event.description,
                        image: event.image,
                        date: event.date,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        price: event.price,
                        category: event.category,
                        maxParticipants: event.maxParticipants,
                        currentParticipants: event.currentParticipants,
                        badge: event.badge,
                        location: event.location
                    },
                    reservationCount: userParticipations.length,
                    registrationDate: firstParticipation.registrationDate,
                    notes: firstParticipation.notes,
                    status: firstParticipation.status
                });
            }
        });

        res.render('pages/event-en-cours', {
            userEvents: userEvents,
            title: 'Mes événements - ZEST\' D\'ZYL',
            user: req.user
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des événements utilisateur:', error);
        res.status(500).render('pages/error', {
            message: 'Erreur lors du chargement de vos événements'
        });
    }
};

// Obtenir les événements par catégorie
exports.getEventsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const events = await Event.find({ 
            category: category, 
            isActive: true 
        }).sort({ date: 1 });

        res.json({ success: true, events });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements par catégorie:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des événements' 
        });
    }
};

//Admin Controllers
//Afficher tous les événements coté admin
exports.indexAdmin = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('participants.userId', 'fname lname email')
            .sort({ date: 1 }); // Trier par date croissante

        // Mettre à jour le nombre de participants confirmés pour chaque événement
        events.forEach(event => {
            const confirmedCount = event.participants.filter(p => p.status === 'confirmed').length;
            if (event.currentParticipants !== confirmedCount) {
                event.currentParticipants = confirmedCount;
                event.save();
            }
        });

        const successMessage = req.session.successMessage;
        delete req.session.successMessage; // Supprimer le message après l'avoir lu

        res.render("pages/adminEvent", { 
            events, 
            successMessage,
            title: "Administration des Événements - ZEST' D'ZYL" 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).render('pages/error', { 
            message: 'Erreur lors du chargement des événements' 
        });
    }
};

// Créer un nouvel événement
exports.create = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            startTime,
            endTime,
            price,
            category,
            maxParticipants,
            badge,
            location
        } = req.body;

        // Gestion de l'image uploadée
        let imagePath = '';
        if (req.file) {
            imagePath = `/${req.file.filename}`;
        }

        const newEvent = new Event({
            title,
            description,
            image: imagePath,
            date: new Date(date),
            startTime,
            endTime,
            price: parseFloat(price),
            category,
            maxParticipants: parseInt(maxParticipants) || 20,
            badge: badge || '',
            location: location || 'Restaurant Zet D\'zyl'
        });

        await newEvent.save();
        req.session.successMessage = "Événement ajouté avec succès !";
        res.redirect('/events/admin');
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).render('pages/error', { 
            message: 'Erreur lors de la création de l\'événement' 
        });
    }
};

// Mettre à jour un événement
exports.update = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updateData = req.body;

        // Gestion de l'image uploadée
        if (req.file) {
            updateData.image = `/${req.file.filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).render('pages/error', { 
                message: 'Événement non trouvé' 
            });
        }

        res.redirect('/events/admin');
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).render('pages/error', { 
            message: 'Erreur lors de la mise à jour de l\'événement' 
        });
    }
};

// Supprimer un événement
exports.delete = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).render('pages/error', { 
                message: 'Événement non trouvé' 
            });
        }

        res.redirect('/events/admin');
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).render('pages/error', { 
            message: 'Erreur lors de la suppression de l\'événement' 
        });
    }
};

// Récupérer les participants d'un événement (admin)
exports.getParticipants = async (req, res) => {
    try {
        const eventId = req.params.id;

        // Vérifier que l'événement existe et populer les participants
        const event = await Event.findById(eventId)
            .populate('participants.userId', 'fname lname email phone_number');
            
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        // Regrouper les participants par utilisateur et compter les réservations
        const participantGroups = {};
        
        event.participants.forEach(participant => {
            const userId = participant.userId._id.toString();
            
            if (!participantGroups[userId]) {
                participantGroups[userId] = {
                    id: participant.userId._id,
                    firstName: participant.userId.fname,
                    lastName: participant.userId.lname,
                    email: participant.userId.email,
                    phone: participant.userId.phone_number,
                    registrationDate: participant.registrationDate,
                    notes: participant.notes,
                    confirmedCount: 0,
                    cancelledCount: 0,
                    totalCount: 0,
                    status: 'mixed' // Par défaut, sera ajusté selon les réservations
                };
            }
            
            // Compter les réservations par statut
            if (participant.status === 'confirmed') {
                participantGroups[userId].confirmedCount++;
            } else if (participant.status === 'cancelled') {
                participantGroups[userId].cancelledCount++;
            }
            
            participantGroups[userId].totalCount++;
            
            // Définir le statut global de l'utilisateur
            if (participantGroups[userId].confirmedCount > 0 && participantGroups[userId].cancelledCount > 0) {
                participantGroups[userId].status = 'mixed';
            } else if (participantGroups[userId].confirmedCount > 0) {
                participantGroups[userId].status = 'confirmed';
            } else if (participantGroups[userId].cancelledCount > 0) {
                participantGroups[userId].status = 'cancelled';
            }
                
            // Garder la date de première inscription
            if (new Date(participant.registrationDate) < new Date(participantGroups[userId].registrationDate)) {
                participantGroups[userId].registrationDate = participant.registrationDate;
            }
        });

        const allParticipants = Object.values(participantGroups)
            .sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate));

        res.json({
            success: true,
            participants: allParticipants,
            count: allParticipants.length,
            eventTitle: event.title
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des participants:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des participants'
        });
    }
};

// Supprimer un participant d'un événement (admin)
exports.removeParticipant = async (req, res) => {
    try {
        const { eventId, userId } = req.params;
        const numberOfPeople = parseInt(req.body.numberOfPeople) || 1;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        await removeParticipantFromEvent(event, userId, numberOfPeople);

        res.json({
            success: true,
            message: 'Toutes les réservations du participant ont été supprimées avec succès',
            currentParticipants: event.currentParticipants
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du participant:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression du participant'
        });
    }
};



