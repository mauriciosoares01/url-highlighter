# Política de Privacidade — URL Highlighter

**Última atualização:** 09 de setembro de 2026

Esta política descreve como a extensão **URL Highlighter** ("a extensão") trata dados ao ser instalada no seu navegador.

## Resumo

A extensão **não coleta, não transmite e não vende dados do usuário**. Toda a configuração criada pelo usuário (regras de destaque) é armazenada exclusivamente no próprio navegador, localmente, e nunca sai dele.

## Dados armazenados

A extensão salva localmente, via `chrome.storage.local`, apenas a configuração que o próprio usuário cria dentro da extensão:

- Regras de destaque (nome, padrão de URL/glob, tipo de destaque, cor, mensagem e ícone).
- Estado global de ativação (ligado/desligado).

Esses dados:

- Ficam **somente no dispositivo do usuário**, dentro do armazenamento local do navegador.
- **Não são enviados** a nenhum servidor da extensão, do desenvolvedor ou de terceiros — a extensão não possui backend e não faz nenhuma chamada de rede para transmitir esses dados.
- Podem ser exportados/importados manualmente pelo próprio usuário (arquivo `.json`), por sua própria iniciativa, para uso pessoal (ex.: backup ou compartilhamento voluntário com colegas).
- São apagados quando o usuário desinstala a extensão ou limpa os dados do navegador.

## Dados que a extensão NÃO coleta

- Não coleta histórico de navegação.
- Não coleta conteúdo de páginas visitadas.
- Não coleta dados pessoais, credenciais ou informações de formulários.
- Não usa analytics, telemetria ou rastreamento de uso.
- Não compartilha, vende ou transfere dados a terceiros — porque nenhum dado do usuário sai do navegador.

## Permissões utilizadas

| Permissão | Para que é usada |
|---|---|
| `storage` | Persistir localmente as regras de destaque configuradas pelo usuário. |
| `activeTab` | Ler a URL da aba ativa apenas no momento em que o usuário abre o popup, para pré-preencher o padrão de URL no atalho "Criar regra para esta URL". |
| Permissão de host (`<all_urls>`) | Executar o script de conteúdo que aplica o destaque visual, já que o usuário pode configurar regras para qualquer domínio (ex.: ambientes de staging, produção, painéis administrativos). |

Nenhuma dessas permissões é usada para coletar ou transmitir dados — apenas para ler a URL da página atual e aplicar o destaque configurado pelo próprio usuário.

## Recursos de terceiros

As páginas de popup e de opções carregam fontes web via `@import` do Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`). Esse carregamento faz uma requisição de rede ao servidor do Google para obter o arquivo de fonte, sujeita à [Política de Privacidade do Google](https://policies.google.com/privacy). Nenhum dado de configuração da extensão é enviado nessa requisição — apenas os metadados padrão de uma requisição HTTP (ex.: endereço IP, user-agent), da mesma forma que ocorreria ao carregar a fonte em qualquer site.

## Código remoto

A extensão não executa código remoto. Todo o JavaScript é escrito em TypeScript, compilado localmente e empacotado dentro da própria extensão — não há download nem execução de scripts hospedados fora do pacote.

## Alterações nesta política

Caso esta política seja alterada, a data no topo deste documento será atualizada. Alterações relevantes (ex.: introdução de coleta de dados ou de novas permissões) serão refletidas aqui antes de entrarem em vigor.

## Contato

Dúvidas sobre esta política: mss.soares02@gmail.com.
