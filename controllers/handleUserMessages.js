
import sendMessage from '../services/sendMessage.js';
import { query } from '../config/database.js';
import { getFilaCliente } from '../api-logidoc/index.js';
import {    
    encerraAtendimento,
    saudacoes,
    opcoesMenu,
    menuSelecionado,
    horarioDeAtendimento,
    opcoesSuporte,
    suporteSelecionado,
    pedirDetalhes,
    reinicio
} from '../services/messages.js';

export const mudaEtapa = async (telefone, etapa) => {
    await query(
        `UPDATE ticketbotposition
         SET current_step = $2
         WHERE wa_id = $1`,[telefone, etapa]);
};

const atualizaInteracao = async (telefone, timestamp) => {
    await query(
        `UPDATE ticketbotposition
         SET last_interaction = $2
         WHERE wa_id = $1`,[telefone, timestamp]);
};

const resetMenuCounter = async (telefone) => {
    await query(
        `UPDATE ticketbotposition
         SET menu_sent_count = 0, menu_block_until = NULL
         WHERE wa_id = $1`, [telefone]);
};

const handleMenuLimit = async (telefone) => {
    const MAX_ATTEMPTS = 10;

    // Incrementa o contador de forma atômica e retorna o novo valor para evitar race conditions
    const result = await query(
        `UPDATE ticketbotposition
         SET menu_sent_count = COALESCE(menu_sent_count, 0) + 1
         WHERE wa_id = $1
         RETURNING menu_sent_count`, [telefone]);

    const newCount = result.rows[0]?.menu_sent_count || 1;
    // Log para depurar o contador de tentativas
    console.log(`[Contador de Menu] Usuário: ${telefone}, Tentativa: ${newCount}`);

    if (newCount >= MAX_ATTEMPTS) {
        // Block the user for 30 minutes
        const blockUntil = new Date(Date.now() + 30 * 60 * 1000);
        await query(
            `UPDATE ticketbotposition
             SET menu_block_until = $2
             WHERE wa_id = $1`, [telefone, blockUntil]);
        
        console.log(`Usuário ${telefone} bloqueado por 30 minutos por excesso de tentativas inválidas.`);
        await sendMessage(telefone, 'Você excedeu o número de tentativas. O atendimento automático será pausado por 30 minutos.');
        return true; // Indicates user is now blocked
    }
    
    return false; // Indicates user is not blocked
};


const mudaFila = async (id, telefone, novaFila) => {
    try {
        // Validação básica dos parâmetros
        if (!id || !telefone || !novaFila) {
            throw new Error('Erro na leitura dos campos: [id, telefone, novaFila]');
        }

        // Atualiza a fila na tabela tickets
        const result = await query(
            `UPDATE "Tickets"
             SET "queueId" = $1
             WHERE id = (SELECT "ticketId" FROM "Messages" WHERE id = $2)`,
            [novaFila, id]
        );

        // Atualiza o timestamp da tabela ticketbotposition
        await query(
            `UPDATE ticketbotposition
             SET queue_entered_at = CURRENT_TIMESTAMP
             WHERE wa_id = $1`,[telefone]);

        // Verifica se alguma linha foi afetada
        if (result.rowCount === 0) {
            console.warn(`Nenhum ticket encontrado para a mensagem com ID ${id}`);
            return false;
        }

        console.log(`Fila do ticket atualizada para ${novaFila} com sucesso`);
        return true;
        
    } catch (error) {
        console.error('Erro ao atualizar fila do ticket:', error);
        throw error; // Rejeita a promise para tratamento externo
    }
};

const checkFila = async (ticketid) => { 
    const res = await query(
        `SELECT "queueId"
         FROM "Tickets"
         WHERE id = $1`,
    [ticketid]);

    // Se não houver resultados ou queueId for null, retorna 1
    return res.rows[0]?.queueId || 1;
};

