import axios from "axios";
import axiosRetry from "axios-retry";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import dotenv from "dotenv";
import { login } from "./services/auth.js";

dotenv.config();

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const jar = new CookieJar();
const api = wrapper(
  axios.create({
    baseURL: process.env.API_BASE_URL,
    jar,
    withCredentials: true,
    timeout: 1000, // 1s de timeout por request
    headers: {
      "Content-Type": "application/json",
    },
  })
);

// Interceptor para 401 → login + retry
api.interceptors.response.use(null, async (error) => {
  const { response, config } = error;
  if (response?.status === 401 && !config._retry_401) {
    config._retry_401 = true;
    console.log("🔄 401 detectado, renovando sessão e retry...");
    await login();
    return api(config);
  }
  return Promise.reject(error);
});

// --- Definição de retryDelay customizado ---
function retryDelaySegMinHoras(retryCount) {
  switch (retryCount) {
    case 1:
      // primeira tentativa de retry: 10 segundos
      return 10 * 1000;
    case 2:
      // segunda tentativa de retry: 1 minuto
      return 1 * 60 * 1000;
    case 3:
      // terceira tentativa de retry: 1 hora
      return 1 * 60 * 60 * 1000;
    case 4:
      // quarta (e última) tentativa de retry: 6 horas
      return 6 * 60 * 60 * 1000;
    default:
      // se, por algum motivo, retryCount > 4, não aguarda (mas não ocorrerão mais retries, pois 'retries' = 4)
      return 0;
  }
}

// Configura o axios-retry para 4 retries com nossos delays “segundos, minutos, horas”
axiosRetry(api, {
  retries: 4,               // faz exatamente 4 tentativas de retry
  retryDelay: retryDelaySegMinHoras,
  retryCondition: (error) => {
    // retry em erro de rede (timeout, ECONNRESET etc.)
    if (axiosRetry.isNetworkError(error)) {
      return true;
    }
    // retry em status 5xx
    const status = error.response?.status;
    if (status >= 500 && status < 600) {
      return true;
    }
    return false;
  },
  onRetry: (retryCount, error, requestConfig) => {
    // Apenas para logar cada tentativa
    let textoIntervalo;
    switch (retryCount) {
      case 1:
        textoIntervalo = "10 segundos";
        break;
      case 2:
        textoIntervalo = "1 minuto";
        break;
      case 3:
        textoIntervalo = "1 hora";
        break;
      case 4:
        textoIntervalo = "6 horas";
        break;
      default:
        textoIntervalo = "nenhum";
    }
    console.warn(
      `🔁 Retry #${retryCount} para ${requestConfig.method.toUpperCase()} ${requestConfig.url} – aguardando ${textoIntervalo}`
    );
  },
});

export { api, jar };