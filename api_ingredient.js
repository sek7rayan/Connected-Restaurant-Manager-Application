// api/ingredientApi.js
import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const IngredientApi = {

  getIngredients: async () => {
    try {
      const response = await axios.get(`${API_URL}/ingredient`);
      if (response.status === 200) {
        console.log("✅ Response getIngredients:", response.data);
        return response.data.data;
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Server Error (getIngredients):", error.response.data.message);
        throw new Error("Server Error");
      } else {
        console.error("❌ Network Error (getIngredients):", error.message);
        throw new Error("Network Error");
      }
    }
  },

  addIngredient: async (ingredientData) => {
    try {
      const body = {
        nom: ingredientData.name,        // 🔥 Ici on traduit pour correspondre au backend
        quantite: parseInt(ingredientData.quantity),
      };
  
      console.log("📦 Data sent to backend:", body); // 👈 Ce sera maintenant bien nom et quantite
  
      const response = await axios.post(`${API_URL}/ingredient`, body);
  
      if (response.status === 201) {
        console.log("✅ Ingredient added successfully:", response.data);
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Error (addIngredient):", error.response.data.message || "Unknown error.");
        throw new Error(error.response.data.message || "Unknown error.");
      }
    }
  },

  updateIngredient: async (id, ingredientData) => {
  try {
    const body = {
      quantite: parseInt(ingredientData.quantity),
    };

    console.log("🛠️ Data sent to update ingredient:", body);
    console.log("➡️ Updating ID:", id);


    const response = await axios.patch(`${API_URL}/ingredient/${id}`, body);
    if (response.status === 200) {
      console.log("✅ Ingredient updated successfully:", response.data);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error (updateIngredient):", error.response.data.message || "Unknown error.");
      throw new Error(error.response.data.message || "Unknown error.");
    } 
  }
},

  deleteIngredient: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/ingredient/${id}`);
      if (response.status === 204) {
        console.log("🗑️ Ingredient deleted successfully.");
        return { status: 'success' };
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error("❌ Error: Ingredient not found.");
          throw new Error("Ingredient not found.");
        } 
      
      }
    }
  },
};

export default IngredientApi;
