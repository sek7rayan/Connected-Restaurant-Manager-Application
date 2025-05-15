"use client"

// screens/MenuScreen.js
import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Feather, Ionicons } from "@expo/vector-icons"
import DraggableSidebar from "../components/DraggableSidebar"
import { useSidebar } from "../context/SidebarContext"
import PlatsApi from "../api/platsApi"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"

// Définir l'URL de l'API si elle n'est pas déjà définie dans config.js
const API_URL = "https://pfebackend-production.up.railway.app/api"

const MenuScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false)
  const [newPrice, setNewPrice] = useState("")
  const [showAddPlateModal, setShowAddPlateModal] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showHealthDropdown, setShowHealthDropdown] = useState(false)
  const [showIngredientsDropdown, setShowIngredientsDropdown] = useState(false)
  const [rawApiData, setRawApiData] = useState(null) // Pour stocker les données brutes de l'API

  // Add Plate Form State
  const [newPlate, setNewPlate] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "Beverage",
    calorie: "",
    date: new Date().toISOString().split("T")[0],
    ingredients: [],
    maladies: [],
    image: "", // Champ image comme texte (URL)
  })

  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [currentIngredient, setCurrentIngredient] = useState({ id_ingredient: "", quantite: 1 })
  const [selectedHealthAlerts, setSelectedHealthAlerts] = useState([]) // Pour les maladies

  // Remplacer useEffect par useFocusEffect pour recharger les plats à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Menu Screen a reçu le focus - Rechargement des plats...")
      fetchPlatsDirectly() // Utiliser la nouvelle fonction qui récupère directement les données
      return () => {
        // Nettoyage si nécessaire
      }
    }, []),
  )

  // Ajoutez cette fonction pour inspecter la structure exacte de la réponse API
  const inspectApiStructure = async () => {
    try {
      setLoading(true)
      console.log("🔍 Inspection détaillée de la structure API...")

      // Faire une requête directe à l'API
      const response = await axios.get(`${API_URL}/Gerant_plat`)

      // Afficher la structure complète du premier élément
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("📊 Structure complète du premier plat:", JSON.stringify(response.data[0], null, 2))

        // Afficher toutes les clés disponibles
        const firstItem = response.data[0]
        console.log("🔑 Toutes les clés disponibles:", Object.keys(firstItem))

        // Afficher les valeurs de chaque clé
        Object.keys(firstItem).forEach((key) => {
          console.log(`${key}:`, firstItem[key])
        })

        Alert.alert("Structure du plat", `Clés disponibles: ${Object.keys(firstItem).join(", ")}`, [
          { text: "OK" },
          {
            text: "Voir détails",
            onPress: () => {
              Alert.alert("Valeurs", JSON.stringify(firstItem, null, 2).substring(0, 1000))
            },
          },
        ])
      } else {
        Alert.alert("Information", "Aucun plat trouvé pour l'inspection")
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'inspection:", error)
      Alert.alert("Erreur", "Impossible d'inspecter la structure: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Remplacez la fonction fetchPlatsDirectly par cette version améliorée
  const fetchPlatsDirectly = async () => {
    try {
      setLoading(true)
      console.log("🔍 Récupération directe des plats depuis l'API...")

      // Faire une requête directe à l'API
      const response = await axios.get(`${API_URL}/Gerant_plat`)

      // Stocker les données brutes pour inspection
      setRawApiData(response.data)

      console.log("📊 RÉPONSE API COMPLÈTE:", JSON.stringify(response.data))
      console.log("🔍 Type de la réponse:", typeof response.data)

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

      // Essayer de trouver le tableau qui contient les plats
      let platsData = []
      let platsPath = ""

      // Parcourir tous les tableaux trouvés et chercher celui qui ressemble le plus à des plats
      for (const { path, array } of allArrays) {
        if (array.length > 0) {
          const firstItem = array[0]
          // Vérifier si cet élément ressemble à un plat (a un nom ou un prix)
          if (
            firstItem &&
            typeof firstItem === "object" &&
            (firstItem.nom ||
              firstItem.nom_plat ||
              firstItem.name ||
              firstItem.prix !== undefined ||
              firstItem.price !== undefined)
          ) {
            platsData = array
            platsPath = path
            console.log(`✅ Tableau de plats trouvé dans: ${path}`)
            break
          }
        }
      }

      // Si aucun tableau n'a été identifié comme contenant des plats, prendre le premier tableau non vide
      if (platsData.length === 0 && allArrays.length > 0) {
        for (const { path, array } of allArrays) {
          if (array.length > 0) {
            platsData = array
            platsPath = path
            console.log(`⚠️ Aucun tableau de plats identifié, utilisation du premier tableau trouvé: ${path}`)
            break
          }
        }
      }

      if (platsData.length > 0) {
        // Afficher le premier plat pour comprendre sa structure
        console.log("🔍 Structure du premier plat:", JSON.stringify(platsData[0], null, 2))
        console.log("🔑 Clés disponibles dans le premier plat:", Object.keys(platsData[0]))

        // Fonction pour explorer un objet et trouver des valeurs par type ou nom de clé
        const findValuesByPattern = (obj, patterns) => {
          const results = {}

          const explore = (o, currentPath = "") => {
            if (!o || typeof o !== "object") return

            Object.entries(o).forEach(([key, value]) => {
              const path = currentPath ? `${currentPath}.${key}` : key

              // Vérifier si cette clé correspond à l'un des patterns
              for (const [patternName, pattern] of Object.entries(patterns)) {
                if (
                  !results[patternName] &&
                  ((typeof pattern === "string" && key.toLowerCase().includes(pattern.toLowerCase())) ||
                    (pattern instanceof RegExp && pattern.test(key)))
                ) {
                  results[patternName] = { value, path }
                }
              }

              // Explorer récursivement si c'est un objet
              if (value && typeof value === "object" && !Array.isArray(value)) {
                explore(value, path)
              }
            })
          }

          explore(obj)
          return results
        }

        // Formater manuellement les plats avec une exploration approfondie
        const formattedPlats = platsData.map((plat, index) => {
          console.log(`\n🍽️ Traitement du plat ${index + 1}:`, plat.nom || plat.nom_plat || plat.name || "Nom inconnu")

          // Chercher des valeurs spécifiques dans l'objet plat
          const foundValues = findValuesByPattern(plat, {
            id: /(^|_)id$|^id_plat$/i,
            name: /^nom|^name|nom_plat$/i,
            category: /categ|category/i,
            price: /^prix|^price$/i,
            description: /desc/i,
            calorie: /calor/i,
            rating: /rat|note/i,
            date: /^date/i,
            image: /^image|^img$/i,
            ingredients: /ingred/i,
            maladies: /malad|health/i,
          })

          console.log(
            "🔍 Valeurs trouvées par pattern:",
            Object.entries(foundValues).map(
              ([k, v]) => `${k}: ${v.path} = ${JSON.stringify(v.value).substring(0, 50)}`,
            ),
          )

          // Extraire l'ID
          let id = ""
          if (foundValues.id) {
            id = foundValues.id.value
          } else if (plat.id_plat !== undefined) {
            id = plat.id_plat
          } else if (plat.id !== undefined) {
            id = plat.id
          } else if (plat._id !== undefined) {
            id = plat._id
          }
          console.log("🆔 ID extrait:", id)

          // Extraire le nom
          let name = ""
          if (foundValues.name) {
            name = foundValues.name.value
          } else if (plat.nom_plat !== undefined) {
            name = plat.nom_plat
          } else if (plat.nom !== undefined) {
            name = plat.nom
          } else if (plat.name !== undefined) {
            name = plat.name
          }
          console.log("📝 Nom extrait:", name)

          // Extraire la catégorie
          let category = "Non catégorisé"
          if (foundValues.category) {
            category = foundValues.category.value
          } else if (plat.categorie !== undefined && plat.categorie !== null && plat.categorie !== "") {
            category = plat.categorie
          } else if (plat.category !== undefined && plat.category !== null && plat.category !== "") {
            category = plat.category
          }
          console.log("🏷️ Catégorie extraite:", category)

          // Extraire le prix
          let price = "0"
          if (foundValues.price) {
            price = String(foundValues.price.value)
          } else if (plat.prix !== undefined && plat.prix !== null) {
            price = String(plat.prix)
          } else if (plat.price !== undefined && plat.price !== null) {
            price = String(plat.price).replace("da", "")
          }
          console.log("💰 Prix extrait:", price)

          // Extraire la description
          let description = ""
          if (foundValues.description) {
            description = foundValues.description.value
          } else if (plat.description !== undefined && plat.description !== null) {
            description = plat.description
          }
          console.log("📄 Description extraite:", description)

          // Extraire les calories
          let calorie = 0
          if (foundValues.calorie) {
            calorie = Number(foundValues.calorie.value)
          } else if (plat.calorie !== undefined && plat.calorie !== null) {
            calorie = Number(plat.calorie)
          } else if (plat.calories !== undefined && plat.calories !== null) {
            calorie = Number(plat.calories)
          }
          console.log("🔥 Calories extraites:", calorie)

          // Extraire la note
          let rating = 0
          if (foundValues.rating) {
            rating = Number(foundValues.rating.value)
          } else if (plat.rating !== undefined && plat.rating !== null) {
            rating = Number(plat.rating)
          } else if (plat.note !== undefined && plat.note !== null) {
            rating = Number(plat.note)
          }
          console.log("⭐ Note extraite:", rating)

          // Extraire la date
          let dateAdded = ""
          let rawDate = ""

          // Vérifier toutes les sources possibles de date
          if (foundValues.date) {
            rawDate = foundValues.date.value
            console.log("🔍 Date trouvée via pattern:", rawDate)
          } else if (plat.date) {
            rawDate = plat.date
            console.log("🔍 Date trouvée directement:", rawDate)
          } else {
            // Chercher explicitement dans toutes les propriétés pour une date
            Object.entries(plat).forEach(([key, value]) => {
              if (key.toLowerCase().includes("date") && value && typeof value === "string") {
                rawDate = value
                console.log(`🔍 Date trouvée dans la propriété ${key}:`, rawDate)
              }
            })
          }

          console.log("🔍 Date brute extraite:", rawDate)

          // Si une date a été trouvée
          if (rawDate && typeof rawDate === "string") {
            // Vérifier si la date est au format YYYY-MM-DD
            const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (dateMatch) {
              // Convertir en format DD/MM/YYYY pour l'affichage
              const [_, year, month, day] = dateMatch
              dateAdded = `${day}/${month}/${year}`
              console.log("📅 Date convertie de YYYY-MM-DD à DD/MM/YYYY:", dateAdded)
            } else {
              // Si ce n'est pas au format attendu, utiliser la date telle quelle
              dateAdded = rawDate
              console.log("📅 Date utilisée telle quelle:", dateAdded)
            }
          } else {
            console.log("⚠️ Aucune date valide trouvée dans l'objet plat")
            // Utiliser une date par défaut au format DD/MM/YYYY
            dateAdded = "01/01/2023"
            console.log("📅 Date par défaut utilisée:", dateAdded)
          }

          console.log("📅 Date finale utilisée pour l'affichage:", dateAdded)

          // Extraire l'image
          let image = ""
          if (foundValues.image) {
            image = foundValues.image.value
          } else if (plat.image !== undefined && plat.image !== null) {
            image = plat.image
          }
          console.log("🖼️ Image extraite:", image)

          // Extraire les ingrédients
          let ingredients = []
          if (foundValues.ingredients && Array.isArray(foundValues.ingredients.value)) {
            ingredients = foundValues.ingredients.value
          } else if (Array.isArray(plat.ingredients)) {
            ingredients = plat.ingredients
          } else if (plat.ingredients && typeof plat.ingredients === "object") {
            ingredients = Object.values(plat.ingredients)
          }
          console.log("🧂 Ingrédients extraits:", ingredients.length)

          // Extraire les maladies
          let healthAlerts = []
          if (foundValues.maladies && Array.isArray(foundValues.maladies.value)) {
            healthAlerts = foundValues.maladies.value.map((m) => Number(m))
          } else if (Array.isArray(plat.maladies)) {
            healthAlerts = plat.maladies.map((m) => Number(m))
          } else if (plat.maladies && typeof plat.maladies === "object") {
            healthAlerts = Object.values(plat.maladies).map((m) => Number(m))
          } else if (Array.isArray(plat.healthAlerts)) {
            healthAlerts = plat.healthAlerts.map((m) => Number(m))
          }
          console.log("🩺 Maladies extraites:", healthAlerts)

          // Construire l'objet formaté
          return {
            id: id,
            name: name || `Plat ${index + 1}`,
            category: category,
            price: price ? `${price}da` : "0da",
            rating: rating,
            dateAdded: dateAdded,
            description: description,
            calories: calorie,
            orders: plat.commandes || plat.orders || 0,
            ingredients: ingredients,
            healthAlerts: healthAlerts,
            image: image || `https://placehold.co/300x300/png?text=${encodeURIComponent(name || "plat")}`,
          }
        })

        console.log("✅ Plats formatés manuellement:", formattedPlats.length)
        if (formattedPlats.length > 0) {
          console.log("📋 Premier plat formaté (exemple):", JSON.stringify(formattedPlats[0], null, 2))
        }

        setMenuItems(formattedPlats)
      } else {
        console.log("⚠️ Aucun plat trouvé dans la réponse")
        Alert.alert("Information", "Aucun plat trouvé dans la base de données.")
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des plats:", error)
      Alert.alert("Erreur", "Impossible de récupérer les plats: " + error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fonction pour afficher les données brutes de l'API
  const showRawApiData = () => {
    if (rawApiData) {
      // Convertir les données en chaîne JSON formatée
      const formattedData = JSON.stringify(rawApiData, null, 2)

      // Afficher les 1000 premiers caractères dans une alerte
      Alert.alert("Données brutes de l'API", formattedData.substring(0, 1000) + "...", [
        { text: "OK" },
        {
          text: "Voir plus",
          onPress: () => {
            // Afficher plus de détails dans une autre alerte
            Alert.alert(
              "Structure complète",
              typeof rawApiData === "object"
                ? `Type: ${Array.isArray(rawApiData) ? "Array" : "Object"}\nClés: ${Object.keys(rawApiData).join(", ")}`
                : `Type: ${typeof rawApiData}`,
            )
          },
        },
      ])
    } else {
      Alert.alert("Information", "Aucune donnée brute disponible. Veuillez d'abord charger les plats.")
    }
  }

  // Fonction pour rafraîchir les plats
  const onRefresh = () => {
    setRefreshing(true)
    fetchPlatsDirectly()
  }

  // Fonction pour tester l'API
  const testApi = () => {
    console.log("=== TEST API PLATS ===")

    // Test getPlats
    console.log("🔍 Test getPlats...")
    PlatsApi.getPlats()
      .then((data) => console.log("✅ getPlats réussi:", data))
      .catch((err) => console.error("❌ getPlats échoué:", err))
  }

  // Ajouter cette nouvelle fonction:
  const testAddPlat = () => {
    console.log("=== TEST AJOUT PLAT ===")

    // Créer un objet de test minimal
    const testPlat = {
      nom: "Test Plat",
      description: "Description de test",
      prix: "100",
      categorie: "viande",
      calorie: "200",
      ingredients: [{ id_ingredient: 1, quantite: 2 }],
      maladies: [1], // Modifié pour utiliser un nombre
      image: "https://example.com/image.jpg", // URL d'image de test
    }

    console.log("📤 Données de test:", testPlat)

    // Tester l'ajout
    PlatsApi.addPlat(testPlat)
      .then((data) => console.log("✅ Test addPlat réussi:", data))
      .catch((err) => {
        console.error("❌ Test addPlat échoué:", err)
        if (err.response) {
          console.error("📄 Détails de la réponse:", err.response.data)
          console.error("🔢 Statut:", err.response.status)
        }
      })
  }

  // Ajouter cette fonction pour afficher les données brutes de l'API
  const debugApiResponse = async () => {
    try {
      setLoading(true)
      console.log("🔍 Débogage de l'API...")

      // Faire une requête directe à l'API
      const response = await axios.get(`${API_URL}/Gerant_plat`)

      console.log("📊 Réponse brute complète:", response)
      console.log("📊 Données:", JSON.stringify(response.data).substring(0, 1000) + "...")

      // Stocker les données brutes
      setRawApiData(response.data)

      // Afficher une alerte avec les informations de débogage
      Alert.alert(
        "Débogage API",
        `Status: ${response.status}\n` +
          `Type de réponse: ${typeof response.data}\n` +
          `Clés: ${typeof response.data === "object" ? Object.keys(response.data).join(", ") : "N/A"}\n`,
        [
          { text: "OK" },
          {
            text: "Voir plus de détails",
            onPress: () => {
              // Afficher plus de détails dans une autre alerte
              if (typeof response.data === "object") {
                const details = Object.keys(response.data)
                  .map((key) => {
                    const value = response.data[key]
                    if (Array.isArray(value)) {
                      return `${key}: Array[${value.length}]`
                    } else if (typeof value === "object" && value !== null) {
                      return `${key}: Object{${Object.keys(value).join(", ")}}`
                    } else {
                      return `${key}: ${value}`
                    }
                  })
                  .join("\n")

                Alert.alert("Détails de la réponse", details)
              }
            },
          },
        ],
      )
    } catch (error) {
      console.error("❌ Erreur lors du débogage de l'API:", error)

      if (error.response) {
        Alert.alert(
          "Erreur API",
          `Status: ${error.response.status}\n` + `Message: ${JSON.stringify(error.response.data)}`,
        )
      } else {
        Alert.alert("Erreur", "Impossible de contacter l'API: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Ajoutez cette fonction pour afficher la réponse API brute dans une alerte
  const showFullApiResponse = () => {
    if (rawApiData) {
      const jsonString = JSON.stringify(rawApiData, null, 2)

      // Afficher les 2000 premiers caractères dans une alerte
      Alert.alert("Réponse API complète", jsonString.substring(0, 2000) + (jsonString.length > 2000 ? "..." : ""), [
        { text: "OK" },
        {
          text: "Copier dans le presse-papiers",
          onPress: () => {
            // Cette fonction ne fonctionnera pas dans tous les environnements,
            // mais c'est une indication de ce qu'on voudrait faire
            console.log("Copie dans le presse-papiers demandée")
            Alert.alert("Info", "Fonction de copie non disponible dans cet environnement")
          },
        },
      ])
    } else {
      Alert.alert("Information", "Aucune donnée brute disponible. Veuillez d'abord charger les plats.")
    }
  }

  // Fonction pour déboguer les dates des plats
  const debugDates = () => {
    if (rawApiData) {
      console.log("=== DÉBOGAGE DES DATES ===")

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
      const allArrays = findArraysInObject(rawApiData)

      // Chercher des dates dans chaque tableau
      for (const { path, array } of allArrays) {
        if (array.length > 0) {
          console.log(`\n🔍 Examen du tableau à ${path} (${array.length} éléments):`)

          // Examiner le premier élément pour les propriétés de date
          const firstItem = array[0]
          if (typeof firstItem === "object" && firstItem !== null) {
            Object.entries(firstItem).forEach(([key, value]) => {
              if (key.toLowerCase().includes("date")) {
                console.log(`📅 Propriété de date trouvée: ${key} = ${value} (type: ${typeof value})`)
              }
            })
          }

          // Afficher les dates pour les 3 premiers éléments
          const sampleSize = Math.min(3, array.length)
          for (let i = 0; i < sampleSize; i++) {
            const item = array[i]
            if (typeof item === "object" && item !== null) {
              const dateProps = Object.entries(item)
                .filter(([key]) => key.toLowerCase().includes("date"))
                .map(([key, value]) => `${key}: ${value}`)

              if (dateProps.length > 0) {
                console.log(`📋 Élément ${i + 1}: ${dateProps.join(", ")}`)
              }
            }
          }
        }
      }

      Alert.alert("Débogage des dates", "Vérifiez la console pour les détails des dates")
    } else {
      Alert.alert("Information", "Aucune donnée disponible. Veuillez d'abord charger les plats.")
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setNewPrice(item.price.replace("da", ""))
    setShowUpdatePriceModal(true)
  }

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowDetails(true)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  // Fonction améliorée pour la suppression des plats
  const confirmDelete = async () => {
    try {
      setLoading(true)
      console.log(`🗑️ Tentative de suppression du plat avec l'ID ${selectedItem.id}...`)

      // Vérifier que l'ID est valide
      if (!selectedItem.id) {
        throw new Error("ID de plat invalide")
      }

      // Essayer plusieurs méthodes de suppression pour s'assurer que le plat est bien supprimé
      let success = false
      let errorMessage = ""

      // Méthode 1: Utiliser la fonction de l'API
      try {
        await PlatsApi.deletePlat(selectedItem.id)
        console.log("✅ Suppression réussie via PlatsApi.deletePlat")
        success = true
      } catch (error1) {
        console.error("❌ Échec de la méthode 1:", error1.message)
        errorMessage = error1.message

        // Méthode 2: Appel direct à l'API avec axios
        try {
          const deleteUrl = `${API_URL}/Gerant_plat/${selectedItem.id}`
          console.log(`📤 URL de suppression directe: ${deleteUrl}`)

          const response = await axios.delete(deleteUrl)
          console.log("📥 Réponse de suppression directe:", response.status, response.data)

          if (response.status >= 200 && response.status < 300) {
            console.log("✅ Suppression réussie via appel direct")
            success = true
          }
        } catch (error2) {
          console.error("❌ Échec de la méthode 2:", error2.message)
          errorMessage = error2.message

          // Méthode 3: Essayer avec un PATCH pour marquer comme supprimé
          try {
            const patchUrl = `${API_URL}/Gerant_plat`
            console.log(`📤 URL de suppression logique: ${patchUrl}`)

            const response = await axios.patch(patchUrl, {
              id_plat: selectedItem.id,
              isDeleted: true,
            })

            console.log("📥 Réponse de suppression logique:", response.status, response.data)

            if (response.status >= 200 && response.status < 300) {
              console.log("✅ Suppression logique réussie")
              success = true
            }
          } catch (error3) {
            console.error("❌ Échec de la méthode 3:", error3.message)
            errorMessage = error3.message
          }
        }
      }

      if (success) {
        // Supprimer le plat de la liste locale
        setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id))
        setShowDeleteModal(false)
        setSelectedItem(null)

        // Recharger les plats pour s'assurer que la liste est à jour
        setTimeout(() => {
          fetchPlatsDirectly()
        }, 500)

        Alert.alert("Succès", "Plat supprimé avec succès")
      } else {
        throw new Error(`Échec de toutes les tentatives de suppression: ${errorMessage}`)
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error)
      Alert.alert("Erreur", "Impossible de supprimer le plat: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePrice = async () => {
    if (!newPrice || isNaN(Number(newPrice))) {
      Alert.alert("Prix invalide", "Veuillez entrer un prix valide")
      return
    }

    try {
      setLoading(true)
      await PlatsApi.updatePlatPrice({
        id_plat: selectedItem.id,
        prix: newPrice,
      })

      setMenuItems(menuItems.map((item) => (item.id === selectedItem.id ? { ...item, price: `${newPrice}da` } : item)))

      setShowUpdatePriceModal(false)
      setSelectedItem(null)
      Alert.alert("Succès", "Prix mis à jour avec succès")
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du prix:", error)
      Alert.alert("Erreur", "Impossible de mettre à jour le prix: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour ajouter une maladie (health alert)
  // Modifiée pour accepter uniquement des chiffres
  const toggleHealthAlert = (alert) => {
    // Convertir en nombre si c'est une chaîne
    const alertNumber = Number(alert)

    // Vérifier si c'est un nombre valide
    if (isNaN(alertNumber)) {
      Alert.alert("Erreur", "L'identifiant de maladie doit être un nombre")
      return
    }

    if (selectedHealthAlerts.includes(alertNumber)) {
      setSelectedHealthAlerts(selectedHealthAlerts.filter((item) => item !== alertNumber))
    } else {
      setSelectedHealthAlerts([...selectedHealthAlerts, alertNumber])
    }
  }

  const addIngredient = () => {
    console.log("🔍 Tentative d'ajout d'ingrédient:", currentIngredient)

    if (!currentIngredient.id_ingredient) {
      Alert.alert("Information manquante", "Veuillez fournir l'ID de l'ingrédient")
      return
    }

    // Convertir l'ID en nombre si c'est une chaîne
    const ingredientId = Number.parseInt(currentIngredient.id_ingredient)

    if (isNaN(ingredientId)) {
      Alert.alert("ID invalide", "L'ID de l'ingrédient doit être un nombre")
      return
    }

    const newIngredient = {
      id_ingredient: ingredientId, // Utiliser la version numérique
      quantite: currentIngredient.quantite,
    }

    console.log("✅ Ajout de l'ingrédient:", newIngredient)

    setSelectedIngredients([...selectedIngredients, newIngredient])
    setCurrentIngredient({ id_ingredient: "", quantite: 1 })
  }

  const removeIngredient = (index) => {
    console.log("🗑️ Suppression de l'ingrédient à l'index:", index)
    const updatedIngredients = [...selectedIngredients]
    updatedIngredients.splice(index, 1)
    setSelectedIngredients(updatedIngredients)
  }

  // Modifié pour recharger les plats après l'ajout d'un nouveau plat
  const addNewPlate = async () => {
    console.log("🔍 Tentative d'ajout d'un nouveau plat")
    console.log("📋 Données du formulaire:", newPlate)
    console.log("🧂 Ingrédients sélectionnés:", selectedIngredients)
    console.log("🩺 Maladies sélectionnées:", selectedHealthAlerts)

    try {
      // Vérifications de base
      if (!newPlate.nom) {
        console.error("❌ Nom manquant")
        Alert.alert("Information manquante", "Veuillez fournir un nom pour le plat")
        return
      }

      if (!newPlate.prix) {
        console.error("❌ Prix manquant")
        Alert.alert("Information manquante", "Veuillez fournir un prix pour le plat")
        return
      }

      // Vérifier si le prix est un nombre valide
      const prixNumber = Number.parseFloat(newPlate.prix)
      if (isNaN(prixNumber)) {
        console.error("❌ Prix invalide:", newPlate.prix)
        Alert.alert("Prix invalide", "Veuillez entrer un prix valide (nombre)")
        return
      }

      // Vérifier si des ingrédients sont sélectionnés
      if (selectedIngredients.length === 0) {
        console.error("❌ Aucun ingrédient sélectionné")
        Alert.alert("Information manquante", "Veuillez ajouter au moins un ingrédient au plat")
        return
      }

      console.log("✅ Validation du formulaire réussie, préparation des données pour l'API")
      setLoading(true)

      // Préparer les données pour l'API
      const platData = {
        nom: newPlate.nom,
        description: newPlate.description || "Description non fournie",
        prix: prixNumber,
        categorie: newPlate.categorie,
        calorie: Number.parseInt(newPlate.calorie || "0"),
        date: newPlate.date,
        ingredients: selectedIngredients.map((ing) => ({
          id_ingredient: Number(ing.id_ingredient),
          quantite: Number(ing.quantite),
        })),
        // S'assurer que toutes les maladies sont des nombres
        maladies: selectedHealthAlerts.map((alert) => Number(alert)),
        image: newPlate.image || "", // Utiliser l'URL d'image si fournie
      }

      console.log("📤 Données préparées pour l'API:", platData)

      // Ajouter le plat via l'API
      console.log("🔄 Appel de l'API pour ajouter le plat...")
      const result = await PlatsApi.addPlat(platData)
      console.log("✅ Résultat de l'ajout:", result)

      // Afficher un message de succès et recharger les plats
      Alert.alert("Succès", "Plat ajouté avec succès", [
        {
          text: "OK",
          onPress: () => {
            // Fermer le modal et réinitialiser le formulaire
            setShowAddPlateModal(false)
            setNewPlate({
              nom: "",
              description: "",
              prix: "",
              categorie: "Beverage",
              calorie: "",
              date: new Date().toISOString().split("T")[0],
              ingredients: [],
              maladies: [],
              image: "",
            })
            setSelectedIngredients([])
            setSelectedHealthAlerts([])
            console.log("🔄 Formulaire réinitialisé")

            // Recharger tous les plats pour voir le nouveau plat ajouté
            console.log("🔄 Rechargement des plats après ajout...")
            fetchPlatsDirectly()
          },
        },
      ])
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du plat:", error)

      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error("❌ Réponse d'erreur:", error.response.data)
        console.error("❌ Statut:", error.response.status)
        Alert.alert(
          "Erreur du serveur",
          `Impossible d'ajouter le plat: ${error.response.status} - ${error.response.data.message || error.message}`,
        )
      } else if (error.request) {
        console.error("❌ Pas de réponse reçue:", error.request)
        Alert.alert("Erreur réseau", "Aucune réponse reçue du serveur. Vérifiez votre connexion.")
      } else {
        console.error("❌ Erreur de configuration:", error.message)
        Alert.alert("Erreur", "Impossible d'ajouter le plat: " + error.message)
      }
    } finally {
      setLoading(false)
      console.log("🏁 Fin de la tentative d'ajout de plat")
    }
  }

  const categories = [
    "Beverage",
    "Chinese",
    "Dessert",
    "French",
    "Healthy Food",
    "Indian",
    "Italian",
    "Japanese",
    "Korean",
    "Mexican",
    "Nepalese",
    "Snack",
    "Spanish",
    "Thai",
    "Vietnames",
  ]
  const ingredientOptions = ["ing1", "ing2", "ing3", "ing4", "ing5", "ing6"]
  // Modifié pour utiliser des nombres au lieu de chaînes
  const healthOptions = [1, 2, 3, 4, 5]

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItemRow} onPress={() => handleViewDetails(item)}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : ""}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.dateAdded}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(item)}>
          <Feather name="eye" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Feather name="edit" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
          <Feather name="trash-2" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="Menu" />

        {/* Main Content */}
        <ScrollView
          style={[styles.contentContainer, { marginLeft: sidebarWidth }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#ffc107"]} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.ownerInfo}>
              <Feather name="user" size={24} color="#0f172a" style={styles.ownerIcon} />
              <Text style={styles.ownerTitle}>Owner Dashboard</Text>
            </View>
            <View style={styles.adminContainer}>
              <Text style={styles.adminText}>Admin</Text>
              <View style={styles.adminIcon}>
                <Feather name="user" size={20} color="#fff" />
              </View>
            </View>
          </View>

          {/* Search and Add */}
          <View style={styles.searchAddContainer}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Menu items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddPlateModal(true)}>
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Menu item</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <Text style={styles.menuSubtitle}>Manage your restaurant's Menu</Text>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffc107" />
              <Text style={styles.loadingText}>Chargement des plats...</Text>
            </View>
          )}

          {/* Menu Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Category</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Price</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Rating</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Date added</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Actions</Text>
            </View>

            {menuItems.length === 0 && !loading ? (
              <View style={styles.emptyStateContainer}>
                <Feather name="inbox" size={48} color="#e2e8f0" />
                <Text style={styles.emptyStateText}>Aucun plat trouvé</Text>
                <Text style={styles.emptyStateSubText}>Ajoutez un nouveau plat pour commencer</Text>
              </View>
            ) : (
              <FlatList
                data={menuItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* View Details Modal */}
      <Modal animationType="fade" transparent={true} visible={showDetails} onRequestClose={() => setShowDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsTitle}>{selectedItem?.name}</Text>
                <Text style={styles.detailsSubtitle}>Menu item details</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsBody}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsImageContainer}>
                  <Image
                    source={{ uri: selectedItem?.image || "https://placeholder.svg?height=300&width=300&query=food" }}
                    style={styles.detailsImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedItem?.name}</Text>
                  <Text style={styles.detailsCategory}>{selectedItem?.category}</Text>

                  <View style={styles.ratingsRow}>
                    <Feather name="star" size={20} color="#ffc107" />
                    <Text style={styles.ratingsText}>
                      {selectedItem?.rating?.toFixed(1)} • {selectedItem?.calories} calories
                    </Text>
                  </View>
                  <View style={styles.ordersRow}>
                    <Feather name="users" size={16} color="#64748b" />
                    <Text style={styles.ordersText}>{selectedItem?.orders} orders</Text>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Price</Text>
                    <Text style={styles.detailsPrice}>{selectedItem?.price}</Text>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Description</Text>
                    <Text style={styles.detailsDescription}>{selectedItem?.description}</Text>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Ingredients</Text>
                    <View style={styles.ingredientsTags}>
                      {selectedItem?.ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientTag}>
                          <Text style={styles.ingredientTagText}>
                            {ingredient.id_ingredient} (Qté: {ingredient.quantite})
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Health Alerts</Text>
                    <View style={styles.healthAlertsTags}>
                      {selectedItem?.healthAlerts && selectedItem?.healthAlerts.length > 0 ? (
                        selectedItem?.healthAlerts.map((alert, index) => (
                          <View key={index} style={styles.healthAlertTag}>
                            <Text style={styles.healthAlertTagText}>Maladie {alert}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noAlertsText}>No health alerts</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Added on</Text>
                    <Text style={styles.detailsDate}>{selectedItem?.dateAdded}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Price Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUpdatePriceModal}
        onRequestClose={() => setShowUpdatePriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Price</Text>
              <Text style={styles.modalSubtitle}>Update the price for {selectedItem?.name}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Price</Text>
              <TextInput style={styles.input} value={selectedItem?.price} editable={false} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new price"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
              />
              <Text style={styles.helperText}>Enter price without 'da' (e.g., 17.99)</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUpdatePriceModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.updateButton, loading && styles.disabledButton]}
                onPress={updatePrice}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Price</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>Delete Plate</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedItem?.name}? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, loading && styles.disabledButton]}
                onPress={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Plate Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddPlateModal}
        onRequestClose={() => setShowAddPlateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addPlateModalContent}>
            <ScrollView>
              <View style={styles.addPlateHeader}>
                <Text style={styles.addPlateTitle}>Add Plate</Text>
                <Text style={styles.addPlateSubtitle}>Add a new plate into the Menu</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Plate Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter plate name"
                  value={newPlate.nom}
                  onChangeText={(text) => setNewPlate({ ...newPlate, nom: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter plate description"
                  multiline
                  numberOfLines={4}
                  value={newPlate.description}
                  onChangeText={(text) => setNewPlate({ ...newPlate, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={newPlate.prix}
                  onChangeText={(text) => setNewPlate({ ...newPlate, prix: text })}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Calories</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter calories"
                    keyboardType="numeric"
                    value={newPlate.calorie}
                    onChangeText={(text) => setNewPlate({ ...newPlate, calorie: text })}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <Text>{newPlate.categorie}</Text>
                    <Feather name="chevron-down" size={20} color="#000" />
                  </TouchableOpacity>

                  {showCategoryDropdown && (
                    <View style={styles.dropdownMenu}>
                      {categories.map((category, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewPlate({ ...newPlate, categorie: category })
                            setShowCategoryDropdown(false)
                          }}
                        >
                          {category === newPlate.categorie && <Feather name="check" size={16} color="#000" />}
                          <Text style={styles.dropdownItemText}>{category}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={newPlate.date}
                  onChangeText={(text) => setNewPlate({ ...newPlate, date: text })}
                />
                <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
              </View>

              {/* Champ pour l'URL de l'image */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter image URL"
                  value={newPlate.image}
                  onChangeText={(text) => setNewPlate({ ...newPlate, image: text })}
                />
                <Text style={styles.helperText}>Optional: Enter a URL for the plate image</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Add ingredients</Text>

                <View style={styles.ingredientInputContainer}>
                  <View style={styles.ingredientNameInput}>
                    <Text style={styles.smallLabel}>Ingredient ID</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ingredient ID (number)"
                      keyboardType="numeric"
                      value={currentIngredient.id_ingredient}
                      onChangeText={(text) => setCurrentIngredient({ ...currentIngredient, id_ingredient: text })}
                    />
                  </View>

                  <View style={styles.ingredientQuantityInput}>
                    <Text style={styles.smallLabel}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 2"
                      keyboardType="numeric"
                      value={currentIngredient.quantite.toString()}
                      onChangeText={(text) =>
                        setCurrentIngredient({ ...currentIngredient, quantite: Number.parseInt(text) || 1 })
                      }
                    />
                  </View>

                  <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
                    <Feather name="plus" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                {selectedIngredients.length > 0 && (
                  <View style={styles.selectedIngredientsContainer}>
                    <Text style={styles.smallLabel}>Selected Ingredients:</Text>
                    {selectedIngredients.map((ingredient, index) => (
                      <View key={index} style={styles.selectedIngredientRow}>
                        <Text style={styles.selectedIngredientText}>
                          {ingredient.id_ingredient} (Qté: {ingredient.quantite})
                        </Text>
                        <TouchableOpacity style={styles.removeIngredientButton} onPress={() => removeIngredient(index)}>
                          <Feather name="x" size={18} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Section pour les maladies (health alerts) - Modifiée pour n'accepter que des chiffres */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Health Alerts (ID numérique)</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowHealthDropdown(!showHealthDropdown)}
                >
                  <Text>
                    {selectedHealthAlerts.length > 0
                      ? `${selectedHealthAlerts.length} selected`
                      : "Select health alerts"}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>

                {showHealthDropdown && (
                  <View style={styles.dropdownMenu}>
                    {healthOptions.map((alert, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => toggleHealthAlert(alert)}
                      >
                        {selectedHealthAlerts.includes(alert) && <Feather name="check" size={16} color="#000" />}
                        <Text style={styles.dropdownItemText}>Maladie {alert}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Champ pour saisir manuellement un ID de maladie */}
                <View style={styles.manualHealthAlertInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez un ID de maladie (nombre)"
                    keyboardType="numeric"
                    onSubmitEditing={(e) => {
                      const value = e.nativeEvent.text.trim()
                      if (value) {
                        toggleHealthAlert(value)
                        e.target.clear()
                      }
                    }}
                  />
                  <Text style={styles.helperText}>Appuyez sur Entrée pour ajouter</Text>
                </View>

                {selectedHealthAlerts.length > 0 && (
                  <View style={styles.selectedHealthAlertsContainer}>
                    <Text style={styles.smallLabel}>Selected Health Alerts:</Text>
                    <View style={styles.healthAlertsTags}>
                      {selectedHealthAlerts.map((alert, index) => (
                        <View key={index} style={styles.healthAlertTag}>
                          <Text style={styles.healthAlertTagText}>Maladie {alert}</Text>
                          <TouchableOpacity
                            style={styles.removeHealthAlertButton}
                            onPress={() => toggleHealthAlert(alert)}
                          >
                            <Feather name="x" size={14} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.addPlateButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddPlateModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addPlateButton, loading && styles.disabledButton]}
                  onPress={() => {
                    console.log("🔘 Bouton Add Plate cliqué")
                    addNewPlate()
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.addPlateButtonText}>Add plate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownerIcon: {
    marginRight: 8,
  },
  ownerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  adminContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginRight: 8,
  },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4B5563",
    justifyContent: "center",
    alignItems: "center",
  },
  searchAddContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffc107",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  menuHeader: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
  },
  menuSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },
  refreshButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    flexDirection: "row",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 5,
  },
  testApiButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  testAddPlatButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  testApiButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  categoryContainer: {
    flex: 1.5,
  },
  categoryText: {
    fontSize: 16,
    color: "#64748b",
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  ratingContainer: {
    flex: 1,
  },
  ratingText: {
    fontSize: 16,
    color: "#64748b",
  },
  dateContainer: {
    flex: 1.5,
  },
  dateText: {
    fontSize: 16,
    color: "#64748b",
  },
  actionButtons: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#0f172a",
    fontWeight: "500",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  deleteModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  deleteModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  detailsModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 800,
    maxHeight: "90%",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  detailsSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  detailsBody: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailsImageContainer: {
    width: "40%",
    paddingRight: 16,
  },
  detailsImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  detailsInfo: {
    width: "60%",
    paddingLeft: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  detailsCategory: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  ratingsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingsText: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  },
  ordersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersText: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 8,
  },
  detailsPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  detailsDescription: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  ingredientsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ingredientTag: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientTagText: {
    fontSize: 14,
    color: "#0f172a",
  },
  healthAlertsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  healthAlertTag: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  healthAlertTagText: {
    fontSize: 14,
    color: "#dc2626",
    marginRight: 4,
  },
  removeHealthAlertButton: {
    padding: 2,
  },
  noAlertsText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },
  detailsDate: {
    fontSize: 16,
    color: "#64748b",
  },
  closeButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  addPlateModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    maxHeight: "90%",
  },
  addPlateHeader: {
    marginBottom: 24,
  },
  addPlateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  addPlateSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#0f172a",
    marginLeft: 8,
  },
  ingredientInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  ingredientNameInput: {
    flex: 2,
    marginRight: 8,
  },
  ingredientQuantityInput: {
    flex: 1,
    marginRight: 8,
  },
  addIngredientButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIngredientsContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  selectedIngredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  selectedIngredientText: {
    fontSize: 16,
    color: "#0f172a",
  },
  removeIngredientButton: {
    padding: 4,
  },
  selectedHealthAlertsContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  manualHealthAlertInput: {
    marginTop: 12,
  },
  addPlateButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  addPlateButton: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addPlateButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
})

export default MenuScreen
