
import postRating from '../services/postRating.js';
import {validarToken} from '../services/token.js';

const avaliacao = async (req, res) => {

    // Extrair os dados e validar token
    const rate = req.body.rating;
    const comment = req.body.comment;
    const tokenDecoded = validarToken(req.body.token);
  
    if(!tokenDecoded) {
      res.status(400).send('Token inválido.');
      return;
    }
    
    if (!rate) {
      res.status(401).send('Parâmetros faltando: {rate}.');
      return;
    }
  
    // Postar rating
    try {
      await postRating(tokenDecoded.ticketTrakingId, rate, comment);
    } catch (error) {
  
    if (error.constraint === 'userratingsnew_unique') {
        res.status(403).send('Avaliacao duplicada recebida.');
        return;
    }
  
    res.status(500).send(`Erro ao postar avaliacao: ${error}`);
    return;
  }
  
    res.status(200).send('Avaliação recebida com sucesso.');
}

export default avaliacao;