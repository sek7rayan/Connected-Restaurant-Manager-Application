// Voici ton fichier complet AddIngredientScreen.js corrigé
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import IngredientApi from '../api/api_ingredient';

const AddIngredientScreen = ({ navigation }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  const handleAddIngredient = async () => {
    if (!ingredientName || !ingredientQuantity) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs');
      return;
    }

    const dataToSend = {
      nom: ingredientName, // DOIT s’appeler exactement "nom"
      quantite: parseInt(ingredientQuantity, 10), // Attention: parseInt pour avoir un nombre
    };

    console.log('Données envoyées:', dataToSend);

    try {
      await IngredientApi.addIngredient(dataToSend);
      Alert.alert('Succès', "Ingrédient ajouté avec succès");
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'ingrédient:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'ingrédient');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom de l'ingrédient :</Text>
      <TextInput
        style={styles.input}
        value={ingredientName}
        onChangeText={setIngredientName}
        placeholder="Entrez le nom"
      />

      <Text style={styles.label}>Quantité :</Text>
      <TextInput
        style={styles.input}
        value={ingredientQuantity}
        onChangeText={setIngredientQuantity}
        placeholder="Entrez la quantité"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddIngredient}>
        <Text style={styles.buttonText}>Ajouter l'ingrédient</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddIngredientScreen;