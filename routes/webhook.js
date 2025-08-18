import responder from '../controllers/handleUserMessages.js';
import { handleAdminMessage } from '../controllers/handleAdminMessage.js';
import { isEnabled } from '../utils/maintenance.js';
import isLogicboxUser from '../services/isLogicboxUser.js';

const webhook = async (req, res) => {
  try {
    // Extrair os dados
    const telefone = req.body.key.remoteJid.match(/\d+/g)[0];
    const mensagem =
      req.body?.message?.conversation ??
      req.body?.message?.extendedTextMessage?.text;

    // Fluxo de admin do robô
    if (telefone == process.env.ADMIN_WHATSAPP) {
      handleAdminMessage(mensagem);
      return res.status(200).send('Mensagem de admin tratada.');
    }

    // Fluxo de usuário
    const id = req.body.key.id;
    const nome = req.body.pushName || '😊';

    if (!telefone || !id || !nome || !mensagem) {
      console.error('Parâmetros faltando:', { telefone, id, nome, mensagem });
      return res.status(400).send('Parâmetros faltando.');
    }

    console.log(`${telefone}>>> ${mensagem} Webhooks.js`);

    const maintenance = isEnabled();
    const logicbox = await isLogicboxUser(telefone);

    console.log('isEnabled:', maintenance);
    console.log('isLogicboxUser:', logicbox);

   /*if (maintenance || logicbox) {
      console.log('Mensagem ignorada por manutenção ou por ser LogicboxUser.');
      return res.status(200).send('Mensagem ignorada.');
    }
      */

    console.log('Enviando para responder...');
    await responder(telefone, id, nome, mensagem);
    console.log('Resposta enviada.');

    res.status(200).send('Mensagem recebida com sucesso.');
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(500).send('Erro interno no servidor.');
  }
};

export default webhook;
