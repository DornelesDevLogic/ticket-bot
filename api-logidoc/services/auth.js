
import { api, jar } from "../client.js";

const username = process.env.API_USERNAME;
const password = process.env.API_PASSWORD;

export async function login() {
  await jar.removeAllCookies();
  const response = await api.post("/system/users/logged", { username, password });
  console.log("✅ LOGIDOC login.");
  return response.data;
}