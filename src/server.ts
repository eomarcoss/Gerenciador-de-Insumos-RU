import { criarApp } from './app.js';
import { conectarDados } from './database.js';

async function iniciarServidor() {
  const porta = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('PORT deve ser um número de 1 a 65535.');
  }

  const dados = await conectarDados();
  const app = criarApp(dados.repositorios, dados.modoMemoria);

  const servidor = app.listen(porta, '127.0.0.1', () => {
    console.log('Gerenciador RU disponível em http://localhost:' + porta);

    if (dados.modoMemoria) {
      console.log('Modo memória: os dados duram até reiniciar o servidor.');
    } else {
      console.log('Conectado ao MySQL.');
    }
  });

  servidor.on('error', async (erro) => {
    console.error('Não foi possível iniciar o servidor:', erro.message);
    await dados.fechar();
    process.exitCode = 1;
  });

  function encerrarServidor() {
    servidor.close(async () => {
      await dados.fechar();
      process.exit(0);
    });
  }

  process.once('SIGINT', encerrarServidor);
  process.once('SIGTERM', encerrarServidor);
}

iniciarServidor().catch((erro: unknown) => {
  if (erro instanceof Error) {
    console.error('Falha ao iniciar:', erro.message);
  } else {
    console.error('Falha ao iniciar:', erro);
  }

  process.exitCode = 1;
});
