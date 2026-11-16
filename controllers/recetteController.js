const express = require("express");
const Recette = require("../models/Recette"); // Importation du modèle Recette

// Controller pour afficher toutes les recettes (publique)
exports.index = async (req, res) => {
  try {
    const recettes = await Recette.find(); // Temporairement enlever le filtre
    // console.log('Recettes trouvées:', recettes.length);
    res.status(200).render("pages/recettes", { 
      recettes, 
      title: "Recettes - ZEST' D'ZYL" 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des recettes:", error);
    res.status(500).send("Erreur lors de la récupération des recettes");
  }
};

// Controller pour afficher une recette spécifique
exports.show = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id).populate('createdBy');
    if (!recette) {
      return res.status(404).send("Recette non trouvée");
    }
    res.status(200).render("pages/recetteDetail", {
      recette,
      title: `${recette.name} - ZEST' D'ZYL`
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la recette:", error);
    res.status(500).send("Erreur lors de la récupération de la recette");
  }
};

// Controller pour afficher les recettes côté admin
exports.indexAdmin = async (req, res) => {
  try {
    const recettes = await Recette.find();
    
    const successMessage = req.session.successMessage;
    delete req.session.successMessage; // Supprimer le message après l'avoir lu
    
    res.status(200).render("pages/adminRecette", {
      recettes,
      successMessage,
      title: "Administration Recettes - ZEST' D'ZYL"
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des recettes admin:", error);
    res.status(500).send("Erreur lors de la récupération des recettes");
  }
};

// Controller pour créer une recette
exports.create = async (req, res) => {
  try {
    // console.log("Données reçues pour création:", req.body);
    // console.log("Fichier uploadé:", req.file);
    
    const { name, description, preparationTime, cookingTime, servings, ingredients, instructions, difficulty, category, origin, isVegetarian, isSpicy } = req.body;
    const image = req.file ? "/" + req.file.filename : "";

    // Traiter les instructions : si c'est un array, le garder, sinon le convertir
    let processedInstructions = [];
    if (Array.isArray(instructions)) {
      processedInstructions = instructions.filter(inst => inst && inst.trim());
    } else if (instructions) {
      processedInstructions = instructions.split('\n').filter(inst => inst.trim());
    }

    // Traiter les ingrédients : si c'est un array, le garder, sinon le convertir ligne par ligne
    let processedIngredients = [];
    if (Array.isArray(ingredients)) {
      processedIngredients = ingredients.filter(ing => ing && ing.trim());
    } else if (ingredients) {
      processedIngredients = ingredients.split('\n').filter(ing => ing.trim());
    }

    const newRecette = new Recette({
      name,
      description,
      preparationTime: parseInt(preparationTime) || 15,
      cookingTime: parseInt(cookingTime) || 30,
      servings: parseInt(servings) || 4,
      ingredients: processedIngredients,
      instructions: processedInstructions,
      image,
      difficulty: difficulty || 'facile',
      category: category || 'Plat principal',
      origin: origin || '',
      isVegetarian: isVegetarian === 'on' || isVegetarian === 'true' || isVegetarian === true,
      isSpicy: isSpicy === 'on' || isSpicy === 'true' || isSpicy === true,
      createdBy: req.session.user ? req.session.user._id : null
    });

    await newRecette.save();
    req.session.successMessage = "Recette ajoutée avec succès !";
    res.redirect('/recettes/admin');
  } catch (error) {
    console.error("Erreur lors de la création de la recette:", error);
    res.status(500).send("Erreur lors de la création de la recette");
  }
};

// Controller pour supprimer une recette
exports.delete = async (req, res) => {
  try {
    await Recette.findByIdAndDelete(req.params.id);
    res.redirect('/recettes/admin');
  } catch (error) {
    console.error("Erreur lors de la suppression de la recette:", error);
    res.status(500).send("Erreur lors de la suppression de la recette");
  }
};

// Controller pour mettre à jour une recette
exports.formUpdate = async (req, res) => {
  try {
    // console.log("Données reçues pour mise à jour:", req.body);
    // console.log("Fichier uploadé:", req.file);
    
    const { name, description, preparationTime, cookingTime, servings, ingredients, instructions, difficulty, category, origin, isVegetarian, isSpicy } = req.body;
    
    // Traiter les instructions : si c'est un array, le garder, sinon le convertir
    let processedInstructions = [];
    if (Array.isArray(instructions)) {
      processedInstructions = instructions.filter(inst => inst && inst.trim());
    } else if (instructions) {
      processedInstructions = instructions.split('\n').filter(inst => inst.trim());
    }
    
    // Traiter les ingrédients : si c'est un array, le garder, sinon le convertir ligne par ligne
    let processedIngredients = [];
    if (Array.isArray(ingredients)) {
      processedIngredients = ingredients.filter(ing => ing && ing.trim());
    } else if (ingredients) {
      processedIngredients = ingredients.split('\n').filter(ing => ing.trim());
    }
    
    const updateData = {
      name,
      description,
      preparationTime: parseInt(preparationTime) || 15,
      cookingTime: parseInt(cookingTime) || 30,
      servings: parseInt(servings) || 4,
      ingredients: processedIngredients,
      instructions: processedInstructions,
      difficulty: difficulty || 'facile',
      category: category || 'Plat principal',
      origin: origin || '',
      isVegetarian: isVegetarian === 'on' || isVegetarian === 'true' || isVegetarian === true,
      isSpicy: isSpicy === 'on' || isSpicy === 'true' || isSpicy === true
    };

    if (req.file) {
      updateData.image = "/" + req.file.filename;
    }

    await Recette.findByIdAndUpdate(req.params.id, updateData);
    req.session.successMessage = "Recette modifiée avec succès !";
    res.redirect('/recettes/admin');
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la recette:", error);
    res.status(500).send("Erreur lors de la mise à jour de la recette");
  }
};

