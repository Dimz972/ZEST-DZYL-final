const Article = require("../models/Article"); // Importation du modèle Article



//Controller pour afficher tous les articles sur la page boutique.ejs
exports.index = async (req, res) => {
  try {
    //Récupération des articles => Model + find() => [] tableau d'objets
    const articles = await Article.find();
    //console.log('Articles trouvés:', articles);
    res.status(200).render("pages/boutique", {
      articles,
      cart: req.session.cart || [],
      title: "Boutique - ZEST' D'ZYL",
    });
  } catch (error) {
    throw new Error("Error retrieving articles: " + error);
  }
};

//Panier Controllers
//Controller pour ajouter un article au panier
exports.addToCart = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      console.log("Article non trouvé pour ID:", articleId);
      return res.status(404).end();
    }
    console.log("Article trouvé:", article.name);

    // Initialiser le panier dans la session s'il n'existe pas
    if (!req.session.cart) {
      req.session.cart = [];
      console.log("Panier initialisé");
    }
    // Vérifier si l'article est déjà dans le panier
    const existingItem = req.session.cart.find(
      (item) =>
        item.article && item.article._id.toString() === article._id.toString()
    );
    if (existingItem) {
      // Incrémenter la quantité si déjà présent
      existingItem.quantity += 1;
      console.log("Quantité incrémentée pour:", article.name);
    } else {
      // Ajouter l'article avec quantité 1 et type
      req.session.cart.push({
        type: "article",
        article,
        quantity: 1,
      });
      console.log("Article ajouté au panier:", article.name);
    }
    console.log("Panier après ajout:", req.session.cart);

    // Retourner juste un statut 200 sans contenu
    res.status(200).end();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article au panier:", error);
    res.status(500).end();
  }
};

//Controller pour supprimer un article du dropdown panier
exports.removeFromCart = async (req, res) => {
  try {
    const articleId = req.params.id;

    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Filtrer le panier pour supprimer l'article avec l'ID correspondant
    // On supprime uniquement les articles (pas les plats)
    const initialLength = req.session.cart.length;
    req.session.cart = req.session.cart.filter((item) => {
      if (item.article && item.article._id.toString() === articleId) {
        return false; // Supprimer cet article
      }
      return true; // Garder tous les autres éléments (y compris les plats)
    });

    const finalLength = req.session.cart.length;
    const wasRemoved = initialLength > finalLength;

    console.log(
      `[ArticleController] Article ${
        wasRemoved ? "supprimé" : "non trouvé"
      } du panier dropdown. Panier mis à jour:`,
      req.session.cart
    );

    // Retourner juste un statut 200 pour les requêtes AJAX
    res.status(200).json({
      message: wasRemoved
        ? "Article supprimé avec succès"
        : "Article non trouvé dans le panier",
      removed: wasRemoved,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'article du panier dropdown:",
      error
    );
    res
      .status(500)
      .json({
        error: "Erreur lors de la suppression de l'article du panier dropdown",
      });
  }
};

//Controller pour supprimer un article depuis la page panier.ejs
exports.removePageCart = async (req, res) => {
  try {
    const articleId = req.params.id;

    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Filtrer le panier pour supprimer l'article avec l'ID correspondant
    // Seuls les articles doivent être supprimés, pas les plats
    req.session.cart = req.session.cart.filter((item) => {
      // Garder les plats (ils n'ont pas de propriété article)
      if (item.plat) {
        return true;
      }
      // Pour les articles, vérifier s'ils correspondent à l'ID à supprimer
      if (item.article && item.article._id) {
        return item.article._id.toString() !== articleId;
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
    console.error(
      "Erreur lors de la suppression de l'article du panier:",
      error
    );
    res
      .status(500)
      .send("Erreur lors de la suppression de l'article du panier");
  }
};


//API pour récupérer le panier en JSON (pour mise à jour AJAX)
exports.getCartAPI = (req, res) => {
  try {
    // Vérifier si le panier existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Calculer le total
    let total = 0;
    req.session.cart.forEach((item) => {
      total += item.article.price * item.quantity;
    });

    res.status(200).json({
      cart: req.session.cart,
      total: total,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du panier API:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du panier" });
  }
};

//Admin Articles Controllers
//Controller pour afficher les articles coté admin sur la page adminArticle.ejs
exports.indexAdmin = async (req, res) => {
  try {
    //Récupération des articles => Model + find() => [] tableau d'objets
    const articles = await Article.find();
    console.log("Articles trouvés:", articles);
    
    const successMessage = req.session.successMessage;
    delete req.session.successMessage; // Supprimer le message après l'avoir lu
    
    res.status(200).render("pages/adminArticle", {
      articles,
      successMessage,
      title: "Administration Articles - ZEST' D'ZYL",
    });
    //Réponse json api
    //res.status(200).json(articles);
  } catch (error) {
    throw new Error("Error retrieving articles: " + error);
  }
};

//Controller pour ajouter un article via le modal dans adminArticle.ejs
exports.create = async (req, res) => {
  try {
    console.log("Données du formulaire:", req.body);
    console.log("Fichier uploadé:", req.file);

    const imageArticle = req.file ? "/" + req.file.filename : ""; // Gérer le cas où aucun fichier n'est uploadé

    // Convertir les checkboxes en booléens
    const articleData = {
      ...req.body,
      image: imageArticle,
      isSpicy: req.body.isSpicy === "on" ? true : false,
      isVegetarian: req.body.isVegetarian === "on" ? true : false,
    };

    const newArticle = new Article(articleData); // Création d'une nouvelle instance d'Article avec les données du formulaire

    await newArticle.save();
    console.log("Article ajouté :", newArticle);
    req.session.successMessage = "Article ajouté avec succès !";
    res.redirect("/articles/admin"); // Redirection vers la liste des articles
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article :", error);
    res
      .status(500)
      .send("Erreur lors de l'ajout de l'article: " + error.message);
  }
};

//Controller pour mettre à jour un article via le modalUpdate dans adminArticle.ejs
exports.update = async (req, res) => {
  try {
    const articleId = req.params.id;
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
      isSpicy: isSpicy === "on" ? true : false,
      isVegetarian: isVegetarian === "on" ? true : false,
      ingredients,
      description,
      price,
    };

    if (req.file) {
      updateData.image = "/" + req.file.filename; // Nouvelle image uploadée
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      { new: true } // Retourne le document mis à jour
    );

    if (!updatedArticle) {
      return res.status(404).send("Article non trouvé");
    }

    console.log("Article mis à jour:", updatedArticle);
    req.session.successMessage = "Article modifié avec succès !";
    res.redirect("/articles/admin"); // Redirection vers la page admin des articles
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).send("Erreur lors de la mise à jour de l'article");
  }
};

//Controller pour supprimer un article
exports.delete = async (req, res) => {
  try {
    //Récupération de l'ID de l'article à supprimer depuis les paramètres de la requête
    const articleId = req.params.id;
    const deletedArticle = await Article.findByIdAndDelete(articleId);
    console.log("Article supprimé:", deletedArticle);
    res.redirect("/articles/admin"); // Redirection vers la page admin des articles après suppression
  } catch (error) {
    throw new Error("Error deleting article: " + error);
  }
};