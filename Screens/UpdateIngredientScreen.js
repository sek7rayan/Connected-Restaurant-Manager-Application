// screens/UpdateIngredientScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const UpdateIngredientScreen = ({ navigation, route }) => {
  const { ingredient, onUpdate } = route.params;
  const [quantity, setQuantity] = useState(ingredient.quantity.replace(/[^0-9.]/g, ''));
  const [unit, setUnit] = useState(ingredient.quantity.replace(/[0-9.]/g, ''));

  const handleUpdate = () => {
   onUpdate(ingredient.id_ingedient, { quantity });


    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Ingredient</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ingredient Name</Text>
          <TextInput
            style={styles.input}
            value={ingredient.name}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={ingredient.category}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Quantity</Text>
          <TextInput
            style={styles.input}
            value={ingredient.quantity}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>New Quantity</Text>
          <View style={styles.quantityInputContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />
            <TextInput
              style={styles.unitInput}
              value={unit}
              onChangeText={setUnit}
              placeholder="Unit (kg, L, etc.)"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Update Quantity</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
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
    backgroundColor: '#fff',
  },
  quantityInputContainer: {
    flexDirection: 'row',
  },
  quantityInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  unitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UpdateIngredientScreen;