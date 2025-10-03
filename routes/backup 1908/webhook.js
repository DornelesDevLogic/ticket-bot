
import responder from '../controllers/handleUserMessages.js';
import {handleAdminMessage} from '../controllers/handleAdminMessage.js';
import { isEnabled } from '../utils/maintenance.js';
import isLogicboxUser from '../services/isLogicboxUser.js'

const webhook = async (req, res) => {
    // Extrair os dados
    const telefone = req.body.key.remoteJid.match(/\d+/g)[0];
    const mensagem =
      req.body?.message?.conversation ??
      req.body?.message?.extendedTextMessage?.text;

    // Fluxo de admin do robô
    if (telefone == process.env.ADMIN_WHATSAPP) {
      handleAdminMessage(mensagem);
      return;
    }

    // Fluxo de usuário
    const id = req.body.key.id;
    const nome = req.body.pushName || '😊';
  
    if (!telefone || !id || !nome || !mensagem) {
      throw new Error('Parâmetros faltando: {telefone, id, nome, mensagem}. req: ', req);
    }

    console.log(`${telefone}>>> ${mensagem}`);

    if (isEnabled() || await isLogicboxUser(telefone)) {
      return;
    }

    await responder(telefone, id, nome, mensagem);
  
    res.status(200).send('Mensagem recebida com sucesso.');
};

export default webhook;