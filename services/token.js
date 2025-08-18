import pkg from 'jsonwebtoken';
const { sign,verify } = pkg;
/**
 * Gera um token JWT para fins de autenticação/autorização.
 * @param {Object} payload - Objeto com os dados a serem codificados no token
 * @param {string} [secretKey=process.env.JWT_SECRET] - Chave secreta para assinatura (padrão: chave de teste)
 * @param {string|number} [expiresIn='1h'] - Tempo de expiração do token (padrão: 1 hora)
 * @returns {string} Token JWT gerado
 * @example
 * const token = gerarToken({ id: '123', usuario: 'exemplo' });
 */
function gerarToken(payload, secretKey = process.env.SECRET_KEY, expiresIn = '1h') {
  return sign(payload, secretKey, { expiresIn });
}

/**
 * Valida um token JWT e retorna seu payload se for válido.
 * @param {string} token - Token JWT a ser validado
 * @param {string} [secretKey=process.env.SECRET_KEY] - Chave secreta para verificação (padrão: chave de teste)
 * @returns {Object|null} Payload decodificado se válido, ou `null` se inválido
 * @throws {Error} Se a verificação do token falhar
 * @example
 * try {
 *   const payload = validarToken('algum.token.aqui');
 *   console.log('Token válido:', payload);
 * } catch (err) {
 *   console.error('Token inválido:', err.message);
 * }
 */
function validarToken(token, secretKey = process.env.SECRET_KEY) {
  try {
    return verify(token, secretKey);
  } catch (err) {
    return;
  }
}

export {gerarToken, validarToken};