const checkHorarioDeAtendimento = (data) => {
  // Verifica se é realmente um Date
  if (!(data instanceof Date)) {
    throw new TypeError('Esperado um objeto Date');
  }

  const dia = data.getDay();       // 0 = domingo, 6 = sábado
  const hora = data.getHours();    // 0–23
  const minuto = data.getMinutes();// 0–59

  const minutosTotais = hora * 60 + minuto;
  const inicioExpediente = 8 * 60; // 08:00 → 480 min

  // **18:00 nos finais de semana (sábado/domingo) e 22:00 de segunda a sexta**
  const fimExpediente = (dia === 0 || dia === 6)
    ? 18 * 60   // sábado/domingo → 18:00 → 1080 min
    : 22 * 60;  // segunda–sexta → 22:00 → 1320 min

  // Fora do horário permitido: antes de 08:00 ou a partir de fimExpediente
  if (minutosTotais < inicioExpediente || minutosTotais >= fimExpediente) {
    return false;
  }

  return true;
};

const getNomeDaFila = async (fila) => {
    const res = await query(
        `SELECT name
         FROM "Queues"
         WHERE id = $1`,[fila]);

    return res.rows[0]?.name || null;
};

const getInfoContact = async (telefone) => {
  try {
    const { rows } = await query(
      `SELECT name
       FROM "Contacts"
       WHERE number = $1
       LIMIT 1`,
      [telefone]
    );

    // 1) Caso não haja contato
    if (rows.length === 0 || !rows[0].name) {
      return null;
    }
    const { name } = rows[0];

    // 2) Extrair infos do contato
    const match = name.match(/(\d{3,6})$/);
    const fila = match ? match[1] : null;
    const isLogicbox = /logicbox/i.test(name);

    return { fila, isLogicbox };

  } catch (err) {
    console.error('getCodCliente error for', telefone, err);
    throw err;
  }
};

// Pega o último dígito de dada string
const getLastNumber = (input) => {
  const allDigits = input.match(/\d/g);

  if (!allDigits) {
    return null;
  }

  return allDigits[allDigits.length - 1];
};


/**
 * Determina e envia uma resposta apropriada ao usuário com base nas regras de negócio.
 * @param {string} telefone - Número de telefone do usuário
 * @param {number} id - ID do usuário
 * @param {string} nome - Nome do usuário
 * @param {string} mensagem - Conteúdo da mensagem recebida
 * @returns {Promise<Object>} Resultado da operação de envio de resposta
 * @throws {Error} Se a geração ou o envio da resposta falhar
 */
