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
  Image,
  ScrollView,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import DraggableSidebar from '../components/DraggableSidebar';
import { useSidebar } from '../context/SidebarContext';
import * as ImagePicker from 'expo-image-picker';
import Api_plat from '../Api_plat';
import Api_maladie from '../Api_maladie';
import IngredientApi from '../api_ingredient';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const MenuScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [maladies, setMaladies] = useState([]);
  const [platIngredients, setPlatIngredients] = useState([]);
  const [platMaladies, setPlatMaladies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [showAddPlateModal, setShowAddPlateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Add Plate Form State
  const [newPlate, setNewPlate] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: 'All Categories',
    calorie: '',
    date: new Date().toISOString().split('T')[0],
    ingredients: [],
    maladies: [],
    image: null,
  });
  
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({ id_ingredient: '', quantite: '' });
  const [showIngredientsDropdown, setShowIngredientsDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchPlats();
    fetchIngredients();
    fetchMaladies();
  }, []);

const fetchPlats = async () => {
    try {
      const response = await Api_plat.getAllPlatsForGerant();
      if (response) {
        const formattedPlats = response.data.plats.map(plat => ({
          id: plat.id_plat,
          name: plat.nom_plat,
          category: plat.categorie_plat,
          price: `${plat.Prix_plat}da`,
          rating: plat.note_plat,
          dateAdded: plat.Ajout_date,
          description: plat.Description_plat,
          calories: plat.info_calorie,
          orders: plat.nbrnote,
          image: plat.image_plat,
          id_plat: plat.id_plat
        }));
        setMenuItems(formattedPlats);
      }
    } catch (error) {
      console.error('Error fetching plates:', error);
      Alert.alert('Error', 'Failed to fetch plates');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await IngredientApi.getIngredients();

      const formattedIngredients = res.ingredients.map(ing => ({
        id_ingedient: ing.id_ingedient,
        nom_igredient: ing.nom_igredient,
        quantite_ing: ing.quantité_ing
      }));
      setIngredients(formattedIngredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchMaladies = async () => {
    try {
      const maladies = await Api_maladie.getMaladies();

      const formattedMaladies = maladies.map(mal => ({
        id_maladie: mal.id_maladie,
        nom_maladie: mal.nom_maladie,
        desc_maladie: mal.desc_maladie
      }));
      setMaladies(formattedMaladies);
    } catch (error) {
      console.error('Error fetching maladies:', error);
    }
  };

  const fetchPlatIngredients = async (id_plat) => {

    try {
      console.log('Fetching ingredients for plat ID:', id_plat);  
      const response = await Api_plat.getIngredientsByPlatId(id_plat);
      console.log(response);
        const formattedPlatIngredients = response.data.ingredients.map(platIng => {
          const ingredient = ingredients.find(ing => ing.id_ingredient === platIng.id_ingredient);
          return {
            id_ingredient: platIng.id_ingredient,
            nom: ingredient ? ingredient.nom_igredient : 'Unknown Ingredient',
            quantite_in_plat: platIng.quantite_in_plat || platIng.quantite
          };
        });
        console.log('Formatted Plat Ingredients:', formattedPlatIngredients);
        setPlatIngredients(formattedPlatIngredients);
     
    } catch (error) {
      console.error('Error fetching plat ingredients:', error.message);
      setPlatIngredients([]);
    }
  };

  const fetchPlatMaladies = async (id_plat) => {
    if (!id_plat) {
      console.error('Invalid plat ID:', id_plat);
      setPlatMaladies([]);
      return;
    }
    try {
      const response = await Api_plat.getMaladiesByPlatId(id_plat);
      if (response && Array.isArray(response)) {
        const formattedPlatMaladies = response.data.maladies(platMal => {
          const maladie = maladies.find(mal => mal.id_maladie === platMal.id_maladie);
          return {
            id_maladie: platMal.id_maladie,
            nom_maladie: maladie ? maladie.nom_maladie : 'Unknown Maladie',
            desc_maladie: maladie ? maladie.desc_maladie : ''
          };
        });
        setPlatMaladies(formattedPlatMaladies);
      } else {
        throw new Error('Invalid plat maladies response structure');
      }
    } catch (error) {
      console.error('Error fetching plat maladies:', error.message);
      setPlatMaladies([]);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setNewPrice(item.price.replace('da', ''));
    setShowUpdatePriceModal(true);
  };

  const handleViewDetails = async (item) => {
    setSelectedItem(item);
    if (item.id_plat) {
      await Promise.all([
        fetchPlatIngredients(item.id_plat),
        fetchPlatMaladies(item.id_plat)
      ]);
    } else {
      console.error('Invalid plat ID in item:', item);
      setPlatIngredients([]);
      setPlatMaladies([]);
    }
    setShowDetails(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Api_plat.deletePlatById(selectedItem.id_plat);
      setMenuItems(menuItems.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      Alert.alert('Success', 'Plate deleted successfully');
    } catch (error) {
      console.error('Error deleting plate:', error.message);
      Alert.alert('Error', 'Failed to delete plate');
    }
  };

  const updatePrice = async () => {
    if (!newPrice || isNaN(Number(newPrice))) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }
    
    try {
      await Api_plat.updatePlatPrice(selectedItem.id_plat, newPrice);
      setMenuItems(menuItems.map(item => 
        item.id === selectedItem.id ? {...item, price: `${newPrice}da`} : item
      ));
      setShowUpdatePriceModal(false);
      setSelectedItem(null);
      Alert.alert('Success', 'Price updated successfully');
    } catch (error) {
      console.error('Error updating price:', error.message);
      Alert.alert('Error', 'Failed to update price');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setNewPlate({...newPlate, image: result.assets[0].uri});
    }
  };

  const addIngredient = () => {
    if (!currentIngredient.id_ingredient || !currentIngredient.quantite) {
      Alert.alert("Missing Information", "Please provide both ingredient and quantity");
      return;
    }
    
    const selectedIngredient = ingredients.find(ing => ing.id_ingredient == currentIngredient.id_ingredient);
    if (!selectedIngredient) {
      Alert.alert("Error", "Selected ingredient not found");
      return;
    }
    
    setSelectedIngredients([...selectedIngredients, { 
      id_ingredient: currentIngredient.id_ingredient,
      nom: selectedIngredient.nom,
      quantite: currentIngredient.quantite 
    }]);
    setCurrentIngredient({ id_ingredient: '', quantite: '' });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients.splice(index, 1);
    setSelectedIngredients(updatedIngredients);
  };

  const addNewPlate = async () => {
    if (!newPlate.nom || !newPlate.prix) {
      Alert.alert("Missing Information", "Please provide at least a name and price for the new plate");
      return;
    }
    
    if (selectedIngredients.length === 0) {
      Alert.alert("Missing Ingredients", "Please add at least one ingredient");
      return;
    }
    
    if (newPlate.maladies.length === 0) {
      Alert.alert("Missing Health Alerts", "Please select at least one health alert");
      return;
    }
    
    try {
      const platData = {
        nom: newPlate.nom,
        image: newPlate.image || 'default.jpg',
        description: newPlate.description,
        prix: parseFloat(newPlate.prix),
        calorie: newPlate.calorie,
        categorie: newPlate.categorie,
        date: newPlate.date,
        ingredients: selectedIngredients.map(ing => ({
          id_ingredient: parseInt(ing.id_ingredient),
          quantite: parseInt(ing.quantite)
        })),
        maladies: newPlate.maladies.map(id => parseInt(id))
      };
      
      await Api_plat.addGerantPlat(platData);
      await fetchPlats();
      
      setShowAddPlateModal(false);
      setNewPlate({
        nom: '',
        description: '',
        prix: '',
        categorie: 'All Categories',
        calorie: '',
        date: new Date().toISOString().split('T')[0],
        ingredients: [],
        maladies: [],
        image: null,
      });
      setSelectedIngredients([]);
      
      Alert.alert('Success', 'Plate added successfully');
    } catch (error) {
      console.error('Error adding plate:', error.message);
      Alert.alert('Error', error.message || 'Failed to add plate');
    }
  };

  const updatePlatIngredient = async (id_plat, id_ingredient, quantite) => {
    if (!id_plat || !id_ingredient || !quantite) {
      Alert.alert('Error', 'Invalid plat ID, ingredient ID, or quantity');
      return;
    }
    try {
      await Api_plat.updateIngredientToPlat(id_plat, id_ingredient, quantite);
      await fetchPlatIngredients(id_plat);
      Alert.alert('Success', 'Ingredient updated successfully');
    } catch (error) {
      console.error('Error updating ingredient:', error.message);
      Alert.alert('Error', 'Failed to update ingredient');
    }
  };

  const deletePlatIngredient = async (id_plat, id_ingredient) => {
    if (!id_plat || !id_ingredient) {
      Alert.alert('Error', 'Invalid plat ID or ingredient ID');
      return;
    }
    try {
      await Api_plat.deleteIngredientFromPlat(id_plat, id_ingredient);
      await fetchPlatIngredients(id_plat);
      Alert.alert('Success', 'Ingredient removed successfully');
    } catch (error) {
      console.error('Error removing ingredient:', error.message);
      Alert.alert('Error', 'Failed to remove ingredient');
    }
  };

  const addPlatIngredient = async (id_plat, id_ingredient, quantite) => {
    if (!id_plat || !id_ingredient || !quantite) {
      Alert.alert('Error', 'Invalid plat ID, ingredient ID, or quantity');
      return;
    }
    try {
      await Api_plat.addIngredientToPlat(id_plat, id_ingredient, quantite);
      await fetchPlatIngredients(id_plat);
      Alert.alert('Success', 'Ingredient added successfully');
    } catch (error) {
      console.error('Error adding ingredient:', error.message);
      Alert.alert('Error', 'Failed to add ingredient');
    }
  };

  const categories = ['All Categories', 'Main', 'Appetizer', 'Dessert', 'Beverage', 'Side'];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.menuItemRow, isMobile && styles.mobileMenuItemRow]}
      onPress={() => handleViewDetails(item)}
    >
      {isMobile ? (
        <>
          <View style={styles.mobileItemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          <View style={styles.mobileItemFooter}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <View style={styles.mobileActionButtons}>
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
          </View>
        </>
      ) : (
        <>
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
            <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : ''}</Text>
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
        </>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="Menu" />
        
        {/* Main Content */}
        <ScrollView 
          style={[styles.contentContainer, { marginLeft: sidebarWidth }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
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
          <View style={[styles.searchAddContainer, isMobile && styles.mobileSearchAddContainer]}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Menu items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddPlateModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
              {!isMobile && <Text style={styles.addButtonText}>Add Menu item</Text>}
            </TouchableOpacity>
          </View>
          
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <Text style={styles.menuSubtitle}>Manage your restaurant's Menu</Text>
          </View>
          
          {/* Menu Table */}
          <View style={styles.tableContainer}>
            {!isMobile && (
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
                <Text style={[styles.columnHeader, { flex: 1.5 }]}>Category</Text>
                <Text style={[styles.columnHeader, { flex: 1 }]}>Price</Text>
                <Text style={[styles.columnHeader, { flex: 1 }]}>Rating</Text>
                <Text style={[styles.columnHeader, { flex: 1.5 }]}>Date added</Text>
                <Text style={[styles.columnHeader, { flex: 1.5 }]}>Actions</Text>
              </View>
            )}
            
            <FlatList
              data={menuItems.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={{ maxHeight: '70vh' }}
              nestedScrollEnabled={true}
            />
          </View>
        </ScrollView>
      </View>
      
      {/* Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDetails}
        onRequestClose={() => setShowDetails(false)}
      >
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
                    source={{ uri: selectedItem?.image || 'https://placeholder.svg?height=300&width=300&query=food' }} 
                    style={styles.detailsImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedItem?.name}</Text>
                  <Text style={styles.detailsCategory}>{selectedItem?.category}</Text>
                  
                  <View style={styles.ratingsRow}>
                    <Feather name="star" size={20} color="#ffc107" />
                    <Text style={styles.ratingsText}>{selectedItem?.rating?.toFixed(1)} • {selectedItem?.calories} calories</Text>
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
                      {platIngredients.length > 0 ? (
                        platIngredients.map((ingredient, index) => (
                          <View key={index} style={styles.ingredientTag}>
                            <Text style={styles.ingredientTagText}>
                              {ingredient.nom} ({ingredient.quantite_in_plat})
                            </Text>
                            <View style={styles.ingredientActions}>
                              <TouchableOpacity 
                                onPress={async () => {
                                  const newQuantity = await new Promise(resolve => {
                                    Alert.alert(
                                      'Update Quantity',
                                      'Enter new quantity:',
                                      [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                          text: 'OK',
                                          onPress: () => {
                                            const input = prompt('Enter new quantity', ingredient.quantite_in_plat);
                                            resolve(input);
                                          }
                                        }
                                      ]
                                    );
                                  });
                                  if (newQuantity && !isNaN(newQuantity)) {
                                    updatePlatIngredient(selectedItem.id_plat, ingredient.id_ingredient, parseInt(newQuantity));
                                  }
                                }}
                              >
                                <Feather name="edit" size={16} color="#000" />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                onPress={() => deletePlatIngredient(selectedItem.id_plat, ingredient.id_ingredient)}
                              >
                                <Feather name="trash-2" size={16} color="#dc2626" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noAlertsText}>No ingredients</Text>
                      )}
                    </View>
                    <View style={styles.addIngredientContainer}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <TouchableOpacity 
                          style={styles.dropdownButton}
                          onPress={() => setShowIngredientsDropdown(!showIngredientsDropdown)}
                        >
                          <Text>
                            {currentIngredient.id_ingredient ? 
                              ingredients.find(i => i.id_ingredient == currentIngredient.id_ingredient)?.nom || 'Select ingredient' : 
                              'Select ingredient'}
                          </Text>
                          <Feather name="chevron-down" size={20} color="#000" />
                        </TouchableOpacity>
                        
                        {showIngredientsDropdown && (
                          <View style={styles.dropdownMenu}>
                            {ingredients.map((ingredient, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setCurrentIngredient({...currentIngredient, id_ingredient: ingredient.id_ingredient});
                                  setShowIngredientsDropdown(false);
                                }}
                              >
                                {platIngredients.some(ing => ing.id_ingredient === ingredient.id_ingredient) && (
                                  <Feather name="check" size={16} color="#000" />
                                )}
                                <Text style={styles.dropdownItemText}>{ingredient.nom}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="Quantity"
                        value={currentIngredient.quantite}
                        onChangeText={(text) => setCurrentIngredient({...currentIngredient, quantite: text})}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity 
                        style={styles.addIngredientButton}
                        onPress={() => {
                          if (currentIngredient.id_ingredient && currentIngredient.quantite) {
                            addPlatIngredient(
                              selectedItem.id_plat, 
                              parseInt(currentIngredient.id_ingredient), 
                              parseInt(currentIngredient.quantite)
                            );
                            setCurrentIngredient({ id_ingredient: '', quantite: '' });
                          } else {
                            Alert.alert('Missing Information', 'Please select an ingredient and enter a quantity');
                          }
                        }}
                      >
                        <Feather name="plus" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Health Alerts</Text>
                    <View style={styles.healthAlertsTags}>
                      {platMaladies.length > 0 ? (
                        platMaladies.map((maladie, index) => (
                          <View key={index} style={styles.healthAlertTag}>
                            <Text style={styles.healthAlertTagText}>{maladie.nom_maladie}</Text>
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
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
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
              <TextInput
                style={styles.input}
                value={selectedItem?.price}
                editable={false}
              />
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
              <Text style={styles.helperText}>Enter price without 'da' (e.g., 2500)</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowUpdatePriceModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={updatePrice}
              >
                <Text style={styles.updateButtonText}>Update Price</Text>
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
              
              {/* Image Upload Section */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Plate Image</Text>
                <View style={styles.imageUploadContainer}>
                  {newPlate.image ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image 
                        source={{ uri: newPlate.image }} 
                        style={styles.imagePreview} 
                      />
                      <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={pickImage}
                      >
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={pickImage}
                    >
                      <Feather name="upload" size={24} color="#0f172a" />
                      <Text style={styles.uploadButtonText}>Upload Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Plate Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter plate name"
                  value={newPlate.nom}
                  onChangeText={(text) => setNewPlate({...newPlate, nom: text})}
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
                  onChangeText={(text) => setNewPlate({...newPlate, description: text})}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={newPlate.prix}
                  onChangeText={(text) => setNewPlate({...newPlate, prix: text})}
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
                    onChangeText={(text) => setNewPlate({...newPlate, calorie: text})}
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
                            setNewPlate({...newPlate, categorie: category});
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {category === newPlate.categorie && (
                            <Feather name="check" size={16} color="#000" />
                          )}
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
                  onChangeText={(text) => setNewPlate({...newPlate, date: text})}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Add ingredients</Text>
                
                <View style={styles.ingredientInputContainer}>
                  <View style={styles.ingredientNameInput}>
                    <Text style={styles.smallLabel}>Ingredient</Text>
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowIngredientsDropdown(!showIngredientsDropdown)}
                    >
                      <Text>
                        {currentIngredient.id_ingredient ? 
                          ingredients.find(i => i.id_ingredient == currentIngredient.id_ingredient)?.nom || 'Select ingredient' : 
                          'Select ingredient'}
                      </Text>
                      <Feather name="chevron-down" size={20} color="#000" />
                    </TouchableOpacity>
                    
                    {showIngredientsDropdown && (
                      <View style={styles.dropdownMenu}>
                        {ingredients.map((ingredient, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setCurrentIngredient({...currentIngredient, id_ingredient: ingredient.id_ingredient});
                              setShowIngredientsDropdown(false);
                            }}
                          >
                            {currentIngredient.id_ingredient == ingredient.id_ingredient && (
                              <Feather name="check" size={16} color="#000" />
                            )}
                            <Text style={styles.dropdownItemText}>{ingredient.nom}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.ingredientQuantityInput}>
                    <Text style={styles.smallLabel}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 100"
                      value={currentIngredient.quantite}
                      onChangeText={(text) => setCurrentIngredient({...currentIngredient, quantite: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addIngredientButton}
                    onPress={addIngredient}
                  >
                    <Feather name="plus" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                {selectedIngredients.length > 0 && (
                  <View style={styles.selectedIngredientsContainer}>
                    <Text style={styles.smallLabel}>Selected Ingredients:</Text>
                    {selectedIngredients.map((ingredient, index) => (
                      <View key={index} style={styles.selectedIngredientRow}>
                        <Text style={styles.selectedIngredientText}>
                          {ingredient.nom} ({ingredient.quantite})
                        </Text>
                        <TouchableOpacity
                          style={styles.removeIngredientButton}
                          onPress={() => removeIngredient(index)}
                        >
                          <Feather name="x" size={18} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Add health alerts</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowHealthDropdown(!showHealthDropdown)}
                >
                  <Text>
                    {newPlate.maladies.length > 0 ? 
                      `${newPlate.maladies.length} selected` : 
                      'Select health concerns'}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>
                
                {showHealthDropdown && (
                  <View style={styles.dropdownMenu}>
                    {maladies.map((maladie, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          const updatedMaladies = [...newPlate.maladies];
                          if (updatedMaladies.includes(maladie.id_maladie)) {
                            const index = updatedMaladies.indexOf(maladie.id_maladie);
                            updatedMaladies.splice(index, 1);
                          } else {
                            updatedMaladies.push(maladie.id_maladie);
                          }
                          setNewPlate({...newPlate, maladies: updatedMaladies});
                        }}
                      >
                        {newPlate.maladies.includes(maladie.id_maladie) && (
                          <Feather name="check" size={16} color="#000" />
                        )}
                        <Text style={styles.dropdownItemText}>{maladie.nom_maladie}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.addPlateButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddPlateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addPlateButton}
                  onPress={addNewPlate}
                >
                  <Text style={styles.addPlateButtonText}>Add plate</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? 24 : 0,
  },
  mobileSearchAddContainer: {
    flexDirection: 'column',
  },
  mobileMenuItemRow: {
    flexDirection: 'column',
    padding: 12,
  },
  mobileItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mobileItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileActionButtons: {
    flexDirection: 'row',
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
  menuHeader: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  menuSubtitle: {
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
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  categoryContainer: {
    flex: 1.5,
  },
  categoryText: {
    fontSize: 16,
    color: '#64748b',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  ratingContainer: {
    flex: 1,
  },
  ratingText: {
    fontSize: 16,
    color: '#64748b',
  },
  dateContainer: {
    flex: 1.5,
  },
  dateText: {
    fontSize: 16,
    color: '#64748b',
  },
  actionButtons: {
    flex: 1.5,
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
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  updateButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
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
  detailsModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 800,
    maxHeight: '90%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  detailsBody: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsImageContainer: {
    width: '40%',
    paddingRight: 16,
  },
  detailsImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsInfo: {
    width: '60%',
    paddingLeft: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  detailsCategory: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingsText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  ordersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ordersText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  detailsPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  ingredientsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientTagText: {
    fontSize: 14,
    color: '#0f172a',
    marginRight: 8,
  },
  ingredientActions: {
    flexDirection: 'row',
  },
  healthAlertsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthAlertTag: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  healthAlertTagText: {
    fontSize: 14,
    color: '#dc2626',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  detailsDate: {
    fontSize: 16,
    color: '#64748b',
  },
  closeButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  addPlateModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    maxHeight: '90%',
  },
  addPlateHeader: {
    marginBottom: 24,
  },
  addPlateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  addPlateSubtitle: {
    fontSize: 16,
    color: '#64748b',
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
    overflow: 'scroll',
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
  ingredientInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    backgroundColor: '#0f172a',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIngredientsContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  selectedIngredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedIngredientText: {
    fontSize: 16,
    color: '#0f172a',
  },
  removeIngredientButton: {
    padding: 4,
  },
  imageUploadContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  uploadButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  uploadButtonText: {
    color: '#0f172a',
    fontSize: 16,
    marginTop: 8,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeImageText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  addPlateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addPlateButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlateButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  addIngredientContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
});

export default MenuScreen;