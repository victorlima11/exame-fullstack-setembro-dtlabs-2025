import { UsuarioRepository } from '../repositories/usuarioRepository';
import { NovoUsuario } from '../types/usuarioTypes';
import { db } from '../config/db';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testeManualInsercaoUsuario() {
  const usuario: NovoUsuario = {
    nome: 'Usuário Simples',
    email: 'teste_simples@example.com',
    senha: 'senha123'
  };

  try {
    console.log('Criando usuário...');
    const criado = await UsuarioRepository.createUser(usuario);

    if (!criado) throw new Error('Usuário não foi criado');

    if (criado.email !== usuario.email) throw new Error('Email diferente do esperado');
    if (criado.nome !== usuario.nome) throw new Error('Nome diferente do esperado');
    if (criado.senha !== usuario.senha) throw new Error('Senha diferente do esperado');
    if (!criado.id) throw new Error('ID não foi retornado');

    console.log('✅ Teste passou com sucesso.');
    console.log('Usuário criado:', criado);
  } catch (erro) {
    console.error('❌ Teste falhou:', erro);
  } finally {
    console.log('Aguardando 30 segundos antes de limpar o usuário de teste...');
    await delay(30000);
    console.log('Limpando usuário de teste...');
    await db.query('DELETE FROM usuarios WHERE email = $1', ['teste_simples@example.com']);
    await db.end();
  }
}

testeManualInsercaoUsuario();
console.log('Teste manual de inserção de usuário concluído.');