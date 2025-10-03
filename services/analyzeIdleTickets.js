import { query } from '../config/database.js';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

async function checkIdleTickets() {
    try {
        const result = await query(`
            SELECT id, updatedAt
            FROM "Tickets"
            WHERE status = 'pending'
              AND EXTRACT(EPOCH FROM (NOW() - "updatedAt")) > 60;
        `);

        if (result.rows.length > 0) {
            console.log('Tickets pendentes há mais de 1 minuto:');
            result.rows.forEach(ticket => {
                console.log(`ID: ${ticket.id} | Última atualização: ${ticket.updatedAt}`);
            });
        } else {
            console.log('Nenhum ticket pendente há mais de 1 minuto.');
        }
    } catch (error) {
        console.error('Erro ao consultar tickets pendentes:', error);
    }
}

// Executa a cada 5 minutos
setInterval(checkIdleTickets, CHECK_INTERVAL_MS);

// Opcional: executa imediatamente ao iniciar
checkIdleTickets();