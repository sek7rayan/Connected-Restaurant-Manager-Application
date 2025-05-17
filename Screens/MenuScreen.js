// screens/MenuScreen.js
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

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const MenuScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [menuItems, setMenuItems] = useState([
  { 
      id: '1', 
      name: 'Pizza', 
      category: 'Main', 
      price: '3000da', 
      rating: 4.8,
      dateAdded: '4/13/2025',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      calories: 850,
      orders: 50,
      ingredients: [
        { name: 'Tomatoes', quantity: '200g' },
        { name: 'Mozzarella Cheese', quantity: '150g' },
        { name: 'Basil', quantity: '10g' },
        { name: 'Flour', quantity: '300g' },
        { name: 'Olive Oil', quantity: '30ml' }
      ],
      healthAlerts: ['Contains gluten', 'Contains dairy'],
      image: 'https://placeholder.svg?height=300&width=300&query=pizza',
    },
    { 
      id: '2', 
      name: 'Cheese Plate', 
      category: 'Appetizer', 
      price: '2000da', 
      rating: 4.5,
      dateAdded: '4/13/2025',
      description: 'Delicious cheese dish with assorted cheeses',
      calories: 650,
      orders: 35,
      ingredients: [
        { name: 'Cheese', quantity: '250g' },
        { name: 'Tomatoes', quantity: '100g' },
        { name: 'Herbs', quantity: '5g' }
      ],
      healthAlerts: ['Contains dairy'],
      image: 'https://placeholder.svg?height=300&width=300&query=cheese%20plate',
    },
    { 
      id: '3', 
      name: 'Pasta', 
      category: 'Main', 
      price: '1500da', 
      rating: 4.3,
      dateAdded: '4/13/2025',
      description: 'Pasta with tomato sauce and fresh herbs',
      calories: 550,
      orders: 40,
      ingredients: [
        { name: 'Pasta', quantity: '200g' },
        { name: 'Tomatoes', quantity: '150g' },
        { name: 'Herbs', quantity: '5g' },
        { name: 'Olive Oil', quantity: '15ml' }
      ],
      healthAlerts: ['Contains gluten'],
      image: 'https://placeholder.svg?height=300&width=300&query=pasta',
    },
    { 
      id: '4', 
      name: 'Fresh Salad', 
      category: 'Side', 
      price: '1000da', 
      rating: 4.0,
      dateAdded: '4/13/2025',
      description: 'Fresh garden salad with seasonal vegetables',
      calories: 45,
      orders: 30,
      ingredients: [
        { name: 'Tomatoes', quantity: '100g' },
        { name: 'Lettuce', quantity: '150g' },
        { name: 'Cucumber', quantity: '100g' },
        { name: 'Olive Oil', quantity: '10ml' }
      ],
      healthAlerts: [],
      image: 'https://placeholder.svg?height=300&width=300&query=salad',
    },
  ]);

 const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [showAddPlateModal, setShowAddPlateModal] = useState(false);
  
  // Add Plate Form State
  const [newPlate, setNewPlate] = useState({
    name: '',
    description: '',
    price: '',
    category: 'All Categories',
    calories: '',
    date: new Date().toLocaleDateString(),
    ingredients: [],
    healthAlerts: [],
    image: null,
  });
  
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({ name: '', quantity: '' });
  const [showIngredientsDropdown, setShowIngredientsDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setNewPrice(item.price.replace('da', ''));
    setShowUpdatePriceModal(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setMenuItems(menuItems.filter(item => item.id !== selectedItem.id));
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const updatePrice = () => {
    if (!newPrice || isNaN(Number(newPrice))) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }
    
    setMenuItems(menuItems.map(item => 
      item.id === selectedItem.id ? {...item, price: `${newPrice}da`} : item
    ));
    setShowUpdatePriceModal(false);
    setSelectedItem(null);
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }
    
    // Launch image picker
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
    if (!currentIngredient.name || !currentIngredient.quantity) {
      Alert.alert("Missing Information", "Please provide both ingredient name and quantity");
      return;
    }
    
    setSelectedIngredients([...selectedIngredients, { 
      name: currentIngredient.name, 
      quantity: currentIngredient.quantity 
    }]);
    setCurrentIngredient({ name: '', quantity: '' });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients.splice(index, 1);
    setSelectedIngredients(updatedIngredients);
  };

  const addNewPlate = () => {
    if (!newPlate.name || !newPlate.price) {
      Alert.alert("Missing Information", "Please provide at least a name and price for the new plate");
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: newPlate.name,
      category: newPlate.category,
      price: `${newPlate.price}da`,
      rating: 0,
      dateAdded: newPlate.date,
      description: newPlate.description,
      calories: parseInt(newPlate.calories),
      orders: 0,
      ingredients: selectedIngredients,
      healthAlerts: newPlate.healthAlerts,
      image: newPlate.image || 'https://placeholder.svg?height=300&width=300&query=' + encodeURIComponent(newPlate.name),
    };
    
    setMenuItems([...menuItems, newItem]);
    setShowAddPlateModal(false);
    // Reset form
    setNewPlate({
      name: '',
      description: '',
      price: '',
      category: 'All Categories',
      calories: '',
      date: new Date().toLocaleDateString(),
      ingredients: [],
      healthAlerts: [],
      image: null,
    });
    setSelectedIngredients([]);
  };

  const categories = ['All Categories', 'Main', 'Appetizer', 'Dessert', 'Beverage', 'Side'];
  const ingredientOptions = ['Tomatoes', 'Onion', 'Pepper', 'Flour', 'Cheese', 'Olive Oil', 'Pasta', 'Lettuce'];
  const healthOptions = ['Contains sugar', 'Contains gluten', 'Contains dairy', 'Vegan', 'Vegetarian'];


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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.mainContainer}>
        <DraggableSidebar navigation={navigation} currentScreen="Menu" />
        
        {/* Main Content */}
        <View style={[styles.contentContainer, { marginLeft: sidebarWidth }]}>
          <ScrollView 
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
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      
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
                           {selectedItem?.ingredients.map((ingredient, index) => (
                             <View key={index} style={styles.ingredientTag}>
                               <Text style={styles.ingredientTagText}>
                                 {ingredient.name} ({ingredient.quantity})
                               </Text>
                             </View>
                           ))}
                         </View>
                       </View>
                       
                       <View style={styles.detailsSection}>
                         <Text style={styles.detailsSectionTitle}>Health Alerts</Text>
                         <View style={styles.healthAlertsTags}>
                           {selectedItem?.healthAlerts.length > 0 ? (
                             selectedItem?.healthAlerts.map((alert, index) => (
                               <View key={index} style={styles.healthAlertTag}>
                                 <Text style={styles.healthAlertTagText}>{alert}</Text>
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
                             value={newPlate.name}
                             onChangeText={(text) => setNewPlate({...newPlate, name: text})}
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
                             value={newPlate.price}
                             onChangeText={(text) => setNewPlate({...newPlate, price: text})}
                           />
                         </View>
                         
                         <View style={styles.formRow}>
                           <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                             <Text style={styles.label}>Calories</Text>
                             <TextInput
                               style={styles.input}
                               placeholder="Enter calories"
                               keyboardType="numeric"
                               value={newPlate.calories}
                               onChangeText={(text) => setNewPlate({...newPlate, calories: text})}
                             />
                           </View>
                           
                           <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                             <Text style={styles.label}>Category</Text>
                             <TouchableOpacity 
                               style={styles.dropdownButton}
                               onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                             >
                               <Text>{newPlate.category}</Text>
                               <Feather name="chevron-down" size={20} color="#000" />
                             </TouchableOpacity>
                             
                             {showCategoryDropdown && (
                               <View style={styles.dropdownMenu}>
                                 {categories.map((category, index) => (
                                   <TouchableOpacity
                                     key={index}
                                     style={styles.dropdownItem}
                                     onPress={() => {
                                       setNewPlate({...newPlate, category});
                                       setShowCategoryDropdown(false);
                                     }}
                                   >
                                     {category === newPlate.category && (
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
                               <TextInput
                                 style={styles.input}
                                 placeholder="Ingredient name"
                                 value={currentIngredient.name}
                                 onChangeText={(text) => setCurrentIngredient({...currentIngredient, name: text})}
                               />
                             </View>
                             
                             <View style={styles.ingredientQuantityInput}>
                               <Text style={styles.smallLabel}>Quantity</Text>
                               <TextInput
                                 style={styles.input}
                                 placeholder="e.g., 100g"
                                 value={currentIngredient.quantity}
                                 onChangeText={(text) => setCurrentIngredient({...currentIngredient, quantity: text})}
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
                                     {ingredient.name} ({ingredient.quantity})
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
                             <Text>Select health concerns</Text>
                             <Feather name="chevron-down" size={20} color="#000" />
                           </TouchableOpacity>
                           
                           {showHealthDropdown && (
                             <View style={styles.dropdownMenu}>
                               {healthOptions.map((option, index) => (
                                 <TouchableOpacity
                                   key={index}
                                   style={styles.dropdownItem}
                                   onPress={() => {
                                     const updatedAlerts = [...newPlate.healthAlerts];
                                     if (updatedAlerts.includes(option)) {
                                       const index = updatedAlerts.indexOf(option);
                                       updatedAlerts.splice(index, 1);
                                     } else {
                                       updatedAlerts.push(option);
                                     }
                                     setNewPlate({...newPlate, healthAlerts: updatedAlerts});
                                   }}
                                 >
                                   {newPlate.healthAlerts.includes(option) && (
                                     <Feather name="check" size={16} color="#000" />
                                   )}
                                   <Text style={styles.dropdownItemText}>{option}</Text>
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
  },
  ingredientTagText: {
    fontSize: 14,
    color: '#0f172a',
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
});

export default MenuScreen;