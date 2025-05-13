// screens/PromotionsScreen.js
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

const PromotionsScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [promotions, setPromotions] = useState([
    { 
      id: '1', 
      name: 'Happy hour', 
      discount: '20% Off',
      period: '4:00 PM - 7:00 PM',
      startDate: '04/01/2025',
      endDate: '12/31/2025',
      applicableItems: ['Margherita Pizza'],
    },
    { 
      id: '2', 
      name: 'Winter promo', 
      discount: '20% Off',
      period: 'Dec - Feb',
      startDate: '12/01/2025',
      endDate: '02/28/2026',
      applicableItems: ['Margherita Pizza'],
    },
    { 
      id: '3', 
      name: 'Bzef haylel', 
      discount: '20% Off',
      period: 'Weekends',
      startDate: '04/01/2025',
      endDate: '12/31/2025',
      applicableItems: ['Margherita Pizza'],
    },
    { 
      id: '4', 
      name: 'Matratich', 
      discount: '20% Off',
      period: 'Mondays',
      startDate: '04/01/2025',
      endDate: '12/31/2025',
      applicableItems: ['Margherita Pizza'],
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showAddPromotionModal, setShowAddPromotionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Menu items for selection
  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Pizza', selected: false },
    { id: '2', name: 'Cheese Plate', selected: false },
    { id: '3', name: 'Pasta', selected: false },
    { id: '4', name: 'Fresh Salad', selected: false },
    { id: '5', name: 'Margherita Pizza', selected: false },
    { id: '6', name: 'Chicken Wings', selected: false },
  ]);
  
  // New promotion form state
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    discount: '',
    startDate: new Date().toLocaleDateString(),
    endDate: new Date().toLocaleDateString(),
    applicableItems: [],
  });
  
  // Discount options
  const discountOptions = ['10% Off', '15% Off', '20% Off', '25% Off', '30% Off', '50% Off'];
  const [showDiscountDropdown, setShowDiscountDropdown] = useState(false);
  const [showItemsSelection, setShowItemsSelection] = useState(false);

  const handleDelete = (item) => {
    setSelectedPromotion(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setPromotions(promotions.filter(item => item.id !== selectedPromotion.id));
    setShowDeleteModal(false);
    setSelectedPromotion(null);
  };

  const handleViewDetails = (item) => {
    setSelectedPromotion(item);
    setShowDetailsModal(true);
  };

  const toggleItemSelection = (id) => {
    const updatedItems = [...menuItems];
    const itemIndex = updatedItems.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      updatedItems[itemIndex].selected = !updatedItems[itemIndex].selected;
      setMenuItems(updatedItems);
    }
  };

  const addNewPromotion = () => {
    if (!newPromotion.name || !newPromotion.discount) {
      Alert.alert("Missing Information", "Please provide at least a name and discount for the promotion");
      return;
    }
    
    const selectedItems = menuItems.filter(item => item.selected).map(item => item.name);
    
    if (selectedItems.length === 0) {
      Alert.alert("Missing Information", "Please select at least one menu item for this promotion");
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: newPromotion.name,
      discount: newPromotion.discount,
      period: `${newPromotion.startDate} - ${newPromotion.endDate}`,
      startDate: newPromotion.startDate,
      endDate: newPromotion.endDate,
      applicableItems: selectedItems,
    };
    
    setPromotions([...promotions, newItem]);
    setShowAddPromotionModal(false);
    
    // Reset form and selections
    setNewPromotion({
      name: '',
      discount: '',
      startDate: new Date().toLocaleDateString(),
      endDate: new Date().toLocaleDateString(),
      applicableItems: [],
    });
    
    const resetItems = menuItems.map(item => ({...item, selected: false}));
    setMenuItems(resetItems);
  };

  const renderItem = ({ item }) => (
    <View style={styles.promotionRow}>
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
      <View style={styles.discountContainer}>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
      <View style={styles.periodContainer}>
        <Text style={styles.periodText}>{item.period}</Text>
      </View>
      <View style={styles.itemsContainer}>
        <View style={styles.itemTags}>
          {item.applicableItems.map((menuItem, index) => (
            <View key={index} style={styles.itemTag}>
              <Text style={styles.itemTagText}>{menuItem}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleViewDetails(item)}
        >
          <Feather name="eye" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
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
        <DraggableSidebar navigation={navigation} currentScreen="Promotions" />
        
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
                placeholder="Search promotions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddPromotionModal(true)}
            >
              <Feather name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Promotion</Text>
            </TouchableOpacity>
          </View>
          
          {/* Promotions Header */}
          <View style={styles.promotionsHeader}>
            <Text style={styles.promotionsTitle}>Promotions</Text>
            <Text style={styles.promotionsSubtitle}>Manage special offers and discounts</Text>
          </View>
          
          {/* Promotions Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Discount</Text>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Period</Text>
              <Text style={[styles.columnHeader, { flex: 3 }]}>Applicable Items</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Actions</Text>
            </View>
            
            <FlatList
              data={promotions.filter(item => 
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
              <Text style={styles.deleteModalTitle}>Delete Promotion</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedPromotion?.name}? This action cannot be undone.
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
      
      {/* Add Promotion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddPromotionModal}
        onRequestClose={() => setShowAddPromotionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addPromotionModalContent}>
            <View style={styles.addPromotionHeader}>
              <Text style={styles.addPromotionTitle}>Add Promotion</Text>
              <Text style={styles.addPromotionSubtitle}>Create a new special offer or discount</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Promotion Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter promotion name"
                value={newPromotion.name}
                onChangeText={(text) => setNewPromotion({...newPromotion, name: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Discount Percentage</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowDiscountDropdown(!showDiscountDropdown)}
              >
                <Text>{newPromotion.discount || 'Select discount'}</Text>
                <Feather name="chevron-down" size={20} color="#000" />
              </TouchableOpacity>
              
              {showDiscountDropdown && (
                <View style={styles.dropdownMenu}>
                  {discountOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setNewPromotion({...newPromotion, discount: option});
                        setShowDiscountDropdown(false);
                      }}
                    >
                      {option === newPromotion.discount && (
                        <Feather name="check" size={16} color="#000" />
                      )}
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Start Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    value={newPromotion.startDate}
                    onChangeText={(text) => setNewPromotion({...newPromotion, startDate: text})}
                  />
                  <Feather name="calendar" size={20} color="#64748b" />
                </View>
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>End Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    value={newPromotion.endDate}
                    onChangeText={(text) => setNewPromotion({...newPromotion, endDate: text})}
                  />
                  <Feather name="calendar" size={20} color="#64748b" />
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Applicable Menu Items</Text>
              <TouchableOpacity 
                style={styles.menuItemsButton}
                onPress={() => setShowItemsSelection(!showItemsSelection)}
              >
                <Text>Select menu items</Text>
                <Feather name={showItemsSelection ? "chevron-up" : "chevron-down"} size={20} color="#000" />
              </TouchableOpacity>
              
              {showItemsSelection && (
                <View style={styles.menuItemsSelection}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItemCheckbox}
                      onPress={() => toggleItemSelection(item.id)}
                    >
                      <View style={[
                        styles.checkbox,
                        item.selected && styles.checkboxSelected
                      ]}>
                        {item.selected && <Feather name="check" size={16} color="#fff" />}
                      </View>
                      <Text style={styles.menuItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Selected items preview */}
              {menuItems.some(item => item.selected) && (
                <View style={styles.selectedItemsContainer}>
                  <Text style={styles.smallLabel}>Selected Items:</Text>
                  <View style={styles.selectedItemsTags}>
                    {menuItems.filter(item => item.selected).map((item) => (
                      <View key={item.id} style={styles.selectedItemTag}>
                        <Text style={styles.selectedItemTagText}>{item.name}</Text>
                        <TouchableOpacity
                          style={styles.removeItemButton}
                          onPress={() => toggleItemSelection(item.id)}
                        >
                          <Feather name="x" size={16} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            
            <View style={styles.addPromotionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddPromotionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addPromotionButton}
                onPress={addNewPromotion}
              >
                <Text style={styles.addPromotionButtonText}>Add Promotion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* View Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDetailsModal}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsTitle}>{selectedPromotion?.name}</Text>
                <Text style={styles.detailsSubtitle}>Promotion details</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailsBody}>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Discount</Text>
                <Text style={styles.detailsDiscount}>{selectedPromotion?.discount}</Text>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Period</Text>
                <View style={styles.detailsDates}>
                  <View style={styles.detailsDateItem}>
                    <Text style={styles.detailsDateLabel}>Start Date:</Text>
                    <Text style={styles.detailsDateValue}>{selectedPromotion?.startDate}</Text>
                  </View>
                  <View style={styles.detailsDateItem}>
                    <Text style={styles.detailsDateLabel}>End Date:</Text>
                    <Text style={styles.detailsDateValue}>{selectedPromotion?.endDate}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Applicable Menu Items</Text>
                <View style={styles.detailsItemsList}>
                  {selectedPromotion?.applicableItems.map((item, index) => (
                    <View key={index} style={styles.detailsMenuItem}>
                      <Feather name="check-circle" size={20} color="#10b981" />
                      <Text style={styles.detailsMenuItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  promotionsHeader: {
    marginBottom: 24,
  },
  promotionsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  promotionsSubtitle: {
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
  promotionRow: {
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
  discountContainer: {
    flex: 1.5,
  },
  discountText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  periodContainer: {
    flex: 2,
  },
  periodText: {
    fontSize: 16,
    color: '#64748b',
  },
  itemsContainer: {
    flex: 3,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  itemTagText: {
    fontSize: 14,
    color: '#0f172a',
  },
  actionContainer: {
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
  addPromotionModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    maxHeight: '90%',
  },
  addPromotionHeader: {
    marginBottom: 24,
  },
  addPromotionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  addPromotionSubtitle: {
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
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
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
  menuItemsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  menuItemsSelection: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 200,
    padding: 8,
  },
  menuItemCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  menuItemText: {
    fontSize: 16,
    color: '#0f172a',
  },
  selectedItemsContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  selectedItemsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedItemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemTagText: {
    fontSize: 14,
    color: '#0f172a',
    marginRight: 4,
  },
  removeItemButton: {
    padding: 2,
  },
  addPromotionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addPromotionButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPromotionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  detailsModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 600,
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
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  detailsDiscount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  detailsDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsDateItem: {
    marginRight: 24,
    marginBottom: 8,
  },
  detailsDateLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  detailsDateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  detailsItemsList: {
    marginTop: 8,
  },
  detailsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsMenuItemText: {
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 8,
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
});

export default PromotionsScreen;