# URL Highlighter

![URL Highlighter](assets/banner.png)

Extensão de navegador (Chrome + Firefox, Manifest V3) que destaca visualmente uma página com base em regras configuráveis de match contra a URL — útil para distinguir staging de produção, sinalizar painéis administrativos ou qualquer ambiente sensível, sem depender de o usuário conferir a URL manualmente.

> Documentação técnica (arquitetura, modelo de dados, build): [ARCHITECTURE.md](ARCHITECTURE.md). Política de privacidade: [PRIVACY.md](PRIVACY.md).

## Instalação

### Chrome

1. Baixe `url-highlighter-chrome-1.0.0.zip` e extraia numa pasta.
2. Acesse `chrome://extensions`, ative o "Modo do desenvolvedor" (canto superior direito).
3. Clique em "Carregar sem compactação" e selecione a pasta extraída.

### Firefox

1. Baixe `url-highlighter-firefox-1.0.0.zip` e extraia numa pasta.
2. Acesse `about:debugging#/runtime/this-firefox`.
3. Clique em "Carregar extensão temporária" e selecione o `manifest.json` dentro da pasta extraída.

> Instalação temporária: a extensão some do Firefox ao fechar o navegador e precisa ser recarregada. Para instalação permanente sem passar pela AMO (Mozilla), é necessário assinar o pacote — fora do escopo desta primeira versão (ver "Distribuição" abaixo).

## Cadastrando a primeira regra

1. Clique com o botão direito no ícone da extensão na barra de ferramentas → "Opções" (ou pelo popup → "Abrir configurações completas").
2. Preencha o formulário: nome da regra, padrão de URL (glob, ex. `*://staging.*.example.com/*`), tipo de destaque (barra/borda/widget/modal), cor, mensagem e ícone.
3. Clique em "Salvar". A regra passa a valer imediatamente nas abas que casarem com o padrão.
4. Atalho rápido: no popup da extensão, clique em "Criar regra para esta URL" para pré-preencher o padrão com o hostname da aba atual.

Quando duas regras habilitadas casam com a mesma URL, vence a de menor prioridade (ajustável na listagem de Opções pelas setas ↑/↓).

## Export/Import de configuração

A extensão não sincroniza regras automaticamente entre pessoas ou navegadores — o compartilhamento é manual, por arquivo:

1. Na página de Opções, clique em "Exportar" para baixar `url-highlighter-config.json` com todas as regras atuais.
2. Envie esse arquivo para quem for reaproveitar a configuração (Teams, repositório interno, etc.).
3. A pessoa clica em "Importar" na própria página de Opções e seleciona o arquivo recebido — a extensão pede confirmação antes de sobrescrever as regras existentes.

## Distribuição

Decisão adotada para esta primeira versão: **distribuição interna via arquivo compartilhado** (`.zip` do Chrome / `.zip` ou `.xpi` do Firefox), não publicação nas lojas oficiais (Chrome Web Store / AMO). Publicação em loja fica em aberto como decisão administrativa futura, caso o uso extrapole o time.

## Licença

[MIT](LICENSE).

