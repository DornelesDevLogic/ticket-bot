
/**
 * Envia uma mensagem para um número de telefone especificado via API externa.
 * @param {string} number - Número de telefone do destinatário
 * @param {string} message - Conteúdo de texto a ser enviado
 * @returns {Promise<Object>} Resposta da API de envio de mensagens
 * @throws {Error} Se a requisição à API falhar ou retornar status diferente de OK
 */
const sendMessage = async (number, message) => {
  const endpoint = process.env.SEND_MESSAGE_ENDPOINT;
  const token    = process.env.SEND_MESSAGE_TOKEN;
  const payload  = { number, body: message };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    // Always attempt to parse JSON, even on error:
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    console.log(text);
    console.log(`ticket-bot>>> (${number}): ${message}`);

    return json;

  } catch (error) {
    console.error('❌ Error in sendMessage():', error);
    throw error;
  }
};

export default sendMessage;