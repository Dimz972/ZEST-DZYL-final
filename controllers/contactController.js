const Contact = require('../models/Contact');




//Controller pour afficher la page contact
exports.index = (req, res) => {
    res.render('pages/contact', { 
        title: 'Contact - ZEST\' D\'ZYL',
        user: req.session.user || null
    });
}; 

//Controller pour traiter la soumission du formulaire de contact
exports.handleContactFormSubmission = async (req, res) => {
    try {
        const { email, subject, message } = req.body;

        // Validation basique
        if (!email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tous les champs sont requis' 
            });
        }

        // Créer un nouveau contact
        const newContact = new Contact({
            email,
            subject,
            message
        });

        // Sauvegarder en base de données
        await newContact.save();

        res.json({ 
            success: true, 
            message: 'Votre message a été envoyé avec succès!' 
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Une erreur est survenue lors de l\'envoi du message' 
        });
    }
};

//Controller pour récupérer tous les contacts
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }); // Tri par date décroissante
        res.render('pages/adminContact', { 
            title: 'Administration Messages de contact - ZEST\' D\'ZYL',
            contacts 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
        res.status(500).render('pages/404', { 
            title: 'Erreur Administration - ZEST\' D\'ZYL',
            message: 'Erreur lors de la récupération des contacts' 
        });
    }
};

//Controller pour marquer un contact comme lu
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndUpdate(id, { status: 'lu' });
        res.json({ success: true, message: 'Message marqué comme lu' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du contact:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
    }
};

//Controller pour supprimer un contact
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Tentative de suppression du contact avec ID:', id);
        
        const result = await Contact.findByIdAndDelete(id);
        console.log('Résultat de la suppression:', result);
        
        if (!result) {
            return res.status(404).json({ success: false, error: 'Contact non trouvé' });
        }
        
        res.json({ success: true, message: 'Message supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du contact:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
    }
};


