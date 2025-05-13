// screens/HealthAlertsScreen.js
import React, { useState } from 'react';
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
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DraggableSidebar from '../components/DraggableSidebar';
import { useSidebar } from '../context/SidebarContext';

const HealthAlertsScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [healthAlerts, setHealthAlerts] = useState([
    { 
      id: '1', 
      name: 'Gluten Allergy', 
      description: 'Allergy to gluten, a protein found.', 
    },
    { 
      id: '2', 
      name: 'Cheese', 
      description: 'Allergy to gluten, a protein found.', 
    },
    { 
      id: '3', 
      name: 'Pasta', 
      description: 'Allergy to gluten, a protein found.', 
    },
    { 
      id: '4', 
      name: 'Tomatoes', 
      description: 'Allergy to gluten, a protein found.', 
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
  });

  const handleDelete = (item) => {
    setSelectedAlert(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setHealthAlerts(healthAlerts.filter(item => item.id !== selectedAlert.id));
    setShowDeleteModal(false);
    setSelectedAlert(null);
  };

  const addNewAlert = () => {
    if (!newAlert.name || !newAlert.description) {
      Alert.alert("Missing Information", "Please provide both name and description for the health alert");
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: newAlert.name,
      description: newAlert.description,
    };
    
    setHealthAlerts([...healthAlerts, newItem]);
    setShowAddAlertModal(false);
    // Reset form
    setNewAlert({
      name: '',
      description: '',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.alertRow}>
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="HealthAlerts" />
        
        {/* Main Content */}
        <ScrollView 
          style={[styles.contentContainer, { marginLeft: sidebarWidth }]}
          showsVerticalScrollIndicator={false}
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
                placeholder="Search health alerts..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddAlertModal(true)}
            >
              <Feather name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add health Alert</Text>
            </TouchableOpacity>
          </View>
          
          {/* Health Alerts Header */}
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>Health Alerts</Text>
            <Text style={styles.alertsSubtitle}>Manage health conditions and associated menu items</Text>
          </View>
          
          {/* Health Alerts Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
              <Text style={[styles.columnHeader, { flex: 4 }]}>Description</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Actions</Text>
            </View>
            
            <FlatList
              data={healthAlerts.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>
      
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
              <Text style={styles.deleteModalTitle}>Delete Health Condition</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedAlert?.name}? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Health Alert Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddAlertModal}
        onRequestClose={() => setShowAddAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addAlertModalContent}>
            <View style={styles.addAlertHeader}>
              <Text style={styles.addAlertTitle}>Add Health Alert</Text>
              <Text style={styles.addAlertSubtitle}>Add a new health condition or allergy</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Alert Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter health alert name"
                value={newAlert.name}
                onChangeText={(text) => setNewAlert({...newAlert, name: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter health alert description"
                multiline
                numberOfLines={4}
                value={newAlert.description}
                onChangeText={(text) => setNewAlert({...newAlert, description: text})}
              />
            </View>
            
            <View style={styles.addAlertButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddAlertModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addAlertButton}
                onPress={addNewAlert}
              >
                <Text style={styles.addAlertButtonText}>Add Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerIcon: {
    marginRight: 8,
  },
  ownerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  adminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginRight: 8,
  },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc107',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  alertsHeader: {
    marginBottom: 24,
  },
  alertsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  alertsSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  nameContainer: {
    flex: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  descriptionContainer: {
    flex: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748b',
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#0f172a',
    fontWeight: '500',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  addAlertModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  addAlertHeader: {
    marginBottom: 24,
  },
  addAlertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  addAlertSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addAlertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addAlertButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAlertButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default HealthAlertsScreen;