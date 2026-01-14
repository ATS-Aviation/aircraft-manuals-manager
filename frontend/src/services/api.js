import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Customers
export const getCustomers = () => axios.get(`${API_BASE_URL}/customers/`);
export const getCustomer = (id) => axios.get(`${API_BASE_URL}/customers/${id}`);
export const createCustomer = (data) => axios.post(`${API_BASE_URL}/customers/`, data);
export const updateCustomer = (id, data) => axios.put(`${API_BASE_URL}/customers/${id}`, data);
export const deleteCustomer = (id) => axios.delete(`${API_BASE_URL}/customers/${id}`);

// Aircraft
export const getAircraft = () => axios.get(`${API_BASE_URL}/aircraft/`);
export const getAircraftById = (id) => axios.get(`${API_BASE_URL}/aircraft/${id}`);
export const getAircraftByCustomer = (customerId) => axios.get(`${API_BASE_URL}/aircraft/customer/${customerId}`);
export const createAircraft = (data) => axios.post(`${API_BASE_URL}/aircraft/`, data);
export const updateAircraft = (id, data) => axios.put(`${API_BASE_URL}/aircraft/${id}`, data);
export const deleteAircraft = (id) => axios.delete(`${API_BASE_URL}/aircraft/${id}`);

// Manual Apps
export const getManualApps = () => axios.get(`${API_BASE_URL}/manual-apps/`);
export const getManualAppById = (id) => axios.get(`${API_BASE_URL}/manual-apps/${id}`);
export const getManualAppsByAircraft = (aircraftId) => axios.get(`${API_BASE_URL}/manual-apps/aircraft/${aircraftId}`);
export const createManualApp = (data) => axios.post(`${API_BASE_URL}/manual-apps/`, data);
export const updateManualApp = (id, data) => axios.put(`${API_BASE_URL}/manual-apps/${id}`, data);
export const deleteManualApp = (id) => axios.delete(`${API_BASE_URL}/manual-apps/${id}`);
export const testManualApp = (id) => axios.get(`${API_BASE_URL}/manual-apps/${id}/test`);
export const reloadNginx = () => axios.post(`${API_BASE_URL}/manual-apps/nginx/reload`);
