import React, { useState, useEffect } from 'react';
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
import IngredientApi from '../api/api_ingredient'; // << Remplacé ici

const StockScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // <<< AJOUTER ÇA
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showEditIngredientModal, setShowEditIngredientModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState([]);

  useEffect(() => {
    fetchIngredients();
  }, []);
  const fetchIngredients = async () => {
    try {
      const data = await IngredientApi.getIngredients();
      console.log("Fetched Ingredients:", data);
  
      // Ici on mappe correctement
      const formattedIngredients = data.ingredients.map(item => ({
        id: item.id_ingedient,
        name: item.nom_igredient,
        quantity: item.quantité_ing,
        category: item.category || 'Unknown', // Si category n'existe pas, on met "Unknown"
        lastUpdated: item.lastUpdated || null,
      }));
  
      setIngredients(formattedIngredients);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  const handleEdit = (item) => {
  navigation.navigate('UpdateIngredient', {
    ingredient: item,
    onUpdate: async (id, data) => {
      try {
        await IngredientApi.updateIngredient(id, {
          quantity: data.quantity.replace(/[^0-9]/g, ''),
        });
        fetchIngredients(); // rafraîchir la liste
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
  });
};

  
  const handleDelete = (item) => {
    setSelectedIngredient(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await IngredientApi.deleteIngredient(selectedIngredient.id);
      fetchIngredients();
      setShowDeleteModal(false);
      setSelectedIngredient(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const addNewIngredient = async () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      Alert.alert("Missing Information", "Please provide all required fields");
      return;
    }
    try {
      await IngredientApi.addIngredient(newIngredient);
      fetchIngredients();
      setShowAddIngredientModal(false);
      setNewIngredient({ name: '', quantity: '' });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updateIngredient = async () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      Alert.alert("Missing Information", "Please provide all required fields");
      return;
    }
    try {
      await IngredientApi.updateIngredient(selectedIngredient.id, newIngredient);
      fetchIngredients();
      setShowEditIngredientModal(false);
      setSelectedIngredient(null);
      setNewIngredient({ name: '', quantity: '' });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.ingredientRow}>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{item.quantity}</Text>
      </View>
      <View style={styles.lastUpdatedContainer}>
        <Text style={styles.lastUpdatedText}>{item.lastUpdated || 'N/A'}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Feather name="edit" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
          <Feather name="trash-2" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="Stock" />
        
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
                placeholder="Search ingredients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddIngredientModal(true)}
            >
              <Feather name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stock Header */}
          <View style={styles.stockHeader}>
            <Text style={styles.stockTitle}>Stock</Text>
            <Text style={styles.stockSubtitle}>Manage your restaurant's ingredients</Text>
          </View>
          
          {/* Stock Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Quantity</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Last Updated</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Actions</Text>
            </View>
            <FlatList
    data={ingredients.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
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
              <Text style={styles.deleteModalTitle}>Delete Ingredient</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedIngredient?.name}? This action cannot be undone.
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
      
      {/* Add Ingredient Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddIngredientModal}
        onRequestClose={() => setShowAddIngredientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addIngredientModalContent}>
            <View style={styles.addIngredientHeader}>
              <Text style={styles.addIngredientTitle}>Add Ingredient</Text>
              <Text style={styles.addIngredientSubtitle}>Add a new ingredient to your stock</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredient Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ingredient name"
                value={newIngredient.name}
                onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
              />
            </View>
            
            
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity (e.g., 10kg, 5L)"
                value={newIngredient.quantity}
                onChangeText={(text) => setNewIngredient({...newIngredient, quantity: text})}
              />
            </View>
            
            <View style={styles.addIngredientButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddIngredientModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addIngredientButton}
                onPress={addNewIngredient}
              >
                <Text style={styles.addIngredientButtonText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Ingredient Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditIngredientModal}
        onRequestClose={() => setShowEditIngredientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addIngredientModalContent}>
            <View style={styles.addIngredientHeader}>
              <Text style={styles.addIngredientTitle}>Edit Ingredient</Text>
              <Text style={styles.addIngredientSubtitle}>Update ingredient information</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredient Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ingredient name"
                value={newIngredient.name}
                onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
              />
            </View>
            
           
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity (e.g., 10kg, 5L)"
                value={newIngredient.quantity}
                onChangeText={(text) => setNewIngredient({...newIngredient, quantity: text})}
              />
            </View>
            
            <View style={styles.addIngredientButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditIngredientModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addIngredientButton}
                onPress={updateIngredient}
              >
                <Text style={styles.addIngredientButtonText}>Update Ingredient</Text>
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
  stockHeader: {
    marginBottom: 24,
  },
  stockTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  stockSubtitle: {
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
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  ingredientInfo: {
    flex: 2,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  quantityContainer: {
    flex: 1,
  },
  quantityText: {
    fontSize: 16,
    color: '#0f172a',
  },
  lastUpdatedContainer: {
    flex: 1,
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#64748b',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
  addIngredientModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  addIngredientHeader: {
    marginBottom: 24,
  },
  addIngredientTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  addIngredientSubtitle: {
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 8,
  },
  addIngredientButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addIngredientButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIngredientButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default StockScreen;