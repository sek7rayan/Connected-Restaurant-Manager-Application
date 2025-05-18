import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_maladie = {

 getAllPlatsForGerant : async () => {
  try {
    const response = await axios.get(`${API_URL}/Gerant_plat`);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error("Erreur : Aucun plat trouvé.");
        throw new Error("Aucun plat trouvé.");
      } else {
        console.error("Erreur serveur :", error.response.data.message || "Erreur inconnue.");
        throw new Error(error.response.data.message || "Erreur serveur");
      }
    }
  }
},
addGerantPlat : async (plat) => {
  try {
    if (
      !plat.nom ||
      !plat.image ||
      !plat.description ||
      !plat.prix ||
      !plat.calorie ||
      !plat.categorie ||
      !plat.date ||
      !plat.ingredients ||
      !Array.isArray(plat.ingredients) ||
      plat.ingredients.length === 0 ||
       !Array.isArray(plat.maladies) ||
      plat.maladies.length === 0
    ) {
      throw new Error("Tous les champs requis doivent être fournis et il faut au moins un ingrédient.");
    }

    const response = await axios.post(`${API_URL}/Gerant_plat`, plat);

    if (response.status === 201 || response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (
        error.response.status === 400 &&
        (error.response.data === "Missing fields" || error.response.data === "At least one ingredient is required")
      ) {
        throw new Error(error.response.data);
      } else if (error.response.data && typeof error.response.data === "string") {
        throw new Error(error.response.data);
      } else {
        throw new Error(error.response.data.message || "Erreur serveur");
      }
    }
  }
},
addIngredientToPlat : async (id_plat, id_ingredient, quantite) => {
  try {
    const body = {
      id_plat,
      id_ingredient,
      quantite
    };

    const response = await axios.post(`${API_URL}/Gerant_plat/ingredient`, body);

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("Missing fields");
      }
      if (error.response.status === 404) {
        throw new Error("Ingredient not added");
      }
    }
  }
},
updateIngredientToPlat : async (id_plat, id_ingredient, quantite) => {
  try {

    const body = {
      id_plat,
      id_ingredient,
      quantite
    };

    const response = await axios.patch(`${API_URL}/Gerant_plat/ingredient`, body);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 && error.response.data === "Missing fields") {
        throw new Error("Missing fields");
      }
      if (error.response.status === 400 && error.response.data === "Ingredient not added") {
        throw new Error("Ingredient not added");
      }
    }
  }
},
 deletePlatById : async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/Gerant_plat/${id}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Erreur serveur");
    } else if (error.request) {
      throw new Error("Aucune réponse reçue du serveur");
    } else {
      throw new Error("Erreur lors de la requête : " + error.message);
    }
  }
},
 updatePlatPrice : async (id_plat, prix) => {
  try {

    const body = { id_plat, prix };
    const response = await axios.patch(`${API_URL}/Gerant_plat`, body);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 && error.response.data === "Missing fields") {
        throw new Error("Missing fields");
      }
      if (error.response.status === 404 && error.response.data === "Plat not found") {
        throw new Error("Plat not found");
      }
    }

    }
  },
  deleteIngredientFromPlat : async (id_plat, id_ingredient) => {
  try {
   
    const body = { id_plat, id_ingredient };
    const response = await axios.delete(`${API_URL}/Gerant_plat`, { data: body });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 && error.response.data === "Missing fields") {
        throw new Error("Missing fields");
      }
      if (error.response.status === 404 && error.response.data === "Plat not found") {
        throw new Error("Plat not found");
      }
     
    }
  }
},
 getMaladiesByPlatId : async (id_plat) => {
  try {
   
    const response = await axios.get(`${API_URL}/platmaladie/${id_plat}`);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404 && error.response.data === "No maladies found") {
        throw new Error("Aucune maladie associée à ce plat.");
      }
   
  }
}
 },
 getIngredientsByPlatId : async (id_plat) => {
  try {
    const response = await axios.get(`${API_URL}/ingredient/plat/${id_plat}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Erreur serveur");
    } else if (error.request) {
      throw new Error("Aucune réponse reçue du serveur");
    } else {
      throw new Error("Erreur lors de la requête : " + error.message);
    }
  }
}

}



export default Api_maladie;