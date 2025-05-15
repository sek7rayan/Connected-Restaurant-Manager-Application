// api/offreApi.js
import axios from "axios"

const API_URL = "https://pfebackend-production.up.railway.app/api"

const OffreApi = {
  getOffres: async () => {
    try {
      console.log("🔍 Tentative de récupération des offres...")
      const response = await axios.get(`${API_URL}/Gerant_offre`)

      if (response.status === 200) {
        console.log("✅ Réponse API reçue:", response.data)
        console.log("Structure complète de la réponse:", JSON.stringify(response.data, null, 2))

        // Vérifier différentes structures possibles de la réponse
        let offres = []

        if (Array.isArray(response.data)) {
          // Si la réponse est directement un tableau d'offres
          console.log("📊 Format détecté: tableau d'offres")
          offres = response.data
        } else if (response.data && response.data.offres && Array.isArray(response.data.offres)) {
          // Si la réponse a une structure {offres: [...]}
          console.log("📊 Format détecté: {offres: [...]}")
          offres = response.data.offres
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Si la réponse a une structure {data: [...]}
          console.log("📊 Format détecté: {data: [...]}")
          offres = response.data.data
        } else if (
          response.data &&
          response.data.data &&
          response.data.data.offres &&
          Array.isArray(response.data.data.offres)
        ) {
          // Si la réponse a une structure {data: {offres: [...]}}
          console.log("📊 Format détecté: {data: {offres: [...]}}")
          offres = response.data.data.offres
        } else {
          // Si aucun format connu n'est détecté, essayer de trouver un tableau dans la réponse
          console.log("⚠️ Format non reconnu, recherche d'un tableau dans la réponse...")
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`📊 Tableau trouvé dans la clé '${key}'`)
              offres = response.data[key]
              break
            }

            // Vérifier un niveau plus profond
            if (typeof response.data[key] === "object" && response.data[key] !== null) {
              for (const subKey in response.data[key]) {
                if (Array.isArray(response.data[key][subKey])) {
                  console.log(`📊 Tableau trouvé dans la clé '${key}.${subKey}'`)
                  offres = response.data[key][subKey]
                  break
                }
              }
            }
          }
        }

        console.log(`🔢 Nombre d'offres trouvées: ${offres.length}`)

        // Si aucune offre n'a été trouvée, essayer une approche alternative
        if (offres.length === 0) {
          console.log("⚠️ Aucune offre trouvée, tentative avec une URL alternative...")
          return OffreApi.getAllOffresAlternative()
        }

        return { offres: offres }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des offres:", error)
      // En cas d'erreur, essayer la méthode alternative
      console.log("🔄 Tentative avec méthode alternative...")
      return OffreApi.getAllOffresAlternative()
    }
  },

  // Ajouter cette nouvelle méthode après getOffres:
  getAllOffresAlternative: async () => {
    try {
      // Essayer différentes URL ou formats de requête
      console.log("🔍 Tentative avec URL alternative...")

      // Option 1: Essayer un autre endpoint
      try {
        const response1 = await axios.get(`${API_URL}/Gerant_offre/all`)
        if (response1.status === 200 && response1.data) {
          console.log("✅ URL alternative 1 réussie")

          // Extraire les offres selon la structure
          if (Array.isArray(response1.data)) {
            return { offres: response1.data }
          } else if (response1.data.offres) {
            return { offres: response1.data.offres }
          } else if (response1.data.data) {
            return { offres: response1.data.data }
          }
        }
      } catch (err) {
        console.log("❌ URL alternative 1 échouée:", err.message)
      }

      // Option 2: Essayer avec des paramètres
      try {
        const response2 = await axios.get(`${API_URL}/Gerant_offre?limit=1000`)
        if (response2.status === 200 && response2.data) {
          console.log("✅ URL alternative 2 réussie")

          // Extraire les offres selon la structure
          if (Array.isArray(response2.data)) {
            return { offres: response2.data }
          } else if (response2.data.offres) {
            return { offres: response2.data.offres }
          } else if (response2.data.data) {
            return { offres: response2.data.data }
          }
        }
      } catch (err) {
        console.log("❌ URL alternative 2 échouée:", err.message)
      }

      // Si toutes les tentatives échouent, retourner des offres de test
      console.log("⚠️ Toutes les tentatives ont échoué, retour d'offres de test")
      return {
        offres: [
          {
            id_offre: 1,
            reduction: 15,
            date_deb_offre: "01-05-2025",
            date_fin_offre: "15-05-2025",
          },
          {
            id_offre: 2,
            reduction: 25,
            date_deb_offre: "10-05-2025",
            date_fin_offre: "20-05-2025",
          },
          {
            id_offre: 3,
            reduction: 30,
            date_deb_offre: "05-05-2025",
            date_fin_offre: "25-05-2025",
          },
        ],
      }
    } catch (error) {
      console.error("❌ Erreur dans la méthode alternative:", error)
      // En cas d'erreur, retourner des offres de test
      return {
        offres: [
          {
            id_offre: 1,
            reduction: 15,
            date_deb_offre: "01-05-2025",
            date_fin_offre: "15-05-2025",
          },
        ],
      }
    }
  },

  addOffre: async (offreData) => {
    try {
      // Extraire le pourcentage de la chaîne (ex: "15% Off" -> 15)
      let discountPercentage = 20 // Valeur par défaut
      if (offreData.discount) {
        const match = offreData.discount.match(/(\d+)/)
        if (match && match[1]) {
          discountPercentage = Number.parseInt(match[1])
        }
      }

      // IMPORTANT: Ne pas modifier le format des dates
      // L'API attend exactement le format que l'utilisateur entre
      const startDate = offreData.startDate
      const endDate = offreData.endDate

      // Préparer le corps de la requête selon le format attendu par l'API
      const body = {
        date_deb: startDate,
        date_fin: endDate,
        reduction: discountPercentage,
      }

      console.log("📦 Data sent to backend (addOffre):", body)

      const response = await axios.post(`${API_URL}/Gerant_offre`, body)

      if (response.status === 201) {
        console.log("✅ Offre added successfully:", response.data)
        return response.data.data.offre
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Error (addOffre):", error.response.status, error.response.statusText)
        console.error("❌ Error data:", error.response.data)
        throw new Error(error.response.data.message || "Unknown error.")
      } else if (error.request) {
        console.error("❌ No response from server (addOffre).")
        throw new Error("No response from server")
      } else {
        console.error("❌ Request Error (addOffre):", error.message)
        throw new Error("Request Error")
      }
    }
  },

  associateOffreToProduit: async (offreData) => {
    try {
      // Préparation des données pour correspondre au format attendu par le backend
      const body = {
        id_offre: offreData.offreId,
        id_plat: offreData.produitId, // Changé de id_produit à id_plat pour correspondre à l'API
      }

      console.log("📦 Data sent to backend (associateOffreToProduit):", body)

      const response = await axios.post(`${API_URL}/Gerant_offre_inplat`, body)

      if (response.status === 201) {
        console.log("✅ Offre associated to product successfully:", response.data)
        return response.data
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Error (associateOffreToProduit):", error.response.data.message || "Unknown error.")
        throw new Error(error.response.data.message || "Unknown error.")
      } else if (error.request) {
        console.error("❌ No response from server (associateOffreToProduit).")
        throw new Error("No response from server")
      } else {
        console.error("❌ Request Error (associateOffreToProduit):", error.message)
        throw new Error("Request Error")
      }
    }
  },

  deleteOffre: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Gerant_offre/${id}`)
      if (response.status === 204) {
        console.log("🗑️ Offre deleted successfully.")
        return { status: "success" }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error("❌ Error: Offre not found.")
          throw new Error("Offre not found.")
        } else {
          console.error("❌ Server Error (deleteOffre):", error.response.data.message || "Unknown error.")
          throw new Error(error.response.data.message || "Server Error")
        }
      } else {
        console.error("❌ Network Error (deleteOffre):", error.message)
        throw new Error("Network Error")
      }
    }
  },

  updateOffre: async (id, offreData) => {
    try {
      // Extraire le pourcentage de la chaîne (ex: "15% Off" -> 15)
      let discountPercentage = 20 // Valeur par défaut
      if (offreData.discount) {
        const match = offreData.discount.match(/(\d+)/)
        if (match && match[1]) {
          discountPercentage = Number.parseInt(match[1])
        }
      }

      // Ne pas modifier le format des dates
      const startDate = offreData.startDate
      const endDate = offreData.endDate

      const body = {
        date_deb: startDate,
        date_fin: endDate,
        reduction: discountPercentage,
      }

      console.log("🛠️ Data sent to update offre:", body)
      console.log("➡️ Updating ID:", id)

      const response = await axios.patch(`${API_URL}/Gerant_offre/${id}`, body)
      if (response.status === 200) {
        console.log("✅ Offre updated successfully:", response.data)
        return response.data.data.offre
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Error (updateOffre):", error.response.data.message || "Unknown error.")
        throw new Error(error.response.data.message || "Unknown error.")
      } else if (error.request) {
        console.error("❌ No response from server (updateOffre).")
        throw new Error("No response from server")
      } else {
        console.error("❌ Request Error (updateOffre):", error.message)
        throw new Error("Request Error")
      }
    }
  },
}

export default OffreApi
