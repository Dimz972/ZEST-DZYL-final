const Commande = require("../models/Commande");

//Controller pour afficher la page de commande
exports.index = async (req, res) => {
  // Récupérer le panier depuis la session
  const cart = req.session.cart || [];
  // Récupérer les informations de l'utilisateur connecté
  const user = req.session.user || null;
  res.render("pages/commande", {
    cart: cart,
    user: user,
    title: "Commande - ZEST' D'ZYL",
  });
};

//Controller pour traiter la soumission de commande
exports.create = async (req, res) => {
  const cart = req.session.cart || [];
  const user = req.session.user || null;

  // Calculer le total de la commande
  let total = 0;
  cart.forEach((item) => {
    // Gérer à la fois les plats et les articles
    if (item.plat) {
      total += item.plat.price * item.quantity;
    } else if (item.article) {
      total += item.article.price * item.quantity;
    }
  });

  // Sauvegarder les détails de la commande dans la session
  const now = new Date();
  req.session.orderSummary = {
    cart: cart,
    user: user,
    deliveryMethod: req.body.deliveryMethod,
    fname: req.body.fname,
    lname: req.body.lname,
    address: req.body.address,
    phone: req.body.phone,
    notes: req.body.notes,
    total: total,
    orderDate: now.toISOString(),
    orderDisplayDate: `${now.getDate().toString().padStart(2, "0")}/${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`,
    orderDisplayTime: `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
  };

  // Vider le panier après confirmation
  //req.session.cart = [];

  // Rediriger vers la page de paiement
  res.redirect("/paiement");
};

//Controller pour afficher la page de paiement
exports.paymentPage = async (req, res) => {
  // Récupérer le résumé de commande depuis la session
  const orderSummary = req.session.orderSummary || null;

  if (!orderSummary) {
    // Si pas de commande en cours, rediriger vers les plats
    return res.redirect("/plats");
  }

  res.render("pages/paiement", {
    orderSummary: orderSummary,
    title: "Paiement - ZEST' D'ZYL",
  });
};

//Controller pour traiter le paiement
exports.processPayment = async (req, res) => {
  const orderSummary = req.session.orderSummary || null;

  if (!orderSummary) {
    // Si pas de commande en cours, rediriger vers les plats
    return res.redirect("/plats");
  }

  // Traitement du paiement (simulation)
  const paymentMethod = req.body.paymentMethod;

  // Sauvegarder la méthode de paiement dans la session
  req.session.orderSummary.methodePaiement = paymentMethod;

  if (paymentMethod === "card") {
    // Traitement de la carte bancaire
    const cardNumber = req.body.cardNumber;
    const expiryDate = req.body.expiryDate;
    const cvv = req.body.cvv;

    // Ici, vous pouvez ajouter la logique pour traiter le paiement par carte
    console.log(
      `Traitement du paiement par carte: ${cardNumber}, ${expiryDate}, ${cvv}`
    );
  } else {
    // Traitement des paiements en espèces
    console.log(`Traitement du paiement en espèces`);
  }

  // Rediriger vers la page de confirmation
  res.redirect("/confirmation");
};

//Controller pour afficher la page de confirmation
exports.confirmationPage = async (req, res) => {
  // Récupérer le résumé de commande depuis la session
  const orderSummary = req.session.orderSummary || null;

  if (!orderSummary) {
    // Si pas de commande en cours, rediriger vers les plats
    return res.redirect("/plats");
  }

  try {
    // Nettoyer et valider les données du panier
    const cartCleaned = orderSummary.cart.map((item) => ({
      type: item.type || (item.plat ? "plat" : "article"),
      plat: item.plat || null,
      article: item.article || null,
      quantity: item.quantity || 1,
    }));

    // Créer une nouvelle commande avec un ID unique et un statut
    const nouvelleCommande = {
      ...orderSummary,
      cart: cartCleaned, // Utiliser le panier nettoyé
      userId: req.session.user._id, // Ajouter l'ID de l'utilisateur
      name: `${orderSummary.fname} ${orderSummary.lname}`, // Combiner prénom et nom
      address: orderSummary.address || "À emporter", // Valeur par défaut si pas d'adresse
      statut: "en_cours",
      methodePaiement: orderSummary.methodePaiement, // Ajouter la méthode de paiement
    };

    console.log(
      "Tentative de sauvegarde de la commande:",
      JSON.stringify(nouvelleCommande, null, 2)
    );

    // Sauvegarder la commande en base de données
    const commandeSauvegardee = new Commande(nouvelleCommande);
    await commandeSauvegardee.save();

    console.log(
      "Commande sauvegardée en base de données:",
      commandeSauvegardee
    );

    // Mettre à jour la session avec l'ID de la commande sauvegardée
    req.session.orderSummary._id = commandeSauvegardee._id;

    // Vider le panier après confirmation du paiement
    req.session.cart = [];

    res.render("pages/confirmation", {
      orderSummary: orderSummary,
      title: "Confirmation de commande - ZEST' D'ZYL",
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la commande:", error);
    console.error("Détails de l'erreur:", error.message);
    if (error.errors) {
      console.error("Erreurs de validation:", error.errors);
    }
    res
      .status(500)
      .send("Erreur lors de la sauvegarde de la commande: " + error.message);
  }
};

//Controller pour afficher la commande en cours
exports.currentOrder = async (req, res) => {
  // Récupérer le résumé de commande depuis la session
  const orderSummary = req.session.orderSummary || null;

  // Préparer l'orderSummary avec le nom complet si disponible
  let orderSummaryWithName = null;
  
  if (orderSummary) {
    orderSummaryWithName = {
      ...orderSummary,
      name: orderSummary.fname && orderSummary.lname 
        ? `${orderSummary.fname} ${orderSummary.lname}` 
        : orderSummary.fname || orderSummary.lname || 'Client'
    };
  }

  res.render("pages/commande-en-cours", {
    orderSummary: orderSummaryWithName,
    title: "Commande en cours - ZEST' D'ZYL",
  });
};

//Controller pour annuler la commande en cours
exports.annulerCommande = async (req, res) => {
  // Vérifier s'il y a une commande en cours dans la session
  if (req.session.orderSummary) {
    // Si la commande a été sauvegardée en base de données (a un _id)
    if (req.session.orderSummary._id) {
      try {
        // Supprimer la commande de la base de données
        await Commande.findByIdAndDelete(req.session.orderSummary._id);
        console.log(`Commande ${req.session.orderSummary._id} supprimée`);
      } catch (error) {
        console.error("Erreur lors de la suppression de la commande:", error);
        // Optionnel: vous pouvez afficher un message d'erreur ou continuer
      }
    }

    // Vider le résumé de commande dans la session
    req.session.orderSummary = null;
  }

  // Rediriger vers la page des plats
  res.redirect("/commande/en-cours");
};

//Controller pour afficher la gestion des commandes (admin)
exports.orderManagementAdmin = async (req, res) => {
  try {
    // Récupérer toutes les commandes depuis la base de données
    const orderHistory = await Commande.find()
      .populate("userId", "fname lname email") // Populate pour avoir les infos utilisateur
      .sort({ createdAt: -1 }); // Trier par date de création (plus récent en premier)

    // Repopuler les articles et plats manquants dans le panier
    const Article = require("../models/Article");
    const Plat = require("../models/Plat");

    for (let commande of orderHistory) {
      if (commande.cart && commande.cart.length > 0) {
        for (let item of commande.cart) {
          // Si l'article existe mais n'a pas de nom, le récupérer depuis la DB
          if (item.article && item.article._id && !item.article.name) {
            try {
              const articleComplet = await Article.findById(item.article._id);
              if (articleComplet) {
                item.article = {
                  _id: articleComplet._id,
                  name: articleComplet.name,
                  price: articleComplet.price,
                  image: articleComplet.image,
                  description: articleComplet.description,
                  origin: articleComplet.origin,
                  isSpicy: articleComplet.isSpicy,
                  isVegetarian: articleComplet.isVegetarian,
                  ingredients: articleComplet.ingredients,
                };
              }
            } catch (err) {
              console.error(
                "Erreur lors de la récupération de l'article:",
                err
              );
            }
          }

          // Si le plat existe mais n'a pas de nom, le récupérer depuis la DB
          if (item.plat && item.plat._id && !item.plat.name) {
            try {
              const platComplet = await Plat.findById(item.plat._id);
              if (platComplet) {
                item.plat = {
                  _id: platComplet._id,
                  name: platComplet.name,
                  price: platComplet.price,
                  image: platComplet.image,
                  description: platComplet.description,
                };
              }
            } catch (err) {
              console.error("Erreur lors de la récupération du plat:", err);
            }
          }
        }
      }
    }

    res.render("pages/commande-gestion", {
      orderHistory: orderHistory,
      title: "Gestion des commandes - ZEST' D'ZYL",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la gestion:", error);
    res
      .status(500)
      .send("Erreur lors de la récupération de la gestion des commandes");
  }
};

//Controller pour vider l'historique des commandes terminées (admin)
exports.clearCompletedOrders = async (req, res) => {
  try {
    // Supprimer seulement les commandes terminées de la base de données
    const result = await Commande.deleteMany({
      statut: { $in: ["livree", "terminee", "confirmee", "prete"] },
    });
    console.log(
      `${result.deletedCount} commandes terminées supprimées de la base de données`
    );

    res.redirect("/commandes/admin");
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'historique des commandes terminées:",
      error
    );
    res
      .status(500)
      .send(
        "Erreur lors de la suppression de l'historique des commandes terminées"
      );
  }
};

//Controller pour mettre à jour le statut d'une commande (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const nouveauStatut = req.body.nouveauStatut;

    await Commande.findByIdAndUpdate(commandeId, { statut: nouveauStatut });

    res.redirect("/commandes/admin");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).send("Erreur lors de la mise à jour du statut");
  }
};
