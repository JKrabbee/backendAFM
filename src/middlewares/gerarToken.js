const gerarERenovarToken = (req, res, next) => {
    const usuarioId = req.usuarioId;

    // Encontra o usuário com base no ID
    const usuarioConectado = listaUsuarios.find((user) => user.id === usuarioId);

    // Verifique se o usuário está conectado
    if (!usuarioConectado || !usuarioConectado.conectado) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado ou não está conectado'
        });
    }

    // Verifique se o token precisa ser renovado ou gerado
    if (!usuarioConectado.token) {
        // Gere um novo token para o usuário
        const novoToken = jwt.sign({ id: usuarioId }, chaveSecreta);
        usuarioConectado.token = novoToken;
    }

    next();
};

export default gerarERenovarToken;
