import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_maladie = {
  // Récupérer toutes les maladies
  getMaladies: async () => {
    try {
      const response = await axios.get(`${API_URL}/maladie`);
      if (response.status === 200) {
        return response.data.data.maladies;
      }
    } catch (error) {
      handleError("Erreur lors de la récupération des maladies", error);
      throw error;
    }
  },

  // Ajouter une nouvelle maladie
  addMaladie: async ({ nom_maladie, desc_maladie }) => {
    try {
      console.log("👀 [Api_maladie] Données envoyées à l'API:", { nom_maladie, desc_maladie });
      const response = await axios.post(`${API_URL}/maladie`, {
        nom_maladie,
        desc_maladie,
      });

      if (response.status === 201) {
        return response.data.data.maladie;
      }
    } catch (error) {
      handleError("Erreur lors de l'ajout de la maladie", error);
      throw error;
    }
  },

  // Supprimer une maladie par son ID
  deleteMaladie: async (id_maladie) => {
    try {
      const response = await axios.delete(`${API_URL}/maladie/${id_maladie}`);
      if (response.status === 204) {
        return true;
      }
    } catch (error) {
      handleError("Erreur lors de la suppression de la maladie", error);
      throw error;
    }
  },

  // Récupérer une maladie par ID
  getMaladieById: async (id_maladie) => {
    try {
      const response = await axios.get(`${API_URL}/maladie/${id_maladie}`);
      if (response.status === 200) {
        return response.data.data.maladie;
      }
    } catch (error) {
      handleError("Erreur lors de la récupération de la maladie", error);
      throw error;
    }
  },
};

// Utilitaire de gestion d'erreurs
const handleError = (message, error) => {
  if (error.response) {
    console.error(`${message} : ${error.response.data.message}`);
  } else if (error.request) {
    console.error(`${message} : Aucune réponse du serveur`);
  } else {
    console.error(`${message} :`, error.message);
  }
};

export default Api_maladie;
