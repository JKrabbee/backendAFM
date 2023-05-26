import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization;

  // Verificar se a rota atual é a rota de criação de usuários
  if (req.path === '/usuarios/cadastrar') {
    // Neste caso, não é necessário fornecer um token
    next();
    return;
  }

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

    if (!usuarioConectado || !usuarioConectado.conectado) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }

    req.usuarioId = usuarioId;
    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
};

export default verificarToken;
