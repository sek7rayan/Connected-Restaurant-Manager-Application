// components/Sidebar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSidebar } from '../context/SidebarContext';

const SIDEBAR_WIDTH = 250;

const Sidebar = ({ navigation }) => {
  const { sidebarOpen } = useSidebar();
  
  return (
    <Animated.View 
      style={[
        styles.sidebar, 
        { 
          width: SIDEBAR_WIDTH,
          transform: [{ translateX: sidebarOpen ? 0 : -SIDEBAR_WIDTH }],
        }
      ]}
    >
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>My Account</Text>
      </View>
      <ScrollView style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('Dashboard')}
        >
          <Feather name="user" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('Menu')}
        >
          <Feather name="menu" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('HealthAlerts')}
        >
          <Feather name="alert-circle" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Health alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.activeMenuItem]}
          onPress={() => navigation && navigation.navigate('Stock')}
        >
          <MaterialIcons name="inventory" size={20} color="#0f172a" />
          <Text style={[styles.menuText, styles.activeMenuText]}>Stock</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('Promotions')}
        >
          <Feather name="tag" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Promotions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('Staff')}
        >
          <Feather name="users" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Staff</Text>
          <Feather name="chevron-right" size={20} color="#0f172a" style={styles.menuArrow} />
        </TouchableOpacity>
        
        {/* Add Reservations menu item */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation && navigation.navigate('Reservations')}
        >
          <Feather name="calendar" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Reservations</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation && navigation.navigate('Logout')}
      >
        <Feather name="log-out" size={20} color="#0f172a" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    zIndex: 100,
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  activeMenuItem: {
    backgroundColor: '#f1f5f9',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  activeMenuText: {
    fontWeight: '500',
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#0f172a',
  },
});

export default Sidebar;
