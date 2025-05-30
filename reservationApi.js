// api/reservationApi.js
import axios from "axios"

const API_URL = "https://pfebackend-production.up.railway.app/api"

const ReservationApi = {
  /**
   * 1. Obtenir toutes les réservations
   * GET /reservation
   */
  getReservations: async () => {
    try {
      console.log("🔍 Récupération de toutes les réservations...")
      const response = await axios.get(`${API_URL}/reservation`)
      console.log("📊 Réponse brute de l'API:", JSON.stringify(response.data).substring(0, 200) + "...")

      // Vérifier si la réponse est au format attendu
      if (response.data && response.data.status === "success" && response.data.data && response.data.data.reservation) {
        console.log("✅ Réservations récupérées avec succès:", response.data.data.reservation.length)
        return response.data.data.reservation
      } else {
        // Explorer la structure de la réponse pour trouver les réservations
        console.log("⚠️ Format de réponse non standard, tentative d'extraction des réservations...")
        console.log("🔍 Type de la réponse:", typeof response.data)

        if (typeof response.data === "object") {
          console.log("🔑 Clés disponibles:", Object.keys(response.data))

          // Cas 1: Les réservations sont directement dans la réponse
          if (Array.isArray(response.data)) {
            console.log("✅ La réponse est un tableau avec", response.data.length, "éléments")
            return response.data
          }

          // Cas 2: Les réservations sont dans un champ 'data'
          if (response.data.data) {
            if (Array.isArray(response.data.data)) {
              console.log("✅ Réservations trouvées dans response.data.data:", response.data.data.length)
              return response.data.data
            }

            // Parcourir les clés de data pour trouver un tableau
            for (const key in response.data.data) {
              if (Array.isArray(response.data.data[key])) {
                console.log(`✅ Réservations trouvées dans response.data.data.${key}:`, response.data.data[key].length)
                return response.data.data[key]
              }
            }
          }

          // Cas 3: Parcourir toutes les clés pour trouver un tableau
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`✅ Réservations trouvées dans response.data.${key}:`, response.data[key].length)
              return response.data[key]
            }
          }
        }

        console.log("⚠️ Aucune réservation trouvée dans la réponse")
        return []
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des réservations:", error)

      if (error.response) {
        if (error.response.status === 404) {
          console.log("ℹ️ Aucune réservation trouvée (404)")
          return []
        }
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
   * Méthode utilitaire pour formater les données de réservation
   */
  formatReservationData: (reservation) => {
    console.log("🔄 Formatage d'une réservation:", JSON.stringify(reservation).substring(0, 100) + "...")

    // Extraire l'ID de la réservation
    const id = reservation.id_reserv || reservation.id || ""

    // Extraire l'ID du client
    const clientId = reservation.id_client || ""

    // Extraire l'ID de la table
    const tableId = reservation.id_table || ""

    // Extraire le nombre de personnes
    const personCount = reservation.nb_personne || 0

    // Formater la date et l'heure de début
    let startDateTime = "Non spécifié"
    if (reservation.date_deb_res) {
      try {
        const date = new Date(reservation.date_deb_res)
        if (!isNaN(date.getTime())) {
          // Format: "15 Oct 2023, 18:00"
          startDateTime = date.toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
      } catch (e) {
        console.log("⚠️ Erreur lors du parsing de la date de début:", e)
      }
    }

    // Formater la date et l'heure de fin
    let endDateTime = "Non spécifié"
    if (reservation.date_fin_res) {
      try {
        const date = new Date(reservation.date_fin_res)
        if (!isNaN(date.getTime())) {
          // Format: "15 Oct 2023, 20:00"
          endDateTime = date.toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
      } catch (e) {
        console.log("⚠️ Erreur lors du parsing de la date de fin:", e)
      }
    }

    // Calculer la durée en heures et minutes
    let duration = "Non calculable"
    if (reservation.date_deb_res && reservation.date_fin_res) {
      try {
        const startDate = new Date(reservation.date_deb_res)
        const endDate = new Date(reservation.date_fin_res)

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const durationMs = endDate.getTime() - startDate.getTime()
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
          const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

          if (durationHours > 0) {
            duration = `${durationHours}h`
            if (durationMinutes > 0) {
              duration += ` ${durationMinutes}min`
            }
          } else {
            duration = `${durationMinutes}min`
          }
        }
      } catch (e) {
        console.log("⚠️ Erreur lors du calcul de la durée:", e)
      }
    }

    // Déterminer le statut de la réservation
    let status = "Planifiée"
    const now = new Date()

    try {
      const startDate = new Date(reservation.date_deb_res)
      const endDate = new Date(reservation.date_fin_res)

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (now > endDate) {
          status = "Terminée"
        } else if (now >= startDate && now <= endDate) {
          status = "En cours"
        } else if (now < startDate) {
          // Calculer combien de temps avant le début
          const timeUntilStart = startDate.getTime() - now.getTime()
          const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60))

          if (hoursUntilStart < 1) {
            status = "Imminente"
          } else if (hoursUntilStart < 24) {
            status = "Aujourd'hui"
          } else {
            status = "Planifiée"
          }
        }
      }
    } catch (e) {
      console.log("⚠️ Erreur lors de la détermination du statut:", e)
    }

    // Construire l'objet formaté
    const formattedReservation = {
      id,
      clientId,
      tableId,
      personCount,
      startDateTime,
      endDateTime,
      duration,
      status,
      rawData: reservation, // Conserver les données brutes pour référence
    }

    console.log("✅ Réservation formatée:", JSON.stringify(formattedReservation).substring(0, 100) + "...")
    return formattedReservation
  },
}

export default ReservationApi
