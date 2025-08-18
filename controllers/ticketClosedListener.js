import { Client } from 'pg';

import sendMessage from '../services/sendMessage.js';
import { gerarToken } from '../services/token.js';
import { pedirAvaliacao } from '../services/messages.js';
import { mudaEtapa } from './handleUserMessages.js';
import isLogicboxUser from '../services/isLogicboxUser.js';

// ─── LISTENER FUNCTION ───────────────────────────────────────────────────────────
const listenTicketClosed = async () => {

  const client = new Client({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port:     Number(process.env.DB_PORT) || 5432,
  });
  await client.connect();

  await client.query('LISTEN ticket_finalizado');
  console.log('🔔 Listening for ticket_finalizado notifications...');

  client.on('notification', async (msg) => {
    try {
      console.log(msg.payload);

      let { ticketTrakingId, wa_id, group_wa_jid } = JSON.parse(msg.payload);
      const isGroup = group_wa_jid && group_wa_jid.includes('@g.us');

      // Workaround para erro da trigger: se wa_id for nulo, mas group_wa_jid for um ID de usuário
      if (!wa_id && group_wa_jid && !isGroup) {
        console.warn(`Workaround: wa_id é nulo. Usando group_wa_jid (${group_wa_jid}) como ID do usuário.`);
        wa_id = group_wa_jid;
        group_wa_jid = null; // Limpa o ID do grupo, pois não é um grupo
      }

      // Verificação final: se o wa_id ainda for nulo, não há o que fazer.
      if (!wa_id) {
        console.error('Notificação de ticket finalizado recebida com wa_id nulo. Payload:', msg.payload);
        if (isGroup && group_wa_jid) { // Apenas notifica o grupo se for um grupo de verdade
          await sendMessage(group_wa_jid, `Ticket encerrado. Não foi possível enviar o link de avaliação pois o ID do usuário não foi localizado.`);
        }
        return; // Interrompe a execução para este evento
      }

      // Normaliza o ID do usuário para consultas no banco de dados, removendo o sufixo do WhatsApp.
      // O wa_id original (com sufixo) é mantido para o envio da mensagem.
      const normalizedWaId = wa_id.split('@')[0];

      // Verifica se o usuário está bloqueado por excesso de tentativas commit teste
      const userStatusResult = await client.query(
        'SELECT menu_block_until FROM ticketbotposition WHERE wa_id = $1',
        [normalizedWaId]
      );

      if (userStatusResult.rows.length > 0) {
        const { menu_block_until } = userStatusResult.rows[0];
        if (menu_block_until && new Date(menu_block_until) > new Date()) {
          console.log(`Usuário ${normalizedWaId} está bloqueado. A avaliação não será enviada.`);
          return; // Não envia a avaliação para usuários bloqueados
        }
      }

      const linkGerado = `${process.env.RATING_URL}${gerarToken({ ticketTrakingId })}`;
      const mensagemAvaliacao = pedirAvaliacao(linkGerado);

      await mudaEtapa(normalizedWaId, 0);

      if (await isLogicboxUser(normalizedWaId)) {
        console.log(`${normalizedWaId}: É logicbox - não envia avaliação`);
        return;
      }
      
      await sendMessage(wa_id, mensagemAvaliacao);

      // Apenas envia a mensagem de encerramento para o grupo se for um grupo
      if (isGroup && group_wa_jid) {
        await sendMessage(group_wa_jid, `Ticket encerrado, link de avaliação de atendimento enviado para:\n*${normalizedWaId}*`);
      }
        
    } catch (err) {
      console.error('Error handling notification:', err);
    }
  });

  client.on('error', (err) => {
    console.error('Postgres client error:', err);
    process.exit(1);
  });
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────────
export default listenTicketClosed;