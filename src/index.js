import express from 'express';
import jwt from 'jsonwebtoken';
import verificarToken from './middlewares/verificarToken';

const app = express();
app.use(express.json());

//Chave secreta
const chaveSecreta = '8Z!9X$7Y@6W#5V%4U^3T&2S*1R(0Q)P_O+N=M-L;K:J<IH>G&F%E$D#C@B!A';

app.listen(8090, () => console.log("Servidor iniciado"));
   
//DATABASE
export const listaUsuarios = [];

//CONFIGURAÇÃO DO CORS
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    // res.header('Access-Control-Allow-Origin', 'http://seu-domínio.com'); // Permite uma origem específica
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    next();
});


//CRIAR USUARIO
app.post('/usuarios/cadastrar', (request, response) => {
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
    });
});

//LOGIN
app.post('/usuarios/login', (request, response) => {
    const login = request.body;

    const usuarioCadastrado = listaUsuarios.find(
        (user) => user.email === login.email && user.password === login.password
    );

    if (!usuarioCadastrado) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Usuário não cadastrado'
        });
    }

    // Gerar o token
    const token = jwt.sign({ id: usuarioCadastrado.id }, chaveSecreta);

    usuarioCadastrado.token = token;

    return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário conectado!',
        dados: {
            token: token,
            email: usuarioCadastrado.email
        }
    });
});

//CRIAR RECADOS
app.post('/recados', verificarToken, (request, response) => {
    const usuarioId = request.usuarioId;

    // Encontra o usuário com base no ID
    const usuarioConectado = listaUsuarios.find((user) => user.id === usuarioId);

    // Verifica se o usuário está conectado
    if (!usuarioConectado) {
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

    usuarioConectado.recados.push(novoRecado);

    return response.status(201).json({
        sucesso: true,
        dados: novoRecado,
        mensagem: 'Recado encaminhado!'
    });
});

//LISTAR RECADOS
app.get('/recados', verificarToken, (request, response) => {
    const usuarioId = request.usuarioId;

    // Encontra o usuário com base no ID
    const usuarioConectado = listaUsuarios.find((user) => user.id === usuarioId);

    // Verifica se o usuário está conectado
    if (!usuarioConectado) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado ou não está conectado'
        });
    }

    const queryParametro = request.query

    const pagina = Number(queryParametro.pagina) || 1

    const limit = 5;

    const inicioDoCorte = (pagina - 1) * limit

    const aux = [...usuarioConectado.recados]

    const resultado = aux.splice(inicioDoCorte, limit)

    const totalPaginas = Math.ceil(usuarioConectado.recados.length / limit)
  
    return response.status(200).json({
        sucesso: true,
        dados: resultado,
        totalPaginas: totalPaginas,
        mensagem: 'Recados listados!'
    });
});

// ATUALIZAR RECADOS
app.put('/recados/:id', verificarToken, (request, response) => {
    const recadoId = request.params.id;
    const recadoAtualizado = request.body;
    const usuarioId = request.usuarioId;
  
    // Encontra o usuário com base no ID
    const usuarioConectado = listaUsuarios.find(user => user.id === usuarioId);
  
    // Verifica se o usuário está conectado
    if (!usuarioConectado) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }
  
    usuarioConectado.recados.forEach((recado) => {
      if (recado.id == recadoId) {
        recado.titulo = recadoAtualizado.titulo;
        recado.descricao = recadoAtualizado.descricao;
      }
    });
  
    return response.status(200).json({
      sucesso: true,
      dados: recadoAtualizado,
      mensagem: 'Recado atualizado'
    });
  });
  
// DELETAR RECADOS
app.delete('/recados/delete/:id', verificarToken, (request, response) => {
    const recadoId = request.params.id;
    const usuarioId = request.usuarioId;
  
    // Encontra o usuário com base no ID
    const usuarioConectado = listaUsuarios.find(user => user.id === usuarioId);
  
    // Verifica se o usuário está conectado
    if (!usuarioConectado) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou não está conectado'
      });
    }
  
    const recadoIndex = usuarioConectado.recados.findIndex(recado => recado.id == recadoId);
    if (recadoIndex === -1) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Recado não encontrado'
      });
    }
  
    usuarioConectado.recados.splice(recadoIndex, 1);
  
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Recado deletado'
    });
  });
  