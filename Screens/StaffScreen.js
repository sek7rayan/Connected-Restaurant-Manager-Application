// screens/StaffScreen.js
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

const StaffScreen = ({ navigation }) => {
  const { sidebarWidth } = useSidebar();
  const [staffMembers, setStaffMembers] = useState([
    { 
      id: '1', 
      firstName: 'John',
      lastName: 'Doe',
      age: 28,
      jobTitle: 'Chef',
      email: 'john.doe@gmail.com',
      phone: '555-123-4567',
      password: 'password123',
      assignedTables: ['Table 1', 'Table 2', 'Table 3', 'Table 4'],
    },
    { 
      id: '2', 
      firstName: 'Jane',
      lastName: 'Smith',
      age: 25,
      jobTitle: 'Waiter',
      email: 'jane.smith@gmail.com',
      phone: '555-987-6543',
      password: 'password456',
      assignedTables: ['Table 5', 'Table 6'],
    },
    { 
      id: '3', 
      firstName: 'Mike',
      lastName: 'Johnson',
      age: 32,
      jobTitle: 'Manager',
      email: 'mike.johnson@gmail.com',
      phone: '555-456-7890',
      password: 'password789',
      assignedTables: [],
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Available tables
  const [availableTables, setAvailableTables] = useState([
    { id: '1', name: 'Table 1', selected: false },
    { id: '2', name: 'Table 2', selected: false },
    { id: '3', name: 'Table 3', selected: false },
    { id: '4', name: 'Table 4', selected: false },
    { id: '5', name: 'Table 5', selected: false },
    { id: '6', name: 'Table 6', selected: false },
    { id: '7', name: 'Table 7', selected: false },
    { id: '8', name: 'Table 8', selected: false },
  ]);
  
  // New staff form state
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    age: '',
    jobTitle: '',
    email: '',
    phone: '',
    password: '',
    assignedTables: [],
  });
  
  // Job title options
  const jobTitles = ['Chef', 'Waiter', 'Manager', 'Bartender', 'Host', 'Dishwasher'];
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [showTablesSelection, setShowTablesSelection] = useState(false);

  const handleDelete = (item) => {
    setSelectedStaff(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setStaffMembers(staffMembers.filter(item => item.id !== selectedStaff.id));
    setShowDeleteModal(false);
    setSelectedStaff(null);
  };

  const handleViewDetails = (item) => {
    setSelectedStaff(item);
    setShowDetailsModal(true);
  };

  const toggleTableSelection = (id) => {
    const updatedTables = [...availableTables];
    const tableIndex = updatedTables.findIndex(table => table.id === id);
    
    if (tableIndex !== -1) {
      updatedTables[tableIndex].selected = !updatedTables[tableIndex].selected;
      setAvailableTables(updatedTables);
    }
  };

  const addNewStaff = () => {
    if (!newStaff.firstName || !newStaff.lastName || !newStaff.jobTitle || !newStaff.password) {
      Alert.alert("Missing Information", "Please provide at least first name, last name, job title, and password");
      return;
    }
    
    const selectedTables = availableTables.filter(table => table.selected).map(table => table.name);
    
    const newMember = {
      id: Date.now().toString(),
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      age: parseInt(newStaff.age) || 0,
      jobTitle: newStaff.jobTitle,
      email: newStaff.email,
      phone: newStaff.phone,
      password: newStaff.password,
      assignedTables: selectedTables,
    };
    
    setStaffMembers([...staffMembers, newMember]);
    setShowAddStaffModal(false);
    
    // Reset form and selections
    setNewStaff({
      firstName: '',
      lastName: '',
      age: '',
      jobTitle: '',
      email: '',
      phone: '',
      password: '',
      assignedTables: [],
    });
    
    const resetTables = availableTables.map(table => ({...table, selected: false}));
    setAvailableTables(resetTables);
  };

  const renderItem = ({ item }) => (
    <View style={styles.staffRow}>
      <View style={styles.nameContainer}>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={24} color="#fff" />
        </View>
        <View style={styles.nameDetails}>
          <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.ageText}>{item.age} years old</Text>
        </View>
      </View>
      
      <View style={styles.jobTitleContainer}>
        <Text style={styles.jobTitleText}>{item.jobTitle}</Text>
      </View>
      
      <View style={styles.contactContainer}>
        <View style={styles.contactItem}>
          <Feather name="mail" size={16} color="#e53e3e" style={styles.contactIcon} />
          <Text style={styles.contactText}>{item.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Feather name="phone" size={16} color="#38a169" style={styles.contactIcon} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
      </View>
      
      <View style={styles.tablesContainer}>
        <View style={styles.tableTags}>
          {item.assignedTables.map((table, index) => (
            <View key={index} style={styles.tableTag}>
              <Text style={styles.tableTagText}>{table}</Text>
            </View>
          ))}
          {item.assignedTables.length === 0 && (
            <Text style={styles.noTablesText}>No tables assigned</Text>
          )}
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
        <DraggableSidebar navigation={navigation} currentScreen="Staff" />
        
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
                placeholder="Search staff..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddStaffModal(true)}
            >
              <Feather name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Staff</Text>
            </TouchableOpacity>
          </View>
          
          {/* Staff Header */}
          <View style={styles.staffHeader}>
            <Text style={styles.staffTitle}>Staff</Text>
            <Text style={styles.staffSubtitle}>Manage your restaurant staff</Text>
          </View>
          
          {/* Staff Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 3 }]}>Name</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Job title</Text>
              <Text style={[styles.columnHeader, { flex: 2.5 }]}>Contact</Text>
              <Text style={[styles.columnHeader, { flex: 3 }]}>Assigned tables</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>Actions</Text>
            </View>
            
            <FlatList
              data={staffMembers.filter(item => 
                `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Text style={styles.deleteModalTitle}>Delete Staff Member</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedStaff?.firstName} {selectedStaff?.lastName}? This action cannot be undone.
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
      
      {/* Add Staff Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddStaffModal}
        onRequestClose={() => setShowAddStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addStaffModalContent}>
            <View style={styles.addStaffHeader}>
              <Text style={styles.addStaffTitle}>Add Staff Member</Text>
              <Text style={styles.addStaffSubtitle}>Create a new staff profile</Text>
            </View>
            
            <ScrollView style={styles.addStaffForm}>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={newStaff.firstName}
                    onChangeText={(text) => setNewStaff({...newStaff, firstName: text})}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={newStaff.lastName}
                    onChangeText={(text) => setNewStaff({...newStaff, lastName: text})}
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter age"
                    value={newStaff.age}
                    onChangeText={(text) => setNewStaff({...newStaff, age: text})}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Job Title *</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowJobTitleDropdown(!showJobTitleDropdown)}
                  >
                    <Text>{newStaff.jobTitle || 'Select job title'}</Text>
                    <Feather name="chevron-down" size={20} color="#000" />
                  </TouchableOpacity>
                  
                  {showJobTitleDropdown && (
                    <View style={styles.dropdownMenu}>
                      {jobTitles.map((title, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewStaff({...newStaff, jobTitle: title});
                            setShowJobTitleDropdown(false);
                          }}
                        >
                          {title === newStaff.jobTitle && (
                            <Feather name="check" size={16} color="#000" />
                          )}
                          <Text style={styles.dropdownItemText}>{title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={newStaff.email}
                  onChangeText={(text) => setNewStaff({...newStaff, email: text})}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={newStaff.phone}
                  onChangeText={(text) => setNewStaff({...newStaff, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={newStaff.password}
                  onChangeText={(text) => setNewStaff({...newStaff, password: text})}
                  secureTextEntry={true}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Assigned Tables</Text>
                <TouchableOpacity 
                  style={styles.tablesButton}
                  onPress={() => setShowTablesSelection(!showTablesSelection)}
                >
                  <Text>Select tables</Text>
                  <Feather name={showTablesSelection ? "chevron-up" : "chevron-down"} size={20} color="#000" />
                </TouchableOpacity>
                
                {showTablesSelection && (
                  <View style={styles.tablesSelection}>
                    {availableTables.map((table) => (
                      <TouchableOpacity
                        key={table.id}
                        style={styles.tableCheckbox}
                        onPress={() => toggleTableSelection(table.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          table.selected && styles.checkboxSelected
                        ]}>
                          {table.selected && <Feather name="check" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.tableText}>{table.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Selected tables preview */}
                {availableTables.some(table => table.selected) && (
                  <View style={styles.selectedTablesContainer}>
                    <Text style={styles.smallLabel}>Selected Tables:</Text>
                    <View style={styles.selectedTablesTags}>
                      {availableTables.filter(table => table.selected).map((table) => (
                        <View key={table.id} style={styles.selectedTableTag}>
                          <Text style={styles.selectedTableTagText}>{table.name}</Text>
                          <TouchableOpacity
                            style={styles.removeTableButton}
                            onPress={() => toggleTableSelection(table.id)}
                          >
                            <Feather name="x" size={16} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.addStaffButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddStaffModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addStaffButton}
                onPress={addNewStaff}
              >
                <Text style={styles.addStaffButtonText}>Add Staff</Text>
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
                <Text style={styles.detailsTitle}>{selectedStaff?.firstName} {selectedStaff?.lastName}</Text>
                <Text style={styles.detailsSubtitle}>{selectedStaff?.jobTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Feather name="x" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailsBody}>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Personal Information</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Age:</Text>
                    <Text style={styles.detailsValue}>{selectedStaff?.age} years old</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Contact Information</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Email:</Text>
                    <Text style={styles.detailsValue}>{selectedStaff?.email}</Text>
                  </View>
                </View>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Phone:</Text>
                    <Text style={styles.detailsValue}>{selectedStaff?.phone}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Assigned Tables</Text>
                {selectedStaff?.assignedTables.length > 0 ? (
                  <View style={styles.detailsTablesList}>
                    {selectedStaff?.assignedTables.map((table, index) => (
                      <View key={index} style={styles.detailsTableItem}>
                        <Feather name="check-circle" size={20} color="#10b981" />
                        <Text style={styles.detailsTableItemText}>{table}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noTablesText}>No tables assigned</Text>
                )}
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Account Information</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Password:</Text>
                    <Text style={styles.detailsValue}>••••••••</Text>
                  </View>
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
  staffHeader: {
    marginBottom: 24,
  },
  staffTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  staffSubtitle: {
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
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  nameContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameDetails: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  ageText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  jobTitleContainer: {
    flex: 1.5,
  },
  jobTitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  contactContainer: {
    flex: 2.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
  },
  tablesContainer: {
    flex: 3,
  },
  tableTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  tableTagText: {
    fontSize: 14,
    color: '#0f172a',
  },
  noTablesText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
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
  addStaffModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 600,
    maxHeight: '90%',
  },
  addStaffHeader: {
    marginBottom: 24,
  },
  addStaffTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  addStaffSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  addStaffForm: {
    flex: 1,
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
  tablesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  tablesSelection: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 200,
    padding: 8,
  },
  tableCheckbox: {
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
  tableText: {
    fontSize: 16,
    color: '#0f172a',
  },
  selectedTablesContainer: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  selectedTablesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTableTagText: {
    fontSize: 14,
    color: '#0f172a',
    marginRight: 4,
  },
  removeTableButton: {
    padding: 2,
  },
  addStaffButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addStaffButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStaffButtonText: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  detailsRow: {
    marginBottom: 8,
  },
  detailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 16,
    color: '#64748b',
    width: 80,
  },
  detailsValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  detailsTablesList: {
    marginTop: 8,
  },
  detailsTableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTableItemText: {
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

export default StaffScreen;