const responder = async (telefone, id, nome, mensagem) => {
    // Buscar o usuário
    let infosUsuario = await query(
        `SELECT wa_id, wa_name, last_interaction, current_step, ticketid, menu_sent_count, menu_block_until
         FROM ticketbotposition 
         WHERE wa_id = $1`, [telefone]);

    // Se o usuário não existe, cria e reconsulta
    if (infosUsuario.rowCount === 0) {
        await query(
            `INSERT INTO ticketbotposition (wa_id, wa_name, last_interaction, current_step, ticketid, menu_sent_count, menu_block_until) 
             VALUES ($1, $2, current_timestamp, 0, (SELECT "ticketId" FROM "Messages" WHERE id = $3), 0, null)`,
            [telefone, nome, id]);

        console.log('Novo usuário criado com sucesso.');

        // Reconsulta os dados do usuário
        infosUsuario = await query(
            `SELECT wa_id, wa_name, last_interaction, current_step, ticketid, menu_sent_count, menu_block_until
             FROM ticketbotposition 
             WHERE wa_id = $1`, [telefone]);
    }

    const { menu_sent_count, menu_block_until } = infosUsuario.rows[0];
    const now = new Date();

    if (menu_block_until && new Date(menu_block_until) > now) {
        console.log(`Usuário ${telefone} está bloqueado de receber o menu até ${menu_block_until}. Ignorando mensagem.`);
        return; // Para o processamento se o usuário estiver bloqueado
    }

    // Testamos se o cliente possui atendimento preferencial cadastrado no logidoc
    const infoCliente = await getInfoContact(telefone);
    let FILA_PREF;
    let NOME_DA_FILA_PREF;
    if (infoCliente && infoCliente.fila != null) {
        FILA_PREF = await getFilaCliente(infoCliente.fila);

        // só chama getNomeDaFila se fila for truthy
        NOME_DA_FILA_PREF = FILA_PREF && await getNomeDaFila(Number(FILA_PREF));
    }

    // Testamos se é um contato Logicbox
    if(infoCliente && infoCliente.isLogicbox)
        return;

    // Testamos se o ticket está na fila do robô (FILA = 1)
    const FILA_ATUAL = await checkFila(infosUsuario.rows[0].ticketid);
    if(FILA_ATUAL != 1)
        return;

    const ETAPA_ATUAL = infosUsuario.rows[0].current_step;
    const data = new Date();
    const horario = data.getHours();
    const ultimaInteracao = new Date(infosUsuario.rows[0].last_interaction);
    const diffEmMins = (data - ultimaInteracao) / (1000 * 60);
    atualizaInteracao(telefone, data);

    // Resetar atendimento (ETAPA <- 0)
    if (getLastNumber(mensagem) === '0') {
        await resetMenuCounter(telefone);
        await mudaEtapa(telefone, 0);
        await sendMessage(telefone, encerraAtendimento());
        return;
    }

    // Verifica se o valor é um número válido
    const tempoInativo = !isNaN(diffEmMins) && diffEmMins > 5;

    // Menu inicial (ETAPA <- 1)
    if (ETAPA_ATUAL === 0 || ETAPA_ATUAL === null || tempoInativo) {
        await resetMenuCounter(telefone);
        await sendMessage(telefone, saudacoes(nome, horario));
        await sendMessage(telefone, reinicio());
        if(!checkHorarioDeAtendimento(data))
            await sendMessage(telefone, horarioDeAtendimento());
        else {
            await mudaEtapa(telefone, 1);
            const menuMessage = opcoesMenu(NOME_DA_FILA_PREF);
            console.log(`Enviando menu inicial para ${telefone}.`);
            await sendMessage(telefone, menuMessage);
        }
        return;
    }

    // Atendimento comercial selecionado (ETAPA <- 0)
    if (ETAPA_ATUAL === 1 && getLastNumber(mensagem) === '1') {
        await resetMenuCounter(telefone);
        await mudaEtapa(telefone, 0);
        await sendMessage(telefone, menuSelecionado(1));
        await mudaFila(id, telefone, 3);
        return;
    }

    // Atendimento suporte selecionado (ETAPA <- 2)
    if (ETAPA_ATUAL === 1 && getLastNumber(mensagem) === '2' ) {
        await resetMenuCounter(telefone);
        await mudaEtapa(telefone, 2);
        await sendMessage(telefone, menuSelecionado(2));
        await sendMessage(telefone, opcoesSuporte());
        return;
    }

    // Atendimento preferencial selecionado (ETAPA <- 0)
    if (ETAPA_ATUAL === 1 && getLastNumber(mensagem) === '3' ) {
        await resetMenuCounter(telefone);
        await mudaEtapa(telefone, 0);
        await sendMessage(telefone, menuSelecionado(3, NOME_DA_FILA_PREF));
        await mudaFila(id, telefone, FILA_PREF);
        return;
    }

    // Op inválida menu 1
    if (ETAPA_ATUAL === 1) {
        const isBlocked = await handleMenuLimit(telefone);
        if (!isBlocked) {
            const invalidOptionMsg = menuSelecionado(getLastNumber(mensagem));
            const menuOptionsMsg = opcoesMenu(NOME_DA_FILA_PREF);
            const fullMessage = `${invalidOptionMsg}\n${menuOptionsMsg}`;
            console.log(`Enviando menu (opção inválida) para ${telefone}.`);
            await sendMessage(telefone, fullMessage);
        }
        return;
    }

    // Opção de suporte selecionada (ETAPA <- 0)
    if (ETAPA_ATUAL === 2 && parseInt(getLastNumber(mensagem)) > 0 && parseInt(getLastNumber(mensagem)) <= 3) {
        await resetMenuCounter(telefone);
        await sendMessage(telefone, suporteSelecionado(parseInt(getLastNumber(mensagem))));
        await sendMessage(telefone, pedirDetalhes());
        await mudaEtapa(telefone, 0);
        await mudaFila(id, telefone, 2);
        return;
    }

    // Op inválida menu 2
    if (ETAPA_ATUAL === 2) {
        const isBlocked = await handleMenuLimit(telefone);
        if (!isBlocked) {
            const invalidSupportMsg = suporteSelecionado(getLastNumber(mensagem));
            const supportOptionsMsg = opcoesSuporte();
            await sendMessage(telefone, `${invalidSupportMsg}\n${supportOptionsMsg}`);
        }
        return;
    }

};

export default responder;