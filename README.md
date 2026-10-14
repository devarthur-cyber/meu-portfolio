# CP3 — Site Pessoal (Git, deploy e JavaScript)

**Autor:** Arthur Gomes de Jesus
**Turma:** ADS
**Disciplina:** Desenvolvimento Front-end para Web — Centro Universitário Braz Cubas
**Entrega:** 10/11/2026

- **Repositório:** https://github.com/devarthur-cyber/meu-portfolio (tag `cp3-entrega`)
- **Site publicado:** https://devarthur-cyber.github.io/meu-portfolio/

## Sobre o projeto

Site pessoal / portfólio com 5 páginas interligadas, evoluído do CP2.
Neste checkpoint o projeto passa a ser versionado no GitHub, publicado com
HTTPS e ganha interatividade em JavaScript com persistência em `localStorage`.

## Páginas

| Arquivo           | Conteúdo                                                         |
|-------------------|------------------------------------------------------------------|
| `index.html`      | Apresentação e resumo de interesses                              |
| `curriculo.html`  | Formação, projetos e habilidades técnicas                        |
| `formulario.html` | Formulário de contato com validação e rascunho salvo             |
| `multimidia.html` | `<video>`, `<audio>` e um `<iframe>` do YouTube                  |
| `graficos.html`   | `<canvas>` animado e `<svg>` estilizado com CSS                  |

## Features em JavaScript (`js/scripts.js`)

O mesmo script é carregado em todas as páginas e só age onde os elementos existem.

### 1. Tema claro/escuro — todas as páginas
- **O que faz:** o botão no menu lateral alterna a paleta (via `data-theme` no `<html>` e variáveis CSS). O canvas também muda de cor.
- **Persistido:** `arthur:tema` (`"claro"` ou `"escuro"`).
- **Como testar:** clique em "Usar tema claro", recarregue e navegue para outra página: o tema continua.

### 2. Boas-vindas com o nome — todas as páginas
- **O que faz:** na primeira visita pergunta "Como posso te chamar?"; nas próximas mostra "Olá, [nome]!" com a opção "trocar nome". O nome também pré-preenche o formulário de contato.
- **Persistido:** `arthur:nome`.
- **Como testar:** informe um nome, recarregue a página.

### 3. Formulário com validação e rascunho — `formulario.html`
- **Validação:** feita em JavaScript (`novalidate` no HTML). Cada campo mostra sua mensagem de erro logo abaixo, há um resumo na tela ("Há N campos para corrigir") e o foco vai para o primeiro campo inválido. No sucesso aparece uma mensagem de confirmação na tela (sem `alert`).
- **Rascunho:** o que foi digitado é salvo enquanto o visitante escreve e restaurado ao reabrir a página, com a opção "descartar rascunho". O campo de consentimento **não** é salvo. O rascunho é apagado após o envio.
- **Persistido:** `arthur:rascunho` (nome, e-mail, telefone, assunto, tipo, data, retorno e mensagem).
- **Como testar:** preencha parte do formulário, recarregue (ou feche e abra a aba) e confira os dados.
- **Observação:** é uma demonstração acadêmica; nenhum dado é enviado a servidor.

**Para conferir tudo no navegador:** DevTools → Application → Local Storage → o endereço do site.

## Estrutura de pastas

```
meu-portfolio/
├── index.html
├── curriculo.html
├── formulario.html
├── multimidia.html
├── graficos.html
├── css/
│   └── estilos.css
├── js/
│   └── scripts.js
├── img/
│   ├── avatar.svg
│   └── foto-arthur.jpg
├── .gitignore
└── README.md
```

## Fluxo Git usado

- Branch `main` com commits de mensagem descritiva.
- Tag `cp3-entrega` marcando o estado da entrega.

## Tecnologias

HTML5 semântico, CSS3 (mobile-first, Flexbox, Grid, variáveis CSS) e JavaScript vanilla (`localStorage`, eventos, DOM).

## Paleta e tipografia

- Tema escuro: `#0d1117` (fundo), `#151b23` (painéis), `#e3b341` (âmbar), `#5fd1c9` (ciano), `#e6e8eb` (texto)
- Tema claro: `#f6f8fa` (fundo), `#ffffff` (painéis), `#9a6700` (âmbar), `#0a6b66` (ciano), `#1f2328` (texto)
- Fontes: IBM Plex Sans (texto) e IBM Plex Mono (rótulos e menu)
