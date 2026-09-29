// const API_URL = 'http://localhost:3000/alunos';




const API_URL = 'https://backend-5w5f.onrender.com/alunos';

const formulario = document.querySelector('#form-aluno');
const campoId = document.querySelector('#aluno-id');
const campoNome = document.querySelector('#nome');
const campoCpf = document.querySelector('#cpf');
const campoEmail = document.querySelector('#email');
const campoFone = document.querySelector('#fone');
const campoMatricula = document.querySelector('#matricula');
const tituloFormulario = document.querySelector('#titulo-formulario');
const botaoSalvar = document.querySelector('#botao-salvar');
const botaoCancelar = document.querySelector('#botao-cancelar');
const listaAlunos = document.querySelector('#lista-alunos');
const mensagem = document.querySelector('#mensagem');
const formularioBusca = document.querySelector('#form-busca');
const campoBuscaId = document.querySelector('#busca-id');

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || 'Não foi possível concluir a operação');
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle('erro', erro);
}

function criarCartaoAluno(aluno) {
  const cartao = document.createElement('article');
  cartao.className = 'aluno';

  const nome = document.createElement('h3');
  nome.textContent = aluno.nome;

  const cpf = document.createElement('p');
  cpf.textContent = `CPF: ${aluno.cpf}`;

  const email = document.createElement('p');
  email.textContent = `E-mail: ${aluno.email}`;

  const fone = document.createElement('p');
  fone.textContent = `Fone: ${aluno.fone}`;

  const matricula = document.createElement('p');
  matricula.textContent = `Matricula: ${aluno.matricula}`;

  const id = document.createElement('p');
  id.textContent = `ID: ${aluno._id}`;

  const acoes = document.createElement('div');
  acoes.className = 'acoes-aluno';

  const botaoEditar = document.createElement('button');
  botaoEditar.type = 'button';
  botaoEditar.textContent = 'Editar';
  botaoEditar.addEventListener('click', () =>
    carregarAlunoParaEdicao(aluno._id)
  );

  const botaoExcluir = document.createElement('button');
  botaoExcluir.type = 'button';
  botaoExcluir.className = 'perigo';
  botaoExcluir.textContent = 'Excluir';
  botaoExcluir.addEventListener('click', () => excluirAluno(aluno._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(nome, cpf, email, fone, matricula, id, acoes);

  return cartao;
}

function exibirAlunos(alunos) {
  listaAlunos.innerHTML = '';

  if (alunos.length === 0) {
    mostrarMensagem('Nenhum aluno cadastrado');
    return;
  }

  alunos.forEach(aluno => {
    listaAlunos.appendChild(criarCartaoAluno(aluno));
  });

  mostrarMensagem(`${alunos.length} aluno(s) encontrado(s)`);
}

async function listarAlunos() {
  try {
    mostrarMensagem('Carregando alunos...');
    const alunos = await fazerRequisicao(API_URL);
    exibirAlunos(alunos);
  } catch (erro) {
    listaAlunos.innerHTML = '';
    mostrarMensagem(erro.message, true);
  }
}

async function buscarAlunoPorId(id) {
  const aluno = await fazerRequisicao(`${API_URL}/${id}`);
  exibirAlunos([aluno]);
  return aluno;
}

async function salvarAluno(evento) {
  evento.preventDefault();

  const aluno = {
    nome: campoNome.value.trim(),
    cpf: campoCpf.value.trim(),
    email: campoEmail.value.trim(),
    matricula: campoMatricula.value.trim(),
  };

  if (campoFone.value.trim() !== '') {
    aluno.fone = campoFone.value.trim();
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? 'PUT' : 'POST';

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno),
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? 'Aluno atualizado' : 'Aluno cadastrado');
    await listarAlunos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarAlunoParaEdicao(id) {
  try {
    const aluno = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = aluno._id;
    campoNome.value = aluno.nome;
    campoCpf.value = aluno.cpf;
    campoEmail.value = aluno.email;
    campoFone.value = aluno.fone ?? '';
    campoMatricula.value = aluno.matricula;
    tituloFormulario.textContent = 'Editar aluno';
    botaoSalvar.textContent = 'Salvar alterações';
    botaoCancelar.classList.remove('oculto');
    campoNome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirAluno(id) {
  const confirmou = window.confirm('Deseja excluir este aluno?');

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: 'DELETE' });
    limparFormulario();
    mostrarMensagem('Aluno excluído');
    await listarAlunos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = '';
  tituloFormulario.textContent = 'Novo Aluno';
  botaoSalvar.textContent = 'Cadastrar';
  botaoCancelar.classList.add('oculto');
}

formulario.addEventListener('submit', salvarAluno);
botaoCancelar.addEventListener('click', limparFormulario);
document
  .querySelector('#botao-atualizar')
  .addEventListener('click', listarAlunos);
document.querySelector('#botao-limpar-busca').addEventListener('click', () => {
  campoBuscaId.value = '';
  listarAlunos();
});

formularioBusca.addEventListener('submit', async evento => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem('Informe um ID para realizar a busca', true);
    return;
  }

  try {
    await buscarAlunoPorId(id);
  } catch (erro) {
    listaAlunos.innerHTML = '';
    mostrarMensagem(erro.message, true);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

listarAlunos();
