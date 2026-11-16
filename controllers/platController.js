const Plat = require("../models/Plat"); // Importation du modèle Plat



//Controller pour afficher tous les plats
exports.index = async (req, res) => {
  try {
    //Récupération des plats => Model + find() => [] tableau d'objets
    const plats = await Plat.find();
    //console.log('Plats trouvés:', plats);
    res.status(200).render("pages/plats", {
      plats,
      cart: req.session.cart || [],
      title: "Plats - ZEST' D'ZYL",
    });
  } catch (error) {
    throw new Error("Error retrieving plats: " + error);
  }
};


//Panier Controllers
//Controller pour afficher le panier
exports.showCart = (req, res) => {
  try {
    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Nettoyer le panier des éléments invalides
    req.session.cart = req.session.cart.filter(
      (item) =>
        item &&
        ((item.plat && item.plat._id && item.plat.name) ||
          (item.article && item.article._id && item.article.name))
    );

    res.status(200).render("pages/panier", {
      cart: req.session.cart,
      title: "Panier - ZEST' D'ZYL",
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage du panier:", error);
    res.status(500).send("Erreur lors de l'affichage du panier");
  }
};

//Controller pour ajouter un plat au panier
exports.addToCart = async (req, res) => {
  try {
    const platId = req.params.id;
    const plat = await Plat.findById(platId);

    if (!plat) {
      console.log("Plat non trouvé pour ID:", platId);
      return res.status(404).end();
    }
    console.log("Plat trouvé:", plat.name);

    // Initialiser le panier dans la session s'il n'existe pas
    if (!req.session.cart) {
      req.session.cart = [];
      console.log("Panier initialisé");
    }

    // Vérifier si le plat est déjà dans le panier
    const existingItem = req.session.cart.find(
      (item) => item.plat && item.plat._id.toString() === plat._id.toString()
    );
    if (existingItem) {
      // Incrémenter la quantité si déjà présent
      existingItem.quantity += 1;
      console.log("Quantité incrémentée pour:", plat.name);
    } else {
      // Ajouter le plat avec quantité 1 - Créer une copie sérialisable du plat
      const platData = {
        _id: plat._id,
        name: plat.name,
        origin: plat.origin,
        isSpicy: plat.isSpicy,
        isVegetarian: plat.isVegetarian,
        ingredients: plat.ingredients,
        description: plat.description,
        price: plat.price,
        image: plat.image,
      };
      req.session.cart.push({
        type: "plat",
        plat: platData,
        quantity: 1,
      });
      console.log("Plat ajouté au panier:", plat.name);
    }
    console.log("Panier après ajout:", req.session.cart);

    // Retourner juste un statut 200 sans contenu
    res.status(200).end();
  } catch (error) {
    console.error("Erreur lors de l'ajout du plat au panier:", error);
    res.status(500).end();
  }
};

//Controller pour supprimer un plat du dropdown panier
exports.removeFromCart = async (req, res) => {
  try {
    const platId = req.params.id;

    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Filtrer le panier pour supprimer le plat avec l'ID correspondant
    // On supprime uniquement les plats (pas les articles)
    const initialLength = req.session.cart.length;
    req.session.cart = req.session.cart.filter((item) => {
      if (item.plat && item.plat._id.toString() === platId) {
        return false; // Supprimer ce plat
      }
      return true; // Garder tous les autres éléments (y compris les articles)
    });

    const finalLength = req.session.cart.length;
    const wasRemoved = initialLength > finalLength;

    console.log(
      `[PlatController] Plat ${
        wasRemoved ? "supprimé" : "non trouvé"
      } du panier dropdown. Panier mis à jour:`,
      req.session.cart
    );

    // Retourner juste un statut 200 pour les requêtes AJAX
    res.status(200).json({
      message: wasRemoved
        ? "Plat supprimé avec succès"
        : "Plat non trouvé dans le panier",
      removed: wasRemoved,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du plat du panier dropdown :",
      error
    );
    res
      .status(500)
      .json({
        error: "Erreur lors de la suppression du plat du panier dropdown",
      });
  }
};
//Controller pour supprimer depuis la page panier.ejs
exports.removePageCart = async (req, res) => {
  try {
    const platId = req.params.id;

    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Filtrer le panier pour supprimer le plat avec l'ID correspondant
    // Seuls les plats doivent être supprimés, pas les articles
    req.session.cart = req.session.cart.filter((item) => {
      // Garder les articles (ils n'ont pas de propriété plat)
      if (item.article) {
        return true;
      }
      // Pour les plats, vérifier s'ils correspondent à l'ID à supprimer
      if (item.plat && item.plat._id) {
        return item.plat._id.toString() !== platId;
      }
      // Supprimer les éléments invalides
      return false;
    });

    console.log(
      "Article supprimé du panier. Panier mis à jour:",
      req.session.cart
    );

    // Rediriger vers la page du panier après suppression
    res.redirect("/panier");
  } catch (error) {
    console.error("Erreur lors de la suppression du plat du panier:", error);
    res.status(500).send("Erreur lors de la suppression du plat du panier");
  }
};

//API pour récupérer le panier en JSON (pour mise à jour AJAX)
exports.getCartAPI = async (req, res) => {
  try {
    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Peupler les données du panier
    const Plat = require("../models/Plat");
    const Article = require("../models/Article");

    let populatedCart = [];
    let total = 0;

    for (let item of req.session.cart) {
      if (item.type === "plat" && item.plat) {
        // C'est un plat - récupérer les données complètes
        const plat = await Plat.findById(item.plat);
        if (plat) {
          const populatedItem = {
            ...item,
            plat: plat,
          };
          populatedCart.push(populatedItem);
          total += plat.price * item.quantity;
        }
      } else if (item.type === "article" && item.article) {
        // C'est un article - récupérer les données complètes
        const article = await Article.findById(item.article);
        if (article) {
          const populatedItem = {
            ...item,
            article: article,
          };
          populatedCart.push(populatedItem);
          total += article.price * item.quantity;
        }
      }
    }

    res.status(200).json({
      cart: populatedCart,
      total: total,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du panier API:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du panier" });
  }
};


//Controller pour afficher les plats coté admin afin de le modifier ou supprimer
exports.indexAdmin = async (req, res) => {
  try {
    //Récupération des plats => Model + find() => [] tableau d'objets
    const plats = await Plat.find();
    console.log("Plats trouvés:", plats);
    
    const successMessage = req.session.successMessage;
    delete req.session.successMessage; // Supprimer le message après l'avoir lu
    
    res.status(200).render("pages/adminPlat", {
      plats,
      successMessage,
      title: "Administration Plats - ZEST' D'ZYL",
    });
    //Réponse json api
    //res.status(200).json(plats);
  } catch (error) {
    throw new Error("Error retrieving plats: " + error);
  }
};


//Controller pour ajouter un plat via le modal dans adminPlat.ejs
exports.create = async (req, res) => {
  try {
    const imagePlat = req.file ? "/" + req.file.filename : ""; // Chemin de l'image uploadée
    const newPlat = new Plat({ ...req.body, image: imagePlat }); // Création d'une nouvelle instance de Plat avec les données du formulaire
    console.log("Message: ", req.file);
    await newPlat.save();
    console.log("Plat ajouté :", newPlat);
    req.session.successMessage = "Plat ajouté avec succès !";
    res.redirect("/plats/admin"); // Redirection vers la liste des plats
  } catch (error) {
    console.error("Erreur lors de l'ajout du plat :", error);
    res.status(500).send("Erreur lors de l'ajout du plat");
  }
};

//Controller pour supprimer un plat
exports.delete = async (req, res) => {
  try {
    //Récupération de l'ID du plat à supprimer depuis les paramètres de la requête
    const platId = req.params.id;
    const deletedPlat = await Plat.findByIdAndDelete(platId);
    console.log("Plat supprimé:", deletedPlat);
    res.redirect("/plats/admin"); // Redirection vers la page admin des plats après suppression
  } catch (error) {
    throw new Error("Error deleting plat: " + error);
  }
};

//Controller pour mettre à jour un plat via le modalUpdate dans la vue plats.ejs
exports.formUpdate = async (req, res) => {
  try {
    const platId = req.params.id;
    const {
      name,
      origin,
      isSpicy,
      isVegetarian,
      ingredients,
      description,
      price,
    } = req.body;

    // Gérer l'image : si une nouvelle image est uploadée, l'utiliser, sinon garder l'ancienne
    const updateData = {
      name,
      origin,
      isSpicy,
      isVegetarian,
      ingredients,
      description,
      price,
    };

    if (req.file) {
      updateData.image = "/" + req.file.filename; // Nouvelle image uploadée
    }

    const updatedPlat = await Plat.findByIdAndUpdate(
      platId,
      updateData,
      { new: true } // Retourne le document mis à jour
    );

    if (!updatedPlat) {
      return res.status(404).send("Plat non trouvé");
    }

    console.log("Plat mis à jour:", updatedPlat);
    req.session.successMessage = "Plat modifié avec succès !";
    res.redirect("/plats/admin"); // Redirection vers la page admin des plats
  } catch (error) {
    console.error("Error updating plat:", error);
    res.status(500).send("Erreur lors de la mise à jour du plat");
  }
};
