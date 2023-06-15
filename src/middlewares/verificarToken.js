import jwt from 'jsonwebtoken';
import {listaUsuarios} from '../index.js'

const chaveSecreta = '8Z!9X$7Y@6W#5V%4U^3T&2S*1R(0Q)P_O+N=M-L;K:J<IH>G&F%E$D#C@B!A';

const verificarToken = (req, res, next) => {
  const authorization = req.headers.authorization
  let token = authorization.split(' ')
  token = token[1]

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, chaveSecreta);
    const usuarioId = decoded.id;

    // Verifique se o usuário está conectado
    const usuarioConectado = listaUsuarios.find((user) => user.id === usuarioId);

    if (!usuarioConectado) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }

    req.usuarioId = usuarioId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
};

export default verificarToken;
