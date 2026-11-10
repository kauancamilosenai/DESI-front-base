// Este arquivo monta duas partes: acesso (App) e trabalho (Painel).
import { useEffect, useState } from 'react';
import { servico, perfis, MODO } from './api.js';

// PARTE 1: quem entra e quem sai.
export default function App() {
  // O texto digitado começa vazio.
  const [token, setToken] = useState('');
  // null quer dizer: ninguém entrou ainda.
  const [usuario, setUsuario] = useState(null);
  // A mensagem de erro começa vazia.
  const [erro, setErro] = useState('');

  function entrar(e) {
    // Não deixe o formulário recarregar a página.
    e.preventDefault();
    // Procure o texto na lista de perfis de estudo.
    const perfil = Object.hasOwn(perfis, token.trim())
      ? perfis[token.trim()]
      : null;
    if (!perfil) {
      setErro('Identificação inválida');
      return; // Pare aqui: não pode entrar.
    }
    setErro('');
    // Guarde o perfil e o token para as próximas ações.
    setUsuario({ ...perfil, token: token.trim() });
  }

  // Sem usuário, mostre apenas o acesso.
  if (!usuario)
    return (
      <main className="pagina">
        <form onSubmit={entrar}>
          <h1>Acesso de estudo</h1>
          <p>Simulação: não use senha real.</p>
          <label>
            Identificação
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          {/* A mensagem só aparece quando erro tem texto. */}
          {erro && <p role="alert">{erro}</p>}
          <button>Entrar</button>
        </form>
      </main>
    );

  // Envie o usuário para a parte de trabalho.
  return (
    <Painel
      usuario={usuario}
      sair={() => {
        // Sair apaga o acesso e a mensagem, sem fechar o navegador.
        setUsuario(null);
        setToken('');
        setErro('');
      }}
    />
  );
}

