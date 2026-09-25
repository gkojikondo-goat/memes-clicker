// Conteúdo do jogo: dados puros, sem lógica de DOM ou de estado.
// Pra adicionar uma era nova: acrescente um objeto em ERAS.
// Pra evoluir de emoji pra imagem: adicione `image: "eras/nome.png"` no
// objeto da era/gerador (ver src/assets.js).

export const GROWTH = 1.13;

export const ERAS = [
  {
    id: "zap",
    name: "Grupo de Zap da Família",
    emoji: "👨‍👩‍👧‍👦",
    tagline: "todo dia é dia de bom dia",
    unlockAt: 0,
    generators: [
      { id: "tio",   name: "Tio do Bom Dia",           emoji: "☀️", baseCost: 10,  baseCps: 0.1, flavor: "manda a mesma imagem desde 2016" },
      { id: "prima", name: "Prima da Corrente do Bem",  emoji: "🙏", baseCost: 60,  baseCps: 0.5, flavor: "encaminhe pra 10 pessoas ou dê azar" },
      { id: "audio", name: "Áudio de 8 Minutos",        emoji: "🎤", baseCost: 300, baseCps: 2.5, flavor: "começa contando outra coisa" }
    ]
  },
  {
    id: "escola",
    name: "Fórum de Fofoca da Escola",
    emoji: "🏫",
    tagline: "ninguém sabe quem administra a página",
    unlockAt: 1000,
    generators: [
      { id: "fake",   name: "Conta Fake do Recreio",     emoji: "🕵️", baseCost: 1000,  baseCps: 8,   flavor: "confirmadíssimo, fonte segura" },
      { id: "sala",   name: "Grupo da Sala Lotado",       emoji: "🎒", baseCost: 6000,  baseCps: 45,  flavor: "247 mensagens sobre a prova de amanhã" },
      { id: "radio",  name: "Rádio Corredor",             emoji: "📢", baseCost: 30000, baseCps: 220, flavor: "virou boato antes do intervalo acabar" }
    ]
  },
  {
    id: "dancinha",
    name: "Dancinha Viral de 15 Segundos",
    emoji: "💃",
    tagline: "o mesmo passo, oitocentas vezes",
    unlockAt: 20000,
    generators: [
      { id: "coreografo", name: "Coreógrafo Amador",         emoji: "🕺", baseCost: 60000,    baseCps: 850,    flavor: "inventou o passo no quintal" },
      { id: "remix",      name: "Trend de Áudio Remixado",   emoji: "🎧", baseCost: 300000,   baseCps: 4200,   flavor: "acelerado 20% pra ficar mais engraçado" },
      { id: "compilado",  name: "Compilado \"Melhores Momentos\"", emoji: "📀", baseCost: 1400000, baseCps: 19000, flavor: "17 minutos, sem nenhum melhor momento" }
    ]
  },
  {
    id: "podcast",
    name: "Podcast de Boteco",
    emoji: "🎙️",
    tagline: "três amigos, um microfone, zero edição",
    unlockAt: 400000,
    generators: [
      { id: "microfone", name: "Microfone Emprestado",         emoji: "🎤", baseCost: 3000000,  baseCps: 85000,   flavor: "chiando desde o episódio 1" },
      { id: "corte",     name: "Corte Picado pro Instagram",    emoji: "✂️", baseCost: 15000000, baseCps: 400000,  flavor: "corta bem na hora da piada" },
      { id: "convidado", name: "Participação Especial Confusa", emoji: "❓", baseCost: 70000000, baseCps: 1800000, flavor: "ninguém sabe por que foi convidado" }
    ]
  },
  {
    id: "reacao",
    name: "Canal de Corte e Reação",
    emoji: "😱",
    tagline: "reage ao vídeo que reage ao vídeo",
    unlockAt: 8000000,
    generators: [
      { id: "editor",    name: "Editor Sempre Nervoso",       emoji: "😤", baseCost: 300000000,   baseCps: 7500000,   flavor: "prazo era ontem" },
      { id: "reacao",    name: "Compilado de Reação",          emoji: "🤯", baseCost: 1500000000,  baseCps: 34000000,  flavor: "cara de espanto em toda thumbnail" },
      { id: "fantasma",  name: "Canal Fantasma que Reposta Tudo", emoji: "👻", baseCost: 7000000000, baseCps: 150000000, flavor: "nunca aparece, sempre viraliza" }
    ]
  },
  {
    id: "algoritmo",
    name: "Algoritmo Supremo",
    emoji: "🤖",
    tagline: "decide o que o Brasil inteiro vai rir hoje",
    unlockAt: 150000000,
    generators: [
      { id: "bots",       name: "Fazenda de Bots",                emoji: "🖥️", baseCost: 30000000000,  baseCps: 650000000,   flavor: "curte tudo, não ri de nada" },
      { id: "trending",   name: "Trending Topics Manipulados",     emoji: "📈", baseCost: 150000000000, baseCps: 3000000000,  flavor: "ninguém pediu, mas tá lá" },
      { id: "recomenda",  name: "Supercomputador de Recomendação", emoji: "🧠", baseCost: 700000000000, baseCps: 14000000000, flavor: "sabe o que você vai clicar antes de você" }
    ]
  }
];

export const CLICK_UPGRADES = [
  { id: "teclado",   name: "Teclado Mecânico Turbo",       emoji: "⌨️", cost: 50,           mult: 2, desc: "x2 por clique" },
  { id: "sticker",   name: "Pack de Figurinha Turbinado",  emoji: "🌟", cost: 600,          mult: 2, desc: "x2 por clique" },
  { id: "fibra",     name: "Internet de Fibra",             emoji: "📶", cost: 5000,         mult: 2, desc: "x2 por clique" },
  { id: "pirata",    name: "Editor de Vídeo Pirateado",     emoji: "🏴", cost: 60000,        mult: 2, desc: "x2 por clique" },
  { id: "estudio",   name: "Estúdio Caseiro",               emoji: "🎬", cost: 900000,       mult: 3, desc: "x3 por clique" },
  { id: "agencia",   name: "Agência de Marketing Digital",  emoji: "💼", cost: 12000000,     mult: 3, desc: "x3 por clique" },
  { id: "growth",    name: "Consultoria de Growth Hacking", emoji: "📊", cost: 200000000,    mult: 3, desc: "x3 por clique" },
  { id: "assessoria",name: "Assessoria de Imprensa Particular", emoji: "🎩", cost: 3000000000, mult: 4, desc: "x4 por clique" }
];

export const SAVE_KEY = "fabrica-de-meme-save-v2";
