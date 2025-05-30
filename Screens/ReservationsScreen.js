"use client"

// Screens/ReservationsScreen.js
import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import DraggableSidebar from "../components/DraggableSidebar"
import { useSidebar } from "../context/SidebarContext"
import ReservationApi from "../api/reservationApi"
import { useFocusEffect } from "@react-navigation/native"

const ReservationsScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [rawApiData, setRawApiData] = useState(null)
  const [filterStatus, setFilterStatus] = useState("Toutes") // "Toutes", "En cours", "Planifiée", "Terminée"

  // Ajouter un log pour vérifier que le composant est bien monté
  console.log("🔄 ReservationsScreen monté")

  // Charger les réservations quand l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Reservations Screen a reçu le focus - Chargement des réservations...")
      fetchReservations()
      return () => {
        // Nettoyage si nécessaire
      }
    }, []),
  )

  // Fonction pour récupérer les réservations
  const fetchReservations = async () => {
    try {
      setLoading(true)
      console.log("🔍 Récupération des réservations...")

      const response = await ReservationApi.getReservations()
      setRawApiData(response) // Stocker les données brutes pour débogage

      console.log("📊 Données brutes des réservations reçues:", response ? response.length : 0)

      if (response && response.length > 0) {
        // Formater les réservations pour l'affichage
        const formattedReservations = response.map((reservation) => ReservationApi.formatReservationData(reservation))
        console.log("✅ Réservations formatées:", formattedReservations.length)

        // Trier les réservations par date (les plus récentes d'abord)
        formattedReservations.sort((a, b) => {
          const dateA = new Date(a.rawData.date_deb_res)
          const dateB = new Date(b.rawData.date_deb_res)
          return dateB - dateA
        })

        setReservations(formattedReservations)
      } else {
        console.log("ℹ️ Aucune réservation trouvée")
        setReservations([])
        Alert.alert("Information", "Aucune réservation trouvée.")
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des réservations:", error)
      Alert.alert("Erreur", "Impossible de récupérer les réservations: " + error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fonction pour rafraîchir les réservations
  const onRefresh = () => {
    setRefreshing(true)
    fetchReservations()
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
      Alert.alert("Information", "Aucune donnée brute disponible. Veuillez d'abord charger les réservations.")
    }
  }

  // Fonction pour afficher les détails d'une réservation
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation)
    setShowDetails(true)
  }

  // Filtrer les réservations en fonction de la recherche et du statut
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.clientId.toString().includes(searchQuery) ||
      reservation.tableId.toString().includes(searchQuery) ||
      reservation.personCount.toString().includes(searchQuery) ||
      reservation.startDateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.endDateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.status.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "Toutes" || reservation.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Rendu d'un élément de la liste des réservations
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.reservationItem} onPress={() => handleViewDetails(item)}>
      <View style={styles.reservationHeader}>
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationId}>Réservation #{item.id}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(item)}>
          <Feather name="eye" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.reservationDetails}>
        <View style={styles.detailRow}>
          <Feather name="users" size={16} color="#64748b" />
          <Text style={styles.detailText}>{item.personCount} personnes</Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="map-pin" size={16} color="#64748b" />
          <Text style={styles.detailText}>Table #{item.tableId}</Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="clock" size={16} color="#64748b" />
          <Text style={styles.detailText}>
            {item.startDateTime} - {item.duration}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="user" size={16} color="#64748b" />
          <Text style={styles.detailText}>Client #{item.clientId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Obtenir le style en fonction du statut
  const getStatusStyle = (status) => {
    switch (status) {
      case "En cours":
        return styles.statusActive
      case "Terminée":
        return styles.statusCompleted
      case "Imminente":
        return styles.statusImminent
      case "Aujourd'hui":
        return styles.statusToday
      default:
        return styles.statusPlanned
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="Reservations" />

        {/* Main Content - Utiliser un ScrollView avec flex: 1 */}
        <ScrollView
          style={[styles.contentContainer, { marginLeft: sidebarWidth }]}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true} // Assurer que le défilement est activé
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

          {/* Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher des réservations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Reservation Header */}
          <View style={styles.reservationHeader}>
            <Text style={styles.reservationTitle}>Réservations</Text>
            <Text style={styles.reservationSubtitle}>Gérer les réservations du restaurant</Text>

            {/* Boutons d'action */}
            <View style={styles.actionButtonsRow}>
              {/* Bouton de rafraîchissement */}
              <TouchableOpacity style={styles.refreshButton} onPress={fetchReservations}>
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.refreshButtonText}>Rafraîchir</Text>
              </TouchableOpacity>

              {/* Bouton pour voir les données brutes */}
              <TouchableOpacity style={styles.debugButton} onPress={showRawApiData}>
                <Text style={styles.debugButtonText}>Voir Données Brutes</Text>
              </TouchableOpacity>
            </View>

            {/* Filtres de statut */}
            <View style={styles.statusFilters}>
              <Text style={styles.filterLabel}>Filtrer par statut:</Text>
              <View style={styles.filterButtons}>
                {["Toutes", "En cours", "Planifiée", "Imminente", "Aujourd'hui", "Terminée"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffc107" />
              <Text style={styles.loadingText}>Chargement des réservations...</Text>
            </View>
          )}

          {/* Reservations List */}
          <View style={styles.reservationsContainer}>
            {filteredReservations.length === 0 && !loading ? (
              <View style={styles.emptyStateContainer}>
                <Feather name="calendar" size={48} color="#e2e8f0" />
                <Text style={styles.emptyStateText}>Aucune réservation trouvée</Text>
                <Text style={styles.emptyStateSubText}>
                  {searchQuery || filterStatus !== "Toutes"
                    ? "Essayez de modifier vos critères de recherche ou de filtre"
                    : "Il n'y a actuellement aucune réservation dans le système"}
                </Text>
              </View>
            ) : (
              // Remplacer FlatList par une liste manuelle pour éviter les problèmes de défilement imbriqué
              <View style={styles.reservationsList}>{filteredReservations.map((item) => renderItem({ item }))}</View>
            )}
          </View>

          {/* Ajouter un espace en bas pour permettre le défilement complet */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      {/* Reservation Details Modal */}
      <Modal animationType="fade" transparent={true} visible={showDetails} onRequestClose={() => setShowDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsTitle}>Détails de la Réservation</Text>
                <Text style={styles.detailsSubtitle}>Réservation #{selectedReservation?.id}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedReservation && (
              <ScrollView style={styles.detailsBody}>
                <View style={styles.detailsSection}>
                  <View style={styles.detailsSectionHeader}>
                    <Feather name="info" size={20} color="#0f172a" />
                    <Text style={styles.detailsSectionTitle}>Informations générales</Text>
                  </View>

                  <View style={styles.detailsCard}>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Statut:</Text>
                      <View style={[styles.statusBadge, getStatusStyle(selectedReservation.status)]}>
                        <Text style={styles.statusText}>{selectedReservation.status}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Client:</Text>
                      <Text style={styles.detailsValue}>#{selectedReservation.clientId}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Table:</Text>
                      <Text style={styles.detailsValue}>#{selectedReservation.tableId}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Nombre de personnes:</Text>
                      <Text style={styles.detailsValue}>{selectedReservation.personCount}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.detailsSectionHeader}>
                    <Feather name="clock" size={20} color="#0f172a" />
                    <Text style={styles.detailsSectionTitle}>Horaires</Text>
                  </View>

                  <View style={styles.detailsCard}>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Début:</Text>
                      <Text style={styles.detailsValue}>{selectedReservation.startDateTime}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Fin:</Text>
                      <Text style={styles.detailsValue}>{selectedReservation.endDateTime}</Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Durée:</Text>
                      <Text style={styles.detailsValue}>{selectedReservation.duration}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.detailsSectionHeader}>
                    <Feather name="code" size={20} color="#0f172a" />
                    <Text style={styles.detailsSectionTitle}>Données brutes</Text>
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.rawDataText}>{JSON.stringify(selectedReservation.rawData, null, 2)}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
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
  },
  scrollViewContent: {
    padding: 16,
    // Ne pas mettre flexGrow: 1 ici car cela peut empêcher le défilement
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
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
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
  reservationHeader: {
    marginBottom: 24,
  },
  reservationTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
  },
  reservationSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
    flexDirection: "row",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 5,
  },
  debugButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  statusFilters: {
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: "#0f172a",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#64748b",
  },
  filterButtonTextActive: {
    color: "#fff",
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
  reservationsContainer: {
    marginBottom: 16,
  },
  reservationsList: {
    // Pas de propriétés qui pourraient limiter la hauteur
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 8,
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
  reservationItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reservationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reservationId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusCompleted: {
    backgroundColor: "#f1f5f9",
  },
  statusPlanned: {
    backgroundColor: "#dbeafe",
  },
  statusImminent: {
    backgroundColor: "#fef9c3",
  },
  statusToday: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  reservationDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 600,
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
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  detailsValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  rawDataText: {
    fontFamily: "monospace",
    fontSize: 12,
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
  bottomPadding: {
    height: 100, // Ajouter un espace en bas pour permettre le défilement complet
  },
})

export default ReservationsScreen
