import { query } from '../config/database.js';

/**
 * Registra uma avaliação de usuário e comentário opcional no banco de dados.
 * @param {number} ticketTrakingId - ID da linha `ticketTraking`
 * @param {number} rate - Valor numérico da avaliação
 * @param {string} comment - Texto do comentário opcional (string vazia ignora a inserção do comentário)
 * @returns {Promise<{id: number}>} Objeto contendo o ID da avaliação criada
 * @throws {Error} Se parâmetros obrigatórios estiverem ausentes ou ocorrer falha na operação de banco de dados
 */
const postRating = async (ticketTrakingId, rate, comment='') => {
    // Insere comentário apenas se não for vazio
    await query(
        `INSERT INTO "UserRatingsNew" ("TicketTrakingId", rate, comment)
            VALUES ($1, $2, $3)`,
        [ticketTrakingId, rate, comment]
    );
};

export default postRating;