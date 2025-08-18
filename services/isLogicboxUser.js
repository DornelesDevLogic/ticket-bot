import { query } from "../config/database.js";

const isLogicboxUser = async (telefone) => {
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

  // checar se possui Logicbox no nome
  const isLogicbox = /logicbox/i.test(name);

  return isLogicbox;
};

export default isLogicboxUser;