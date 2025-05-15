// api/api_personnel.js
import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const PersonnelApi = {
  // 🔍 1. Récupérer tous les personnels
  getAllPersonnel: async () => {
    try {
      const response = await axios.get(`${API_URL}/Personnel`);
      if (response.status === 200) {
        console.log("✅ Fetched personnels:", response.data.data.personnels);
        return response.data.data.personnels;
      }
    } catch (error) {
      handleError("getAllPersonnel", error);
    }
  },

  // 🔍 2. Récupérer un personnel par ID
  getPersonnelById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Personnel/${id}`);
      if (response.status === 200) {
        console.log("✅ Fetched personnel:", response.data.data.perso);
        return response.data.data.perso;
      }
    } catch (error) {
      handleError("getPersonnelById", error);
    }
  },

  // ➕ 3. Ajouter un personnel
  addPersonnel: async (personnelData) => {
    try {
      console.log("📦 Data sent to backend (add):", personnelData);

      const response = await axios.post(`${API_URL}/inscription-personnel`, personnelData);
      if (response.status === 201) {
        console.log("✅ Personnel added:", response.data.data.personnel);
        return response.data.data.personnel;
      }
    } catch (error) {
      handleError("addPersonnel", error);
    }
  },

  // ❌ 4. Supprimer un personnel
  deletePersonnel: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Personnel/${id}`);
      if (response.status === 204) {
        console.log("🗑️ Personnel deleted successfully.");
        return true;
      }
    } catch (error) {
      handleError("deletePersonnel", error);
    }
  },

  // 🔄 5. Changer la table d’un serveur
  changeServeurTable: async (id, id_table) => {
    try {
      const response = await axios.patch(`${API_URL}/Personnel/${id}`, { id_table });
      if (response.status === 200) {
        console.log("🔁 Table changed for serveur:", response.data.data.newTable);
        return response.data.data.newTable;
      }
    } catch (error) {
      handleError("changeServeurTable", error);
    }
  },
};

// 🔧 Gestion centralisée des erreurs
const handleError = (method, error) => {
  if (error.response) {
    console.error(`❌ Server Error (${method}):`, error.response.data.message || "Unknown error");
    throw new Error(error.response.data.message || "Server Error");
  } else if (error.request) {
    console.error(`❌ No response from server (${method})`);
    throw new Error("No response from server");
  } else {
    console.error(`❌ Request Error (${method}):`, error.message);
    throw new Error("Request Error");
  }
};

export default PersonnelApi;
