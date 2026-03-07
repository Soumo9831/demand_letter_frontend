import api from "./axios";

const getToken = () => localStorage.getItem("authToken");

/**
 * ==========================================
 * 📄 Get Latest Demands
 * ==========================================
 */
export const getLatestDemands = async (executive: string) => {
  const res = await api.get("/demands/latest", {
    params: { executive },
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
};

/**
 * ==========================================
 * 📜 Get Demand History
 * ==========================================
 */
export const getDemandHistory = async (demandId: string) => {
  const res = await api.get(`/demands/history/${demandId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
};

/**
 * ==========================================
 * ❌ Delete Demand
 * ==========================================
 */
export const deleteDemand = async (demandId: string) => {
  const res = await api.delete(`/demands/${demandId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
};

/**
 * ==========================================
 * ➕ Create Demand
 * ==========================================
 */
export const createDemand = async (payload: any) => {
  const res = await api.post("/demands", payload, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
};
