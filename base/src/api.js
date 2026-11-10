// Adaptador do front: DEMO primeiro. Não cria servidor nem banco.
// Na API real confira /api-docs: cada aluno pode retornar JSON diferente.
import axios from 'axios';
export const MODO = 'api'; // só troque após a aprovação do professor
const http = axios.create({
 baseURL: 'http://localhost:3000',
 timeout: 8000
});
export const perfis = {
  tecnico123: {nome: 'Carlos', tipo: 'tecnico'},
  admin123: {nome: 'Administrador', tipo: 'admin'},
};
const iniciais = [
 {id:1,titulo:'Computador não liga',descricao:'Máquina 12 sem vídeo',setor:'Laboratório',prioridade:'alta',status:'aberto',responsavel:'',data_abertura:'2026-11-02T13:45:00-03:00'},
 {id:2,titulo:'Internet lenta',descricao:'Wi-Fi lento na sala',setor:'Biblioteca',prioridade:'media',status:'aberto',responsavel:'',data_abertura:'2026-11-03T09:10:00-03:00'},
 {id:3,titulo:'Impressora sem toner',descricao:'Impressão falhada',setor:'Secretaria',prioridade:'baixa',status:'em_atendimento',responsavel:'Carlos',data_abertura:'2026-11-04T15:20:00-03:00'},
];
let dados = iniciais.map(x=>({...x}));
let proximo = 4;
const cabecalho = token => ({headers:{Authorization: token}});
export const servico = {
 async listar(){
  if(MODO === 'api') {
   const res = await http.get('/chamados');
// Somente se a resposta REAL for {chamados:[...]}:
const itens = res.data.chamados;
if(!Array.isArray(itens)) throw new Error('Esperava uma lista em chamados');
return itens;
  }
  return dados.map(x=>({...x}));
 },
 async cadastrar(form){
  if(MODO === 'api') return http.post('/chamados',form);
  dados.push({...form,id:proximo++,status:'aberto',responsavel:'',data_abertura:new Date().toISOString()});
 },
 async assumir(id,token){
  if(MODO === 'api') return http.patch(`/chamados/${id}/assumir`,{},cabecalho(token));
  const usuario=Object.hasOwn(perfis,token) ? perfis[token] : null, item=dados.find(x=>x.id===id);
  if(!usuario) throw new Error('401: identificação inválida.');
  if(!item || item.status!=='aberto') throw new Error('Só é possível assumir um chamado aberto.');
  item.status='em_atendimento'; item.responsavel=usuario.nome;
 },
 async finalizar(id,token){
  if(MODO === 'api') return http.patch(`/chamados/${id}/finalizar`,{},cabecalho(token));
  if(!Object.hasOwn(perfis,token)) throw new Error('401: identificação inválida.');
  const item=dados.find(x=>x.id===id);
  if(!item || item.status!=='em_atendimento') throw new Error('Só finalize chamados em atendimento.');
  item.status='finalizado';
 },
 async excluir(id,token){
  if(MODO === 'api') return http.delete(`/chamados/${id}`,cabecalho(token));
  if(!Object.hasOwn(perfis,token)) throw new Error('401: identificação inválida.');
  if(perfis[token].tipo!=='admin') throw new Error('403: somente o administrador pode excluir.');
  if(!dados.some(x=>x.id===id)) throw new Error('404: chamado não encontrado.');
  dados=dados.filter(x=>x.id!==id);
 }
};
