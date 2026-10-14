/* ============================================================
   Arthur — Site Pessoal | js/scripts.js   (CP3)

   Um único script, carregado em TODAS as páginas. Cada recurso
   verifica se os elementos da página existem antes de agir.

   Dados persistidos em localStorage (prefixo "arthur:"):
     arthur:tema      -> "claro" | "escuro"
     arthur:nome      -> nome do visitante (boas-vindas)
     arthur:rascunho  -> rascunho do formulário de contato
   ============================================================ */
(function () {
  'use strict';

  const PREFIXO = 'arthur:';

  /* localStorage guarda texto; aqui tudo vira JSON. O try/catch evita
     que o site quebre em modo privado ou com o armazenamento bloqueado. */
  const armazenamento = {
    ler(chave, padrao) {
      try {
        const bruto = window.localStorage.getItem(PREFIXO + chave);
        return bruto === null ? padrao : JSON.parse(bruto);
      } catch (erro) {
        return padrao;
      }
    },
    gravar(chave, valor) {
      try {
        window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
        return true;
      } catch (erro) {
        return false;
      }
    },
    remover(chave) {
      try {
        window.localStorage.removeItem(PREFIXO + chave);
      } catch (erro) { /* sem armazenamento: nada a remover */ }
    }
  };

  function quandoPronto(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ---------- Canvas: rede de nós (graficos.html) ---------- */

  function iniciarCanvas() {
    const canvas = document.getElementById('rede');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const QTD_NOS = 26;
    const DIST_MAX = 130;
    let nos = [];

    /* As cores vêm das variáveis do CSS, então acompanham o tema. */
    function lerPaleta() {
      const css = getComputedStyle(document.documentElement);
      return {
        linha: css.getPropertyValue('--accent-2').trim(),
        no: css.getPropertyValue('--accent').trim()
      };
    }
    let paleta = lerPaleta();

    function redimensionar() {
      const caixa = canvas.getBoundingClientRect();
      canvas.width = caixa.width * devicePixelRatio;
      canvas.height = caixa.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function criarNos() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      nos = Array.from({ length: QTD_NOS }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      }));
    }

    function desenhar() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = paleta.linha;
      ctx.lineWidth = 1;
      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const a = nos[i];
          const b = nos[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < DIST_MAX) {
            ctx.globalAlpha = 1 - dist / DIST_MAX;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = paleta.no;
      for (const n of nos) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function mover() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (const n of nos) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
    }

    function quadro() {
      mover();
      desenhar();
      requestAnimationFrame(quadro);
    }

    window.addEventListener('resize', () => {
      redimensionar();
      criarNos();
      if (reduzirMovimento) desenhar();
    });

    document.addEventListener('tema:alterado', () => {
      paleta = lerPaleta();
      if (reduzirMovimento) desenhar();
    });

    redimensionar();
    criarNos();
    if (reduzirMovimento) desenhar(); else quadro();
  }

  quandoPronto(iniciarCanvas);

  /* ---------- Tema claro/escuro (todas as páginas) ---------- */

  const TEMAS = ['escuro', 'claro'];

  function temaSalvo() {
    const tema = armazenamento.ler('tema', 'escuro');
    return TEMAS.includes(tema) ? tema : 'escuro';
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    document.dispatchEvent(new CustomEvent('tema:alterado', { detail: tema }));
  }

  /* Aplica o tema salvo já no <head>, antes de o <body> ser desenhado,
     para a página não "piscar" no tema errado ao navegar entre páginas. */
  aplicarTema(temaSalvo());

  function iniciarTema() {
    const botao = document.getElementById('tema-botao');
    if (!botao) return;

    function atualizarRotulo() {
      const claro = document.documentElement.getAttribute('data-theme') === 'claro';
      botao.textContent = claro ? '☾ Usar tema escuro' : '☀ Usar tema claro';
    }

    botao.addEventListener('click', () => {
      const novo = document.documentElement.getAttribute('data-theme') === 'claro' ? 'escuro' : 'claro';
      armazenamento.gravar('tema', novo);
      aplicarTema(novo);
      atualizarRotulo();
    });

    /* Se o tema mudar em outra aba aberta do site, esta aba acompanha. */
    window.addEventListener('storage', (evento) => {
      if (evento.key === PREFIXO + 'tema') {
        aplicarTema(temaSalvo());
        atualizarRotulo();
      }
    });

    atualizarRotulo();
  }

  quandoPronto(iniciarTema);

  /* ---------- Boas-vindas com o nome do visitante (todas as páginas) ---------- */

  function iniciarSaudacao() {
    const area = document.getElementById('saudacao');
    if (!area) return;

    function criar(tag, classe, texto) {
      const el = document.createElement(tag);
      if (classe) el.className = classe;
      if (texto) el.textContent = texto;   // textContent: nunca interpreta HTML
      return el;
    }

    function mostrarNome(nome) {
      area.replaceChildren();
      area.appendChild(criar('p', 'saudacao-texto', 'Olá, ' + nome + '!'));

      const trocar = criar('button', 'botao-link', 'trocar nome');
      trocar.type = 'button';
      trocar.addEventListener('click', () => mostrarFormulario(nome));
      area.appendChild(trocar);
    }

    function mostrarFormulario(nomeAtual) {
      area.replaceChildren();

      const form = criar('form', 'saudacao-form');
      form.noValidate = true;

      const rotulo = criar('label', null, 'Como posso te chamar?');
      rotulo.htmlFor = 'saudacao-nome';

      const campo = criar('input');
      campo.type = 'text';
      campo.id = 'saudacao-nome';
      campo.maxLength = 40;
      campo.autocomplete = 'given-name';
      campo.value = nomeAtual || '';

      const erro = criar('span', 'erro');
      erro.setAttribute('role', 'alert');

      const salvar = criar('button', null, 'Salvar');
      salvar.type = 'submit';

      form.append(rotulo, campo, salvar, erro);

      form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const nome = campo.value.trim().replace(/\s+/g, ' ');
        if (nome.length < 2) {
          erro.textContent = 'Digite pelo menos 2 letras.';
          campo.setAttribute('aria-invalid', 'true');
          campo.focus();
          return;
        }
        armazenamento.gravar('nome', nome);
        mostrarNome(nome);
        document.dispatchEvent(new CustomEvent('nome:alterado', { detail: nome }));
      });

      if (nomeAtual) {
        const cancelar = criar('button', 'botao-link', 'cancelar');
        cancelar.type = 'button';
        cancelar.addEventListener('click', () => mostrarNome(nomeAtual));
        form.appendChild(cancelar);
      }

      area.appendChild(form);
      campo.focus();
    }

    const nome = armazenamento.ler('nome', '');
    if (nome) {
      mostrarNome(nome);
    } else {
      /* Primeira visita: pergunta o nome sem roubar o foco da página. */
      mostrarFormulario('');
      document.activeElement.blur();
    }
  }

  quandoPronto(iniciarSaudacao);

  /* ---------- Formulário de contato: validação com feedback na tela ---------- */

  function iniciarFormulario() {
    const form = document.getElementById('form-contato');
    if (!form) return;

    const status = document.getElementById('form-status');

    /* Cada regra recebe o campo e devolve '' (válido) ou a mensagem de erro. */
    const regras = {
      nome: (c) => c.value.trim().length >= 3 ? '' : 'Informe seu nome completo (mínimo 3 caracteres).',
      email: (c) => {
        const v = c.value.trim();
        if (!v) return 'Informe seu e-mail.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Digite um e-mail válido, como voce@exemplo.com.';
      },
      telefone: (c) => {
        const v = c.value.trim();
        return !v || /^[0-9()\-\s]{8,15}$/.test(v) ? '' : 'Use de 8 a 15 caracteres: números, espaços, parênteses ou hífen.';
      },
      assunto: (c) => c.value.trim().length >= 3 ? '' : 'Informe o assunto (mínimo 3 caracteres).',
      tipo: (c) => c.value ? '' : 'Selecione o tipo de contato.',
      mensagem: (c) => c.value.trim().length >= 10 ? '' : 'A mensagem precisa ter pelo menos 10 caracteres.',
      consentimento: (c) => c.checked ? '' : 'Marque a caixa para autorizar o contato.'
    };

    const campos = Object.keys(regras).map((id) => document.getElementById(id));

    function validarCampo(campo) {
      const mensagem = regras[campo.id](campo);
      const lugar = document.getElementById('erro-' + campo.id);
      if (lugar) lugar.textContent = mensagem;
      campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
      return mensagem === '';
    }

    function mostrarStatus(tipo, texto) {
      status.className = 'form-status ' + tipo;
      status.textContent = texto;
      status.hidden = false;
    }

    function preencherNome() {
      const campoNome = document.getElementById('nome');
      const salvo = armazenamento.ler('nome', '');
      if (salvo && !campoNome.value) campoNome.value = salvo;
    }

    /* Feedback imediato: valida ao sair do campo e, depois do primeiro
       erro, revalida a cada tecla para o aviso sumir assim que corrigir. */
    for (const campo of campos) {
      campo.addEventListener('blur', () => {
        if (campo.type !== 'checkbox') validarCampo(campo);
      });
      const evento = campo.type === 'checkbox' || campo.tagName === 'SELECT' ? 'change' : 'input';
      campo.addEventListener(evento, () => {
        if (campo.getAttribute('aria-invalid') === 'true') validarCampo(campo);
      });
    }

    form.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const invalidos = campos.filter((campo) => !validarCampo(campo));

      if (invalidos.length > 0) {
        const n = invalidos.length;
        mostrarStatus('erro-geral', n === 1
          ? 'Há 1 campo para corrigir antes de enviar.'
          : 'Há ' + n + ' campos para corrigir antes de enviar.');
        invalidos[0].focus();
        return;
      }

      const nome = document.getElementById('nome').value.trim().split(' ')[0];
      mostrarStatus('sucesso', 'Mensagem registrada, ' + nome + '! Este formulário é uma demonstração acadêmica: nenhum dado saiu do seu navegador.');
      form.reset();
      for (const campo of campos) campo.setAttribute('aria-invalid', 'false');
      preencherNome();
      document.dispatchEvent(new CustomEvent('contato:enviado'));
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    document.addEventListener('nome:alterado', preencherNome);
    preencherNome();
  }

  quandoPronto(iniciarFormulario);

  /* ---------- Rascunho do formulário de contato (localStorage) ---------- */

  function iniciarRascunho() {
    const form = document.getElementById('form-contato');
    const aviso = document.getElementById('rascunho-aviso');
    if (!form || !aviso) return;

    /* O consentimento nunca é lembrado: precisa ser dado de novo a cada envio. */
    function camposSalvos() {
      return Array.from(form.elements).filter(
        (el) => el.name && el.name !== 'consentimento' && el.type !== 'submit' && el.type !== 'button'
      );
    }

    function coletar() {
      const dados = {};
      for (const el of camposSalvos()) {
        if (el.type === 'radio') {
          if (el.checked) dados[el.name] = el.value;
        } else {
          dados[el.name] = el.value;
        }
      }
      return dados;
    }

    /* O nome salvo na saudação pré-preenche o campo "nome"; isso não conta
       como rascunho, senão o aviso apareceria sem o visitante ter digitado nada. */
    function temTextoDigitado(dados) {
      const nomeSaudacao = armazenamento.ler('nome', '');
      return ['nome', 'email', 'telefone', 'assunto', 'mensagem'].some((k) => {
        const valor = (dados[k] || '').trim();
        if (k === 'nome' && valor === nomeSaudacao) return false;
        return valor !== '';
      });
    }

    let temporizador = null;
    function salvarRascunho() {
      const dados = coletar();
      if (temTextoDigitado(dados)) {
        armazenamento.gravar('rascunho', dados);
      } else {
        armazenamento.remover('rascunho');
      }
    }

    function agendarSalvamento() {
      clearTimeout(temporizador);
      temporizador = setTimeout(salvarRascunho, 300);
    }

    function restaurar() {
      const dados = armazenamento.ler('rascunho', null);
      if (!dados || !temTextoDigitado(dados)) return;

      for (const el of camposSalvos()) {
        const valor = dados[el.name];
        if (valor === undefined || valor === '') continue;
        if (el.type === 'radio') {
          el.checked = el.value === valor;
        } else {
          el.value = valor;
        }
      }
      aviso.hidden = false;
    }

    function descartar() {
      clearTimeout(temporizador);
      armazenamento.remover('rascunho');
      form.reset();
      aviso.hidden = true;
      document.dispatchEvent(new CustomEvent('nome:alterado'));
    }

    document.getElementById('rascunho-descartar').addEventListener('click', descartar);
    form.addEventListener('input', agendarSalvamento);
    form.addEventListener('change', agendarSalvamento);
    /* Garante o salvamento mesmo se a aba fechar antes dos 300 ms. */
    window.addEventListener('pagehide', salvarRascunho);

    /* Enviou com sucesso: o rascunho já cumpriu o papel. */
    document.addEventListener('contato:enviado', () => {
      clearTimeout(temporizador);
      armazenamento.remover('rascunho');
      aviso.hidden = true;
    });

    restaurar();
  }

  quandoPronto(iniciarRascunho);

})();
