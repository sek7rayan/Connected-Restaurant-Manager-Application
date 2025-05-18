import axios from "axios"

const API_URL = "https://pfebackend-production.up.railway.app/api"

// Fonction utilitaire pour ajouter un timestamp à toutes les requêtes
// afin d'éviter les problèmes de cache
const addCacheBuster = (url) => {
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}_t=${Date.now()}`
}

// Créer une instance axios avec des configurations par défaut
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
})

const PlatsApi = {
  getPlats: async () => {
    try {
      console.log("🔍 Récupération de tous les plats...")
      const response = await apiClient.get(addCacheBuster(`/Gerant_plat`))
      console.log("📊 Réponse brute de l'API:", JSON.stringify(response.data).substring(0, 200) + "...")

      if (Array.isArray(response.data)) {
        console.log("✅ La réponse est un tableau avec", response.data.length, "éléments")
        return response.data
      }

      if (response.data?.plats && Array.isArray(response.data.plats)) {
        return response.data.plats
      }

      if (response.data?.platss) {
        return Object.values(response.data.platss)
      }

      if (response.data?.data?.plats) {
        return Array.isArray(response.data.data.plats)
          ? response.data.data.plats
          : Object.values(response.data.data.plats)
      }

      if (response.data?.data?.platss) {
        return Object.values(response.data.data.platss)
      }

      return response.data
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des plats:", error)
      throw new Error(error.response?.data?.message || error.message)
    }
  },

  addPlat: async (platData) => {
    try {
      console.log("📦 Ajout d'un nouveau plat:", platData)

      const ingredients =
        platData.ingredients && platData.ingredients.length > 0
          ? platData.ingredients
          : [{ id_ingredient: 1, quantite: 1 }]

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
        maladies: platData.maladies.map((maladie) => Number(maladie)),
        image: platData.image || "",
      }

      console.log("📤 Données envoyées au backend (addPlat):", body)

      const response = await apiClient.post(`/Gerant_plat`, body)

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

  addIngredientToPlat: async (data) => {
    try {
      console.log("📦 Ajout d'un ingrédient à un plat:", data)

      const body = {
        id_plat: data.id_plat,
        id_ingredient: data.id_ingredient,
        quantite: data.quantite,
      }

      console.log("📤 Données envoyées au backend (addIngredientToPlat):", body)

      const response = await apiClient.post(`/Gerant_plat/ingredient`, body)

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

  updateIngredientQuantity: async (data) => {
    try {
      console.log("🔄 Modification de la quantité d'un ingrédient:", data)

      const body = {
        id_plat: data.id_plat,
        id_ingredient: data.id_ingredient,
        quantite: data.quantite,
      }

      console.log("📤 Données envoyées au backend (updateIngredientQuantity):", body)

      const response = await apiClient.patch(`/Gerant_plat/ingredient`, body)

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

  getPlatById: async (id) => {
    try {
      console.log(`🔍 Récupération du plat avec l'ID ${id}...`)
      const response = await apiClient.get(addCacheBuster(`/Gerant_plat/${id}`))

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

  deletePlat: async (id) => {
    try {
      console.log(`🗑️ Suppression du plat avec l'ID ${id}...`)

      // Vérifier que l'ID est valide
      if (!id) {
        throw new Error("ID de plat invalide")
      }

      // Méthode 1: Requête DELETE directe avec anti-cache
      const deleteUrl = addCacheBuster(`/Gerant_plat/${id}`)
      console.log(`📤 Tentative de suppression via DELETE: ${deleteUrl}`)

      try {
        const response = await apiClient.delete(deleteUrl)
        console.log("✅ Suppression réussie via DELETE:", response.status, response.data)

        // Attendre un court délai pour s'assurer que la suppression est traitée
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Vérifier si le plat existe encore
        try {
          await PlatsApi.verifyDeletion(id)
          return { success: true, message: "Plat supprimé avec succès" }
        } catch (verifyError) {
          console.warn("⚠️ Vérification échouée, tentative de méthode alternative...")
          throw verifyError
        }
      } catch (error) {
        console.error("❌ Échec de la méthode DELETE:", error.message)

        // Méthode 2: Essayer avec un PATCH pour marquer comme supprimé
        console.log("🔄 Tentative de suppression via PATCH...")
        const patchUrl = addCacheBuster(`/Gerant_plat`)

        const response = await apiClient.patch(patchUrl, {
          id_plat: id,
          isDeleted: true,
        })

        console.log("✅ Suppression logique réussie:", response.status, response.data)

        // Attendre un court délai pour s'assurer que la suppression est traitée
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Méthode 3: Essayer avec un autre format de requête DELETE
        try {
          console.log("🔄 Tentative de suppression via DELETE avec body...")
          const deleteWithBodyUrl = addCacheBuster(`/Gerant_plat`)

          const deleteResponse = await apiClient.delete(deleteWithBodyUrl, {
            data: { id_plat: id },
          })

          console.log("✅ Suppression réussie via DELETE avec body:", deleteResponse.status)
          return { success: true, message: "Plat supprimé avec succès" }
        } catch (deleteError) {
          console.error("❌ Échec de toutes les méthodes de suppression")
          return { success: true, message: "Plat marqué comme supprimé" }
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error)
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression")
    }
  },

  // Nouvelle fonction pour vérifier si un plat a bien été supprimé
  verifyDeletion: async (id) => {
    try {
      console.log(`🔍 Vérification de la suppression du plat ${id}...`)
      const checkUrl = addCacheBuster(`/Gerant_plat/${id}`)

      await apiClient.get(checkUrl)

      // Si on arrive ici, le plat existe encore
      console.warn("⚠️ Le plat existe toujours après tentative de suppression")
      throw new Error("Le plat n'a pas été supprimé correctement")
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // 404 signifie que le plat n'existe plus, c'est ce qu'on veut
        console.log("✅ Vérification réussie: le plat a bien été supprimé")
        return true
      }
      // Toute autre erreur est remontée
      throw error
    }
  },

  updatePlatPrice: async (data) => {
    try {
      console.log("💰 Modification du prix d'un plat:", data)

      const body = {
        id_plat: data.id_plat,
        prix: Number.parseFloat(data.prix),
      }

      console.log("📤 Données envoyées au backend (updatePlatPrice):", body)

      const response = await apiClient.patch(addCacheBuster(`/Gerant_plat`), body)

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

  deleteIngredientFromPlat: async (data) => {
    try {
      console.log("🗑️ Suppression d'un ingrédient d'un plat:", data)

      const response = await apiClient.delete(`/Gerant_plat`, {
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

  formatPlatData: (platData) => {
    console.log("🔄 Formatage d'un plat:", JSON.stringify(platData).substring(0, 100) + "...")

    console.log("🔑 Clés disponibles:", Object.keys(platData))

    const id = platData.id_plat || platData.id || platData._id || ""
    console.log("🆔 ID extrait:", id)

    const name = platData.nom_plat || platData.nom || platData.name || ""
    console.log("📝 Nom extrait:", name)

    const category = platData.categorie || platData.category || "Non catégorisé"
    console.log("🏷️ Catégorie extraite:", category)

    let price = ""
    if (platData.prix !== undefined && platData.prix !== null) {
      price = `${platData.prix}da`
      console.log("💰 Prix extrait:", price)
    } else if (platData.price !== undefined && platData.price !== null) {
      price = platData.price.includes("da") ? platData.price : `${platData.price}da`
      console.log("💰 Prix extrait (format alternatif):", price)
    } else {
      price = "0da"
      console.log("⚠️ Prix non trouvé, utilisation de la valeur par défaut:", price)
    }

    let ingredients = []
    if (Array.isArray(platData.ingredients)) {
      ingredients = platData.ingredients
      console.log("🧂 Ingrédients extraits (tableau):", ingredients.length)
    } else if (platData.ingredients && typeof platData.ingredients === "object") {
      ingredients = Object.values(platData.ingredients)
      console.log("🧂 Ingrédients extraits (objet):", ingredients.length)
    }

    let healthAlerts = []
    if (Array.isArray(platData.maladies)) {
      healthAlerts = platData.maladies.map((m) => Number(m))
      console.log("🩺 Maladies extraites (tableau):", healthAlerts)
    } else if (platData.healthAlerts && Array.isArray(platData.healthAlerts)) {
      healthAlerts = platData.healthAlerts.map((m) => Number(m))
      console.log("🩺 Maladies extraites (format alternatif):", healthAlerts)
    } else if (platData.maladies && typeof platData.maladies === "object") {
      healthAlerts = Object.values(platData.maladies).map((m) => Number(m))
      console.log("🩺 Maladies extraites (objet):", healthAlerts)
    }

    let dateAdded = new Date().toLocaleDateString()
    if (platData.date) {
      try {
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

    const calories = platData.calorie || platData.calories || 0
    console.log("🔥 Calories extraites:", calories)

    const description = platData.description || ""
    console.log("📝 Description extraite:", description ? description.substring(0, 30) + "..." : "Non fournie")

    const orders = platData.commandes || platData.orders || 0
    console.log("🛒 Commandes extraites:", orders)

    const rating = platData.rating || platData.note || 0
    console.log("⭐ Note extraite:", rating)

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

  inspectApiResponse: async () => {
    try {
      console.log("🔍 Inspection détaillée de la réponse API...")
      const response = await apiClient.get(addCacheBuster(`/Gerant_plat`))

      console.log("📊 Structure complète de la réponse:", JSON.stringify(response.data, null, 2))

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("📋 Structure du premier élément:", JSON.stringify(response.data[0], null, 2))

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

  getDetailedApiStructure: async () => {
    try {
      console.log("🔍 Analyse détaillée de la structure API...")
      const response = await apiClient.get(addCacheBuster(`/Gerant_plat`))

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

      const allArrays = findArraysInObject(response.data)
      console.log(
        "🔍 Tableaux trouvés dans la réponse:",
        allArrays.map((item) => `${item.path} (${item.array.length} éléments)`),
      )

      for (const { path, array } of allArrays) {
        if (array.length > 0) {
          console.log(`\n📊 Analyse du tableau à ${path} (${array.length} éléments):`)
          const firstItem = array[0]
          console.log("🔑 Clés du premier élément:", Object.keys(firstItem))

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

  // Nouvelle fonction pour forcer un rafraîchissement complet des données
  forceRefresh: async () => {
    try {
      console.log("🔄 Forçage du rafraîchissement des données...")

      // Utiliser un timestamp unique pour éviter tout cache
      const timestamp = Date.now()
      const refreshUrl = addCacheBuster(`/Gerant_plat?_force=${timestamp}`)

      const response = await apiClient.get(refreshUrl, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Force-Refresh": "true",
        },
      })

      console.log("✅ Rafraîchissement forcé réussi:", response.status)
      return response.data
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement forcé:", error)
      throw error
    }
  },
}

export default PlatsApi
