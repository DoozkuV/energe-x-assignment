import axios from "axios";

const API = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export async function registeruser(name: string, email: string, password: string) {
  const res = await api.post("/api/register", { name, email, password });
  return res.data;
}

export async function loginuser(email: string, password: string) {
  console.log("Logging in user:", email);
  const res = await api.post("/api/login", { email, password });
  localStorage.setItem('token', res.data.token);
  console.log(localStorage.getItem('token'));
  return res.data;
}

// Posts endpoints 
export async function fetchPosts() {
  const res = await api.get("/api/posts");
  return res.data;
}

export async function createPost(title: string, content: string) {
  const res = await api.post("/api/posts", { title, content });
  return res.data;
}
