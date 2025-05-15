// api/platsApi.js
import axios from "axios"

const API_URL = "https://pfebackend-production.up.railway.app/api"

const PlatsApi = {
  /**
   * 1. Consulter tous les plats
   * GET /Gerant_plat
   */
  getPlats: async () => {
    try {
      console.log("🔍 Récupération de tous les plats...")
      const response = await axios.get(`${API_URL}/Gerant_plat`)
      console.log("📊 Réponse brute de l'API:", JSON.stringify(response.data).substring(0, 200) + "...")

      // Afficher la structure complète pour le débogage
      console.log("🔍 Type de la réponse:", typeof response.data)
      if (typeof response.data === "object") {
        console.log("🔑 Clés disponibles:", Object.keys(response.data))
      }

      // Vérifier si la réponse est un tableau
      if (Array.isArray(response.data)) {
        console.log("✅ La réponse est un tableau avec", response.data.length, "éléments")
        return response.data
      }

      // Vérifier si la réponse contient un tableau de plats
      if (response.data && response.data.plats && Array.isArray(response.data.plats)) {
        console.log("✅ Tableau trouvé dans response.data.plats avec", response.data.plats.length, "éléments")
        return response.data.plats
      }

      // Vérifier si la réponse contient un objet platss
      if (response.data && response.data.platss) {
        console.log("✅ Objet platss trouvé")
        const plats = Object.values(response.data.platss)
        console.log("✅ Converti en tableau avec", plats.length, "éléments")
        return plats
      }

      // Vérifier si la réponse contient un objet data avec plats ou platss
      if (response.data && response.data.data) {
        if (response.data.data.plats) {
          console.log("✅ Tableau trouvé dans response.data.data.plats")
          return Array.isArray(response.data.data.plats)
            ? response.data.data.plats
            : Object.values(response.data.data.plats)
        }
        if (response.data.data.platss) {
          console.log("✅ Objet trouvé dans response.data.data.platss")
          return Object.values(response.data.data.platss)
        }
      }

      // Si aucun format reconnu n'est trouvé, retourner la réponse brute
      console.log("⚠️ Format non reconnu, retour de la réponse brute")
      return response.data
    } catch (error) {
      console.error("❌ Erreur complète lors de la récupération des plats:", error)
      if (error.response) {
        console.error("❌ Statut de la réponse:", error.response.status)
        console.error("❌ Données de la réponse:", error.response.data)
        throw new Error(
          `Erreur serveur: ${error.response.status} - ${error.response.data.message || "Erreur inconnue"}`,
        )
      } else if (error.request) {
        console.error("❌ Pas de réponse reçue:", error.request)
        throw new Error("Aucune réponse reçue du serveur. Vérifiez votre connexion.")
      } else {
        console.error("❌ Erreur de configuration:", error.message)
        throw new Error("Erreur réseau: " + error.message)
      }
    }
  },

  /**
   * 2. Ajouter un nouveau plat dans le menu
   * POST /Gerant_plat
   */
  addPlat: async (platData) => {
    try {
      console.log("📦 Ajout d'un nouveau plat:", platData)

      // Vérifier si des ingrédients sont fournis, sinon ajouter un ingrédient par défaut
      const ingredients =
        platData.ingredients && platData.ingredients.length > 0
          ? platData.ingredients
          : [{ id_ingredient: 1, quantite: 1 }]

      // Préparer les données pour l'API selon la documentation
      const body = {
        nom: platData.nom,
        description: platData.description || "",
        prix: Number.parseFloat(platData.prix),
        calorie: Number.parseInt(platData.calorie || "0"),
        categorie: platData.categorie || "viande",
        date: platData.date || new Date().toISOString().split("T")[0],
        ingredients: ingredients.map((ing) => ({
          id_ingredient: Number(ing.id_ingredient),
          quantite: Number(ing.quantite),
        })),
        // S'assurer que toutes les maladies sont des nombres
        maladies: platData.maladies.map((maladie) => Number(maladie)),
        image: platData.image || "", // Traiter l'image comme un texte (URL)
      }

      console.log("📤 Données envoyées au backend (addPlat):", body)

      const response = await axios.post(`${API_URL}/Gerant_plat`, body)

      if (response.status === 201) {
        console.log("✅ Plat ajouté avec succès:", response.data)
        return response.data
      }
    } catch (error) {
      console.error("❌ Erreur complète (addPlat):", error)

      if (error.response) {
        console.error("❌ Détails de la réponse d'erreur:", error.response.data)
        console.error("❌ Statut:", error.response.status)
        throw new Error(error.response.data.message || "Champs manquants")
      } else if (error.request) {
        console.error("❌ Pas de réponse reçue:", error.request)
        throw new Error("Aucune réponse reçue du serveur")
      } else {
        console.error("❌ Erreur de configuration:", error.message)
        throw new Error("Erreur réseau: " + error.message)
      }
    }
  },

  /**
   * 3. Ajouter un ingrédient à un plat
   * POST /Gerant_plat/ingredient
   */
  addIngredientToPlat: async (data) => {
    try {
      console.log("📦 Ajout d'un ingrédient à un plat:", data)

      // Préparer les données pour l'API selon la documentation
      const body = {
        id_plat: data.id_plat,
        id_ingredient: data.id_ingredient,
        quantite: data.quantite,
      }

      console.log("📤 Données envoyées au backend (addIngredientToPlat):", body)

      const response = await axios.post(`${API_URL}/Gerant_plat/ingredient`, body)

      if (response.status === 201) {
        console.log("✅ Ingrédient ajouté avec succès:", response.data)
        return response.data
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          console.error("❌ Erreur (addIngredientToPlat):", error.response.data.message)
          throw new Error(error.response.data.message || "Champs manquants")
        } else if (error.response.status === 404) {
          console.error("❌ Erreur (addIngredientToPlat):", "Ingrédient non ajouté")
          throw new Error("Ingrédient non ajouté")
        } else {
          console.error("❌ Erreur serveur (addIngredientToPlat):", error.response.data)
          throw new Error(error.response.data.message || "Erreur serveur")
        }
      } else {
        console.error("❌ Erreur réseau (addIngredientToPlat):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * 4. Modifier la quantité d'un ingrédient
   * PATCH /Gerant_plat/ingredient
   */
  updateIngredientQuantity: async (data) => {
    try {
      console.log("🔄 Modification de la quantité d'un ingrédient:", data)

      // Préparer les données pour l'API selon la documentation
      const body = {
        id_plat: data.id_plat,
        id_ingredient: data.id_ingredient,
        quantite: data.quantite,
      }

      console.log("📤 Données envoyées au backend (updateIngredientQuantity):", body)

      const response = await axios.patch(`${API_URL}/Gerant_plat/ingredient`, body)

      if (response.status === 200) {
        console.log("✅ Quantité modifiée avec succès:", response.data)
        return response.data
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          console.error("❌ Erreur (updateIngredientQuantity):", error.response.data.message)
          throw new Error(error.response.data.message || "Champs manquants")
        } else {
          console.error("❌ Erreur serveur (updateIngredientQuantity):", error.response.data)
          throw new Error(error.response.data.message || "Erreur serveur")
        }
      } else {
        console.error("❌ Erreur réseau (updateIngredientQuantity):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * 5. Consulter un plat spécifique
   * GET /Gerant_plat/:id
   */
  getPlatById: async (id) => {
    try {
      console.log(`🔍 Récupération du plat avec l'ID ${id}...`)
      const response = await axios.get(`${API_URL}/Gerant_plat/${id}`)

      if (response.status === 200) {
        console.log("✅ Plat récupéré avec succès:", response.data)
        return response.data
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("❌ Plat non trouvé:", error.response.data)
        throw new Error("Plat non trouvé")
      } else if (error.response) {
        console.error("❌ Erreur serveur (getPlatById):", error.response.data)
        throw new Error(error.response.data.message || "Erreur serveur")
      } else {
        console.error("❌ Erreur réseau (getPlatById):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * 6. Supprimer un plat
   * DELETE /Gerant_plat/:id
   */
  deletePlat: async (id) => {
    try {
      console.log(`🗑️ Suppression du plat avec l'ID ${id}...`)
      const response = await axios.delete(`${API_URL}/Gerant_plat/${id}`)

      if (response.status === 200) {
        console.log("✅ Plat supprimé avec succès:", response.data)
        return { success: true, message: "Plat supprimé avec succès" }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("❌ Plat non trouvé:", error.response.data)
        throw new Error("Plat non trouvé")
      } else if (error.response) {
        console.error("❌ Erreur serveur (deletePlat):", error.response.data)
        throw new Error(error.response.data.message || "Erreur serveur")
      } else {
        console.error("❌ Erreur réseau (deletePlat):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * 7. Modifier le prix d'un plat
   * PATCH /Gerant_plat
   */
  updatePlatPrice: async (data) => {
    try {
      console.log("💰 Modification du prix d'un plat:", data)

      // Préparer les données pour l'API selon la documentation
      const body = {
        id_plat: data.id_plat,
        prix: Number.parseFloat(data.prix),
      }

      console.log("📤 Données envoyées au backend (updatePlatPrice):", body)

      const response = await axios.patch(`${API_URL}/Gerant_plat`, body)

      if (response.status === 200) {
        console.log("✅ Prix modifié avec succès:", response.data)
        return response.data
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          console.error("❌ Erreur (updatePlatPrice):", error.response.data.message)
          throw new Error(error.response.data.message || "Champs manquants")
        } else if (error.response.status === 404) {
          console.error("❌ Erreur (updatePlatPrice):", "Plat non trouvé")
          throw new Error("Plat non trouvé")
        } else {
          console.error("❌ Erreur serveur (updatePlatPrice):", error.response.data)
          throw new Error(error.response.data.message || "Erreur serveur")
        }
      } else {
        console.error("❌ Erreur réseau (updatePlatPrice):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * 8. Supprimer un ingrédient d'un plat
   * DELETE /Gerant_plat
   */
  deleteIngredientFromPlat: async (data) => {
    try {
      console.log("🗑️ Suppression d'un ingrédient d'un plat:", data)

      // Pour une requête DELETE avec un body, nous devons utiliser axios avec une configuration spéciale
      const response = await axios.delete(`${API_URL}/Gerant_plat`, {
        data: {
          id_plat: data.id_plat,
          id_ingredient: data.id_ingredient,
        },
      })

      if (response.status === 200) {
        console.log("✅ Ingrédient supprimé avec succès:", response.data)
        return { success: true, message: "Ingrédient supprimé avec succès" }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          console.error("❌ Erreur (deleteIngredientFromPlat):", error.response.data.message)
          throw new Error(error.response.data.message || "Champs manquants")
        } else if (error.response.status === 404) {
          console.error("❌ Erreur (deleteIngredientFromPlat):", "Plat non trouvé")
          throw new Error("Plat non trouvé")
        } else {
          console.error("❌ Erreur serveur (deleteIngredientFromPlat):", error.response.data)
          throw new Error(error.response.data.message || "Erreur serveur")
        }
      } else {
        console.error("❌ Erreur réseau (deleteIngredientFromPlat):", error.message)
        throw new Error("Erreur réseau")
      }
    }
  },

  /**
   * Méthode utilitaire pour formater les données de plat reçues de l'API
   */
  formatPlatData: (platData) => {
    console.log("🔄 Formatage d'un plat:", JSON.stringify(platData).substring(0, 100) + "...")

    // Vérifier les clés disponibles dans l'objet plat
    console.log("🔑 Clés disponibles:", Object.keys(platData))

    // Extraire l'ID du plat (plusieurs formats possibles)
    const id = platData.id_plat || platData.id || platData._id || ""
    console.log("🆔 ID extrait:", id)

    // Extraire le nom du plat (plusieurs formats possibles)
    const name = platData.nom_plat || platData.nom || platData.name || ""
    console.log("📝 Nom extrait:", name)

    // Extraire la catégorie (plusieurs formats possibles)
    const category = platData.categorie || platData.category || "Non catégorisé"
    console.log("🏷️ Catégorie extraite:", category)

    // Extraire le prix (plusieurs formats possibles)
    let price = ""
    if (platData.prix !== undefined && platData.prix !== null) {
      price = `${platData.prix}da`
      console.log("💰 Prix extrait:", price)
    } else if (platData.price !== undefined && platData.price !== null) {
      // Si le prix est déjà formaté avec "da", ne pas l'ajouter à nouveau
      price = platData.price.includes("da") ? platData.price : `${platData.price}da`
      console.log("💰 Prix extrait (format alternatif):", price)
    } else {
      price = "0da"
      console.log("⚠️ Prix non trouvé, utilisation de la valeur par défaut:", price)
    }

    // Extraire les ingrédients (plusieurs formats possibles)
    let ingredients = []
    if (Array.isArray(platData.ingredients)) {
      ingredients = platData.ingredients
      console.log("🧂 Ingrédients extraits (tableau):", ingredients.length)
    } else if (platData.ingredients && typeof platData.ingredients === "object") {
      // Si les ingrédients sont un objet, le convertir en tableau
      ingredients = Object.values(platData.ingredients)
      console.log("🧂 Ingrédients extraits (objet):", ingredients.length)
    }

    // Extraire les maladies (plusieurs formats possibles)
    let healthAlerts = []
    if (Array.isArray(platData.maladies)) {
      healthAlerts = platData.maladies.map((m) => Number(m))
      console.log("🩺 Maladies extraites (tableau):", healthAlerts)
    } else if (platData.healthAlerts && Array.isArray(platData.healthAlerts)) {
      healthAlerts = platData.healthAlerts.map((m) => Number(m))
      console.log("🩺 Maladies extraites (format alternatif):", healthAlerts)
    } else if (platData.maladies && typeof platData.maladies === "object") {
      // Si les maladies sont un objet, le convertir en tableau
      healthAlerts = Object.values(platData.maladies).map((m) => Number(m))
      console.log("🩺 Maladies extraites (objet):", healthAlerts)
    }

    // Extraire la date (plusieurs formats possibles)
    let dateAdded = new Date().toLocaleDateString()
    if (platData.date) {
      try {
        // Vérifier si la date est au format ISO ou autre format standard
        const dateObj = new Date(platData.date)
        if (!isNaN(dateObj.getTime())) {
          dateAdded = dateObj.toLocaleDateString()
          console.log("📅 Date extraite:", dateAdded)
        }
      } catch (e) {
        console.log("⚠️ Erreur lors du parsing de la date:", e)
      }
    } else if (platData.dateAdded) {
      dateAdded = platData.dateAdded
      console.log("📅 Date extraite (format alternatif):", dateAdded)
    } else {
      console.log("⚠️ Date non trouvée, utilisation de la date actuelle:", dateAdded)
    }

    // Extraire les calories (plusieurs formats possibles)
    const calories = platData.calorie || platData.calories || 0
    console.log("🔥 Calories extraites:", calories)

    // Extraire la description (plusieurs formats possibles)
    const description = platData.description || ""
    console.log("📝 Description extraite:", description ? description.substring(0, 30) + "..." : "Non fournie")

    // Extraire le nombre de commandes (plusieurs formats possibles)
    const orders = platData.commandes || platData.orders || 0
    console.log("🛒 Commandes extraites:", orders)

    // Extraire la note (plusieurs formats possibles)
    const rating = platData.rating || platData.note || 0
    console.log("⭐ Note extraite:", rating)

    // Construire l'objet formaté
    const formattedPlat = {
      id: id,
      name: name,
      category: category,
      price: price,
      rating: rating,
      dateAdded: dateAdded,
      description: description,
      calories: calories,
      orders: orders,
      ingredients: ingredients,
      healthAlerts: healthAlerts,
      image: platData.image || `https://placehold.co/300x300/png?text=${encodeURIComponent(name || "plat")}`,
    }

    console.log("✅ Plat formaté:", JSON.stringify(formattedPlat).substring(0, 100) + "...")
    return formattedPlat
  },

  /**
   * Fonction pour inspecter en détail la structure de la réponse API
   */
  inspectApiResponse: async () => {
    try {
      console.log("🔍 Inspection détaillée de la réponse API...")
      const response = await axios.get(`${API_URL}/Gerant_plat`)

      // Log the complete response structure
      console.log("📊 Structure complète de la réponse:", JSON.stringify(response.data, null, 2))

      // If it's an array, inspect the first item
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("📋 Structure du premier élément:", JSON.stringify(response.data[0], null, 2))

        // Log all available keys and their types
        const firstItem = response.data[0]
        const keyTypes = {}
        Object.keys(firstItem).forEach((key) => {
          keyTypes[key] = typeof firstItem[key]
          if (Array.isArray(firstItem[key])) {
            keyTypes[key] = `Array[${firstItem[key].length}]`
          } else if (typeof firstItem[key] === "object" && firstItem[key] !== null) {
            keyTypes[key] = `Object{${Object.keys(firstItem[key]).join(", ")}}`
          }
        })
        console.log("🔑 Types des propriétés:", keyTypes)
      }

      return response.data
    } catch (error) {
      console.error("❌ Erreur lors de l'inspection:", error)
      throw error
    }
  },
  /**
   * Fonction pour récupérer et analyser en détail la structure de la réponse API
   */
  getDetailedApiStructure: async () => {
    try {
      console.log("🔍 Analyse détaillée de la structure API...")
      const response = await axios.get(`${API_URL}/Gerant_plat`)

      // Fonction pour explorer récursivement l'objet et trouver des tableaux
      const findArraysInObject = (obj, path = "") => {
        const arrays = []

        if (Array.isArray(obj)) {
          arrays.push({ path, array: obj })
        } else if (typeof obj === "object" && obj !== null) {
          Object.keys(obj).forEach((key) => {
            const newPath = path ? `${path}.${key}` : key
            const found = findArraysInObject(obj[key], newPath)
            arrays.push(...found)
          })
        }

        return arrays
      }

      // Trouver tous les tableaux dans la réponse
      const allArrays = findArraysInObject(response.data)
      console.log(
        "🔍 Tableaux trouvés dans la réponse:",
        allArrays.map((item) => `${item.path} (${item.array.length} éléments)`),
      )

      // Analyser chaque tableau pour voir s'il contient des plats
      for (const { path, array } of allArrays) {
        if (array.length > 0) {
          console.log(`\n📊 Analyse du tableau à ${path} (${array.length} éléments):`)
          const firstItem = array[0]
          console.log("🔑 Clés du premier élément:", Object.keys(firstItem))

          // Vérifier si cet élément ressemble à un plat
          const hasName = firstItem.nom || firstItem.nom_plat || firstItem.name
          const hasPrice = firstItem.prix !== undefined || firstItem.price !== undefined
          const hasCategory = firstItem.categorie || firstItem.category

          console.log(`📋 Caractéristiques: nom=${!!hasName}, prix=${!!hasPrice}, catégorie=${!!hasCategory}`)

          if (hasName || hasPrice || hasCategory) {
            console.log("✅ Ce tableau semble contenir des plats!")
            console.log("📝 Premier élément:", JSON.stringify(firstItem, null, 2))
          }
        }
      }

      return {
        rawData: response.data,
        arrays: allArrays,
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'analyse:", error)
      throw error
    }
  },
}

export default PlatsApi
