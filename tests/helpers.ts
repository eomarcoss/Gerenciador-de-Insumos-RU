import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { criarApp } from '../src/app.js';
import { criarRepositoriosEmMemoria } from '../src/repositories.js';
import type { Repositorios } from '../src/repositories.js';

export async function comServidor(
  executarTeste: (url: string, repositorios: Repositorios) => Promise<void>,
) {
  const repositorios = criarRepositoriosEmMemoria();
  const servidor = criarApp(repositorios).listen(0, '127.0.0.1');
  await once(servidor, 'listening');

  const endereco = servidor.address() as AddressInfo;
  const url = 'http://127.0.0.1:' + endereco.port;

  try {
    await executarTeste(url, repositorios);
  } finally {
    servidor.closeAllConnections();
    await new Promise<void>((concluir, rejeitar) => {
      servidor.close((erro) => {
        if (erro) {
          rejeitar(erro);
        } else {
          concluir();
        }
      });
    });
  }
}

export function enviarFormulario(url: string, campos: Record<string, string>) {
  return fetch(url, {
    method: 'POST',
    body: new URLSearchParams(campos),
    redirect: 'manual',
  });
}
