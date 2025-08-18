import { api } from "../client.js";

export async function getFilaCliente(codCli) {
  try {
    const res = await api.get("/fila_cliente", {
      params: { cod_cli: codCli },
    });

    const fila = res.data.FilaCli;
    if (!fila || (Array.isArray(fila) && fila.length === 0)) {
      return null;
    }
    return fila;
  } catch (err) {
    console.log(err);
    if (err.code === "ECONNABORTED") {
      console.warn(
        `⚠️ getFilaClienteService: timeout (ECONNABORTED) para cliente ${codCli}.`
      );
    } else if (err.response) {
      console.warn(
        `⚠️ getFilaClienteService: erro ${err.response.status} ao buscar fila do cliente ${codCli}.`
      );
    } else {
      console.warn(`⚠️ getFilaClienteService: erro inesperado para cliente ${codCli}:`, err.message);
    }
    return null;
  }
}
