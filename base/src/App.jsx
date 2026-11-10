// Este arquivo monta duas partes: acesso (App) e trabalho (Painel).
import { useEffect, useState } from 'react';
import { servico, perfis, MODO } from './api.js';

// PARTE 1: quem entra e quem sai.
export default function App() {
  // @APP_ESTADOS
  // @APP_ENTRAR
  // @APP_ACESSO
  return <Painel usuario={null} sair={() => {}} />; // @APP_RETORNO
}

// PARTE 2: lista, busca, cadastro e ações nos chamados.
function Painel({ usuario, sair }) {
  // @PAINEL_ESTADOS
  // @CARREGAR
  // @BUSCA_ESTADO
  // @BUSCA_CALCULO
  // @FORM_ESTADO
  // @VALIDAR_FORM
  // @SALVAR
  // @EXCLUIR_ESTADO
  // @EXCLUIR
  // @MUDAR
  return (
    <main className="pagina">
      <h1>Minha Central de Chamados</h1>
      <p>Modo: {MODO}</p>
      {/* @USUARIO */}
      {/* @NAVEGACAO */}
      {/* @ERRO */}
      {/* @FORMULARIO */}
      {/* @BUSCA_CAMPO */}
      {/* @LISTA */}
    </main>
  );
}
