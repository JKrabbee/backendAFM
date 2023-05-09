import express, { query } from 'express';
const app = express();
app.use(express.json());

app.listen(8090, () => console.log("Servidor iniciado"));
   
//DATABASE
const listaUsuarios = [];
//CRIAR USUARIO
app.post('/usuarios', (request, response) => {
    const dados = request.body

    if (!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')){
        return response.status(400).json({
            sucesso: false,
            dados: null,
            mensagem: 'É obrigatório informar um e-mail válido para cadastro.'
        })
    }

    //Verifica se o e-mail já está cadastrado.
    if (listaUsuarios.some((users) => users.email === dados.email)){
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Usuario já cadastrado.'
        })
    }

    if (!dados.password || dados.password.length < 6){
        return response.status(400).json({
            sucesso: false,
            mensagem: 'É obrigatório informar uma senha com no minimo 6 caracteres.'
        })
    }

    const novoUsuario = {
        id: new Date().getTime(),
        nome: dados.nome,
        email: dados.email,
        password: dados.password,
        recados: []
    }

    listaUsuarios.push(novoUsuario)

    return response.status(201).json({
        sucesso: true,
        mensagem: 'Usuario cadastrado com sucesso!'
    })
});
//LOGIN
app.post('/login', (request, response) => {
    const login = request.body;

    const usuarioCadastrado = listaUsuarios.find(
        (user) => user.email === login.email && user.password === login.password
    );
    
    if (!usuarioCadastrado) {
        return response.status(400).json({
            sucesso: false,
            mensagem: `Usuário não cadastrado`
        })
    }

    listaUsuarios.forEach((user) => {
        user.conectado = false

        if (user.id === usuarioCadastrado.id) {
            user.conectado = true;
        }
    });

    return response.status(200).json({
        sucesso: true,
        mensagem: `Usuário conectado!`
    })

})
//CRIAR RECADOS
app.post('/recados', (request, response) => {
    const usuarioConectado = listaUsuarios.findIndex(
        (user) => user.conectado === true
    );

    // Verifica se o usuário está conectado
    if (usuarioConectado === -1 || !listaUsuarios[usuarioConectado]) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado ou não está conectado'
        });
    }

    const recado = request.body;

    // Verifica se o título e a descrição estão presentes e não são vazios
    if (!recado.titulo || !recado.descricao) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Título e descrição são obrigatórios'
        });
    }

    const novoRecado = {
        id: new Date().getTime(),
        titulo: recado.titulo,
        descricao: recado.descricao
    };

    listaUsuarios[usuarioConectado].recados.push(novoRecado);

    return response.status(201).json({
        sucesso: true,
        dados: novoRecado,
        mensagem: 'Recado encaminhado!'
    });
});
//LISTAR RECADOS
app.get('/recados', (request, response) => {
    // Verifica se o usuário está conectado
    const usuarioConectado = listaUsuarios.findIndex(user => user.conectado === true);
    if (usuarioConectado === -1 || !listaUsuarios[usuarioConectado]) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }

    const recados = listaUsuarios[usuarioConectado].recados;
  
    return response.status(200).json({
      sucesso: true,
      dados: recados,
      mensagem: 'Recados listados!'
    });
  });
//ATUALIZAR RECADOS
app.put('/recados/:id', (request, response) => {
    const recadoId = request.params.id
    const recadoAtualizado = request.body

    // Verifica se o usuário está conectado
    const usuarioConectado = listaUsuarios.findIndex(user => user.conectado === true);
    if (usuarioConectado === -1 || !listaUsuarios[usuarioConectado]) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }

    listaUsuarios[usuarioConectado].recados.forEach((recado) => {
        if (recado.id == recadoId) {
            recado.titulo = recadoAtualizado.titulo
            recado.descricao = recadoAtualizado.descricao
        }
    })

    console.log(usuarioConectado)

    return response.status(200).json({
        sucesso: true,
        dados: recadoAtualizado,
        mensagem: 'Recado atualizado'
    })
})
//DELETAR RECADOS
app.delete('/recados/delete/:id', (request, response) => {
    const recadoId = request.params.id

        // Verifica se o usuário está conectado
        const usuarioConectado = listaUsuarios.findIndex(user => user.conectado === true);
        if (usuarioConectado === -1 || !listaUsuarios[usuarioConectado]) {
          return response.status(400).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado ou não está conectado'
          });
        }

        const recadoIndex = listaUsuarios[usuarioConectado].recados.findIndex(recado => recado.id == recadoId);
        if (recadoIndex === -1) {
            return response.status(400).json({
                sucesso: false,
                mensagem: 'Recado não encontrado'
            });
        }
    
        listaUsuarios[usuarioConectado].recados.splice(recadoIndex, 1);
    
        return response.status(200).json({
            sucesso: true,
            mensagem: 'Recado deletado'
        });
})