// PARTE 2: lista, busca, cadastro e ações nos chamados.
function Painel({ usuario, sair }) {
  // Qual parte do painel está aberta?
  const [tela, setTela] = useState('lista');
  // A lista começa sem registros e será preenchida pelo serviço.
  const [lista, setLista] = useState([]);
  // Enquanto uma ação roda, ocupado vale true.
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setOcupado(true); // Avise que começou.
    setErro('');
    try {
      const recebidos = await servico.listar();
      setLista(recebidos); // Os dados agora podem aparecer na tela.
    } catch (e) {
      setErro(e.message); // Mostre a falha, não esconda.
    } finally {
      setOcupado(false); // Libere a tela mesmo se der erro.
    }
  }
  // Quando o Painel abrir, busque a lista uma vez.
  useEffect(() => {
    carregar();
  }, []);

  // Guarde o que a pessoa digitar na busca.
  const [busca, setBusca] = useState('');

  // filter escolhe os chamados que contêm o termo.
  const visiveis = lista
    .filter((c) =>
      (c.titulo + ' ' + c.descricao + ' ' + c.setor)
        .toLowerCase()
        .includes(busca.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        // Mostre primeiro a data de abertura mais antiga.
        new Date(b.data_abertura) - new Date(a.data_abertura),
    );

  // Os nomes dos campos são os mesmos do contrato da API.
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    setor: '',
    prioridade: 'baixa',
  });
  
  function formValido() {
    // trim remove os espaços das pontas antes da conferência.
    const faltaTexto =
      !form.titulo.trim() ||
      !form.descricao.trim() ||
      !form.setor.trim();
    if (faltaTexto) {
      setErro('Preencha título, descrição e setor.');
      return false; // Avise que não pode enviar.
    }
    return true; // Todos os campos obrigatórios têm texto.
  }
  
    async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (!formValido()) return; // Não envie campos vazios.
    setOcupado(true);
    try {
      await servico.cadastrar(form); // Espere o envio terminar.
      setForm({
        titulo: '',
        descricao: '',
        setor: '',
        prioridade: 'baixa',
      });
      setBusca(''); // O filtro anterior não deve esconder o cadastro.
      setTela('lista');
      await carregar(); // Busque os dados de novo, sem F5.
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  // null: nenhum chamado está esperando confirmação.
  const [confirmar, setConfirmar] = useState(null);

  async function excluir(c) {
    setConfirmar(null); // Feche a confirmação.
    setOcupado(true);
    setErro('');
    try {
      await servico.excluir(c.id, usuario.token);
      await carregar(); // Atualize a lista depois de remover.
    } catch (e) {
      setErro(
        e.response ? `Erro ${e.response.status}` : e.message,
      );
    } finally {
      setOcupado(false);
    }
  }

  async function mudar(tipo, c) {
    setOcupado(true);
    setErro('');
    try {
      // tipo será assumir ou finalizar.
      await servico[tipo](c.id, usuario.token);
      await carregar(); // Mostre o status que veio do serviço.
    } catch (e) {
      setErro(
        e.response ? `Erro ${e.response.status}` : e.message,
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="pagina">
      <h1>Minha Central de Chamados</h1>
      <p>Modo: {MODO}</p>

      {/* O nome vem do usuário que entrou, não de texto fixo. */}
      <p>
        Boas-vindas, {usuario?.nome}
        <button onClick={sair}>Sair</button>
      </p>

      {/* Estes botões mudam apenas a tela aberta. */}
      <nav>
        <button onClick={() => setTela('lista')}>Chamados</button>
        <button onClick={() => setTela('novo')}>
          Novo chamado
        </button>
      </nav>
      <p>Tela: {tela}</p>
      
      {/* Sem texto de erro, nada aparece aqui. */}
      {erro && <p role="alert">{erro}</p>}

      {tela === 'novo' && (
        <form onSubmit={salvar}>
          <h2>Abrir chamado</h2>
          {/* Crie um campo para cada nome desta lista. */}
          {['titulo', 'descricao', 'setor'].map((c) => (
            <label key={c}>
              {c}
              <input
                value={form[c]}
                onChange={(e) =>
                  setForm({
                    ...form, // Preserve os outros campos.
                    [c]: e.target.value, // Troque apenas este campo.
                  })
                }
              />
            </label>
          ))}
          <label>
            Prioridade
            <select
              value={form.prioridade}
              onChange={(e) =>
                setForm({ ...form, prioridade: e.target.value })
              }
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </label>
          <button disabled={ocupado}>Cadastrar</button>
        </form>
      )}

      {tela === 'lista' && (
        <label>
          Buscar
          {/* value mostra o estado; onChange altera o estado. */}
          <input
            value={busca}
            placeholder="Ex.: lento"
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
      )}


      {tela === 'lista' && (
        <section>
          {/* Nenhum resultado não é a mesma coisa que uma falha. */}
          {!ocupado && !erro && visiveis.length === 0 && (
            <p>Nenhum chamado encontrado.</p>
          )}
          {ocupado ? (
            <p role="status">Carregando...</p>
          ) : (
            <ul>
              {visiveis.map((c) => (
                <li className="cartao" key={c.id}>
                  {/* c é um chamado. key usa o ID desse chamado. */}
                  <h2>
                    #{c.id} {c.titulo}
                  </h2>
                  <p>
                    {c.descricao} · Setor: {c.setor} · {c.prioridade}
                  </p>
                  <p>
                    {c.status} ·{' '}
                    {c.responsavel || 'não atribuído'}
                  </p>
                  <p>
                    {new Date(c.data_abertura).toLocaleString(
                      'pt-BR',
                    )}
                  </p>
                  {/* Primeiro clique: só abre a confirmação deste ID. */}
                  <button onClick={() => setConfirmar(c.id)}>
                    Excluir
                  </button>
                  {confirmar === c.id && (
                    <span>
                      <button
                        disabled={ocupado}
                        onClick={() => excluir(c)}
                      >
                        Confirmar exclusão
                      </button>
                      {/* Cancelar não chama o serviço de exclusão. */}
                      <button onClick={() => setConfirmar(null)}>
                        Manter chamado
                      </button>
                    </span>
                  )}
                  {/* Um chamado aberto pode ser assumido. */}
                  {c.status === 'aberto' && (
                    <button
                      disabled={ocupado}
                      onClick={() => mudar('assumir', c)}
                    >
                      Iniciar atendimento
                    </button>
                  )}
                  {/* Só finalize depois de estar em atendimento. */}
                  {c.status === 'em_atendimento' && (
                    <button
                      disabled={ocupado}
                      onClick={() => mudar('finalizar', c)}
                    >
                      Finalizar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
