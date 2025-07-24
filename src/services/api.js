import axios from "axios";

const API = "http://localhost:5000/api/devices";

// Fetch all devices
export const fetchDevices = async () => {
  const res = await axios.get(API);
  return res.data;
};

// Create a new device
export const createDevice = async (name, type = "fan") => {
  const res = await axios.post(API, { name, type });
  return res.data;
};

// Toggle switch (ON/OFF) by name
export const updateSwitch = async (name, switchState) => {
  const res = await axios.put(`${API}/switch`, { switchState }, { params: { name } });
  return res.data;
};

// Device status is only updated by IoT, so we don’t expose a control API here

// Update name/type
export const updateDevice = async (id, updates) => {
  const res = await axios.put(`${API}/${id}`, updates);
  return res.data;
};

// Delete device
export const deleteDevice = async (name) => {
  const res = await axios.delete(`${API}/delete`, { params: { name } });
  return res.data;
};
