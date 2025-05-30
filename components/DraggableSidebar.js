"use client"

// components/DraggableSidebar.js
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useSidebar } from "../context/SidebarContext"

const DraggableSidebar = ({ navigation, currentScreen }) => {
  const { sidebarWidth, setSidebarWidth } = useSidebar()
  const [pan] = useState(new Animated.Value(0))

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      pan.setValue(gestureState.dx)
    },
    onPanResponderRelease: (_, gestureState) => {
      const newWidth = Math.max(70, Math.min(300, sidebarWidth + gestureState.dx))
      setSidebarWidth(newWidth)
      pan.setValue(0)
    },
  })

  const navigateTo = (screen) => {
    // Ajouter un console.log pour déboguer la navigation
    console.log("🔄 Navigation vers:", screen)

    // Vérifier si la navigation est définie
    if (!navigation) {
      console.error("❌ Erreur: l'objet navigation n'est pas défini")
      return
    }

    // Vérifier si la méthode navigate existe
    if (typeof navigation.navigate !== "function") {
      console.error("❌ Erreur: navigation.navigate n'est pas une fonction", navigation)
      return
    }

    // Tenter la navigation avec try/catch pour capturer les erreurs
    try {
      navigation.navigate(screen)
      console.log("✅ Navigation réussie vers:", screen)
    } catch (error) {
      console.error("❌ Erreur lors de la navigation:", error)
    }
  }

  const renderNavItem = (icon, label, screen) => {
    const isActive = currentScreen === screen

    return (
      <TouchableOpacity style={[styles.navItem, isActive && styles.activeNavItem]} onPress={() => navigateTo(screen)}>
        <Feather name={icon} size={20} color={isActive ? "#fff" : "#0f172a"} />
        <Text style={[styles.navText, isActive && styles.activeNavText]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.sidebar, { width: sidebarWidth }]}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>My Account</Text>
      </View>

      <View style={styles.navContainer}>
        {renderNavItem("menu", "Menu", "Menu")}
        {renderNavItem("alert-circle", "Health alerts", "HealthAlerts")}
        {renderNavItem("package", "Stock", "Stock")}
        {renderNavItem("tag", "Promotions", "Promotions")}
        {renderNavItem("users", "Staff", "Staff")}
        {renderNavItem("calendar", "Reservations", "Reservations")}
      </View>

      <View style={styles.sidebarFooter}>{renderNavItem("log-out", "Log out", "Logout")}</View>

      <Animated.View style={[styles.dragger, { transform: [{ translateX: pan }] }]} {...panResponder.panHandlers}>
        <View style={styles.draggerHandle} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    position: "relative",
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  navContainer: {
    flex: 1,
    padding: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeNavItem: {
    backgroundColor: "#0f172a",
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  activeNavText: {
    color: "#fff",
    fontWeight: "500",
  },
  sidebarFooter: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  dragger: {
    position: "absolute",
    top: 0,
    right: -10,
    bottom: 0,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  draggerHandle: {
    width: 4,
    height: 36,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
})

export default DraggableSidebar
