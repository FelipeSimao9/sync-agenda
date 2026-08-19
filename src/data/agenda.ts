export type Speaker = {
  name: string;
  role?: string;
  company?: string;
  photo?: string;
  isModerator?: boolean;
};

export type AgendaBlock = {
  id: string;
  type: "plenary" | "track" | "break";
  slot: 1 | 2 | null;
  start: string; // 'HH:mm', America/Sao_Paulo, dia 2026-08-22
  end: string;
  title: string;
  shortTitle?: string;
  subtitle?: string;
  room: string;
  capacity?: number;
  speakers: Speaker[];
  description?: string;
  menu?: { title: string; note?: string; items: string[] }[];
};

export const EVENT_DATE = "2026-08-22";
export const EVENT_TZ = "America/Sao_Paulo";
export const EVENT_START = "08:00";
export const EVENT_END = "18:30";
export const VENUE = "iFood HQ";

export const AGENDA: AgendaBlock[] = [
  {
    id: "credenciamento",
    type: "break",
    slot: null,
    start: "08:00",
    end: "09:00",
    title: "Credenciamento + Welcome Coffee",
    room: "IA House",
    speakers: [],
    menu: [
      {
        title: "Café da manhã",
        items: [
          "Bolo de cenoura com cobertura de chocolate",
          "Mini sanduíche de fricassê de frango",
          "Pão de queijo",
          "Suco natural de laranja",
          "Mini enroladinho de presunto e queijo",
          "Mini carolina com doce de leite",
          "Frutas da estação",
          "Café e leite",
        ],
      },
    ],
  },
  {
    id: "abertura",
    type: "plenary",
    slot: null,
    start: "09:00",
    end: "09:30",
    title: "Abertura + fala do patrocínio âncora (iFood)",
    subtitle: "Por que estamos aqui? Agenda do dia",
    room: "IA House",
    speakers: [
      { name: "Silvia", photo: "/speakers/silvia.jpeg" },
      { name: "Davi Basã", photo: "/speakers/davi-basa.png" },
      { name: "Alice", photo: "/speakers/alice.png" },
    ],
    description:
      "O ponto de partida do dia: o que é o Sync, por que ele existe e o que esperar das próximas horas, com a fala do patrocínio âncora.",
  },
  {
    id: "monashees",
    type: "plenary",
    slot: null,
    start: "09:30",
    end: "09:45",
    title: "Apresentação institucional Monashees",
    room: "IA House",
    speakers: [],
    description:
      "Quinze minutos com um dos principais fundos de venture capital da América Latina: como a Monashees enxerga e apoia fundadores.",
  },
  {
    id: "painel-20",
    type: "plenary",
    slot: null,
    start: "09:45",
    end: "11:00",
    title: "Painel: Empreendendo desde os 20",
    room: "IA House",
    speakers: [
      {
        name: "Pedro Dias",
        role: "CEO & Founder",
        company: "Mevo",
        photo: "/speakers/pedro-dias.png",
      },
      {
        name: "Fábio Rodas",
        role: "CEO & Co-Founder",
        company: "Shopper",
        photo: "/speakers/fabio-rodas.png",
      },
      {
        name: "Lucas Montez",
        role: "Senior Director",
        company: "iFood",
        photo: "/speakers/lucas-montez.png",
      },
      {
        name: "Jackellyne Santana",
        role: "Head de M&A",
        company: "iFood",
        photo: "/speakers/jackellyne-santana.png",
        isModerator: true,
      },
    ],
    description:
      "Fundadores que começaram cedo contam o que funcionou, o que quebrou e o que fariam diferente ao empreender ainda na casa dos 20.",
  },
  {
    id: "track-ecossistemas",
    type: "track",
    slot: 1,
    start: "11:00",
    end: "12:15",
    title: "De onde vêm os grandes empreendedores? O poder dos ecossistemas",
    shortTitle: "Ecossistemas",
    room: "Sala Arroz Integral",
    capacity: 60,
    speakers: [
      {
        name: "Rodrigo Terron",
        company: "NewHack",
        photo: "/speakers/rodrigo-terron.png",
      },
      {
        name: "Daniella Quelho",
        company: "Endeavor",
        photo: "/speakers/daniella-quelho.png",
      },
    ],
    description:
      "Como cidades, universidades e comunidades moldam quem empreende, com quem constrói ecossistemas na prática na NewHack e na Endeavor.",
  },
  {
    id: "track-produtos-ia",
    type: "track",
    slot: 1,
    start: "11:00",
    end: "12:15",
    title: "Construindo produtos na era da AI",
    shortTitle: "Produtos e AI",
    room: "Sala Guacamole",
    capacity: 70,
    speakers: [
      { name: "Jose", company: "Valor Capital", photo: "/speakers/jose-noblecilla.png" },
      {
        name: "Diego Zancaneli",
        company: "Pax",
        photo: "/speakers/diego-zacaneli.png",
      },
      {
        name: "Sofia Brandão",
        company: "Inteli",
        photo: "/speakers/sofia-brandao.png",
        isModerator: true,
      },
    ],
    description:
      "O que muda ao construir produto quando IA é o padrão: decisões reais de quem investe e de quem constrói nesse cenário todos os dias.",
  },
  {
    id: "track-pitch-mvp",
    type: "track",
    slot: 1,
    start: "11:00",
    end: "12:15",
    title: "Pitch Session — MVP",
    shortTitle: "Pitch Session · MVP",
    room: "Sala Feijoada",
    capacity: 43,
    speakers: [],
    description:
      "Startups em estágio de MVP apresentam seus pitches para a banca.",
  },
  {
    id: "track-pitch-seed",
    type: "track",
    slot: 1,
    start: "11:00",
    end: "12:15",
    title: "Pitch Session — Seed + Pré-seed",
    shortTitle: "Pitch Session · Seed + Pré-seed",
    room: "Sala Temaki",
    capacity: 50,
    speakers: [],
    description:
      "Startups em estágio de seed e pré-seed apresentam seus pitches para a banca.",
  },
  {
    id: "almoco",
    type: "break",
    slot: null,
    start: "12:15",
    end: "13:15",
    title: "Almoço + ativações de marca",
    room: "iFood HQ",
    speakers: [],
    menu: [
      {
        title: "Almoço · poke individual",
        note: "Três sabores à escolha",
        items: [
          "Salmão (arroz de sushi, salmão, abacate, sunomono, edamame, nori, shoyu)",
          "Frango grelhado (arroz de sushi, cubos de frango grelhado, sunomono, edamame, nori, shoyu)",
          "Cogumelos — vegetariano (arroz de sushi, mix de cogumelos, sunomono, edamame, nori, shoyu)",
        ],
      },
    ],
  },
  {
    id: "vetto",
    type: "plenary",
    slot: null,
    start: "13:15",
    end: "14:00",
    title: "Palestra: História da Vetto",
    subtitle: "Empreendendo na nova era das startups",
    room: "IA House",
    speakers: [
      { name: "Jose", company: "Vetto AI", photo: "/speakers/jose-andre.png" },
      { name: "Zen", company: "Vetto AI", photo: "/speakers/zen.png" },
      {
        name: "Natasha Fujito",
        company: "ITA",
        photo: "/speakers/natasha-fujito.png",
        isModerator: true,
      },
    ],
    description:
      "Os fundadores da Vetto AI contam, sem filtro, como é construir uma startup na nova era: decisões, erros e o que aprenderam no caminho.",
  },
  {
    id: "painel-tracos",
    type: "plenary",
    slot: null,
    start: "14:00",
    end: "14:45",
    title: "Painel: Traços de um empreendedor",
    room: "IA House",
    speakers: [
      { name: "Veronica Serra", photo: "/speakers/veronica-serra.png" },
      {
        name: "Davi Basa",
        photo: "/speakers/davi-basa.png",
        isModerator: true,
      },
    ],
    description:
      "O que separa quem constrói de quem só planeja: uma conversa com Veronica Serra sobre os traços que aparecem em grandes empreendedores.",
  },
  {
    id: "track-fintech",
    type: "track",
    slot: 2,
    start: "14:45",
    end: "15:45",
    title: "Construindo fintech no Brasil",
    shortTitle: "Fintech",
    room: "Sala Sonho Grande",
    capacity: 40,
    speakers: [
      { name: "Petrus", company: "NG Cash", photo: "/speakers/petrus-arruda.png" },
      {
        name: "Fred Amaral",
        company: "Lerian",
        photo: "/speakers/fred-amaral.png",
      },
      {
        name: "Pedro Braz",
        company: "Credituz",
        photo: "/speakers/pedro-braz.png",
      },
      {
        name: "Marcelo Gobato",
        company: "Monashees",
        photo: "/speakers/marcelo-gobato.png",
        isModerator: true,
      },
    ],
    description:
      "Quem opera fintech no Brasil hoje fala de regulação, distribuição e o que realmente é difícil — de NG Cash a Lerian e Credituz.",
  },
  {
    id: "track-early-stage",
    type: "track",
    slot: 2,
    start: "14:45",
    end: "15:45",
    title: "O dia a dia de uma startup early stage",
    shortTitle: "Early Stage",
    room: "Sala Arroz Integral",
    capacity: 60,
    speakers: [
      { name: "Pedro", company: "Vereda", photo: "/speakers/pedro-galindo.png" },
      { name: "Flavio", company: "Revert", photo: "/speakers/flavio-terni.png" },
      {
        name: "Rayssa",
        company: "GV",
        photo: "/speakers/rayssa.png",
        isModerator: true,
      },
    ],
    description:
      "Como é a rotina real de uma startup nos primeiros anos: prioridades, caos e decisões diárias, contadas por quem está vivendo isso agora.",
  },
  {
    id: "coffee",
    type: "break",
    slot: null,
    start: "16:00",
    end: "16:30",
    title: "Pausa Networking + Coffee",
    room: "iFood HQ",
    speakers: [],
    menu: [
      {
        title: "Café da tarde",
        items: [
          "Pão de queijo",
          "Bolo de coco",
          "Frutas da estação",
          "Mini sanduíche recheado",
          "Mini enroladinho de calabresa",
          "Mini enroladinho de presunto e queijo",
        ],
      },
    ],
  },
  {
    id: "painel-ia",
    type: "plenary",
    slot: null,
    start: "16:45",
    end: "17:45",
    title: "Painel: Construindo empresas de IA",
    room: "IA House",
    speakers: [
      {
        name: "Fernando Gadotti",
        company: "Tako",
        photo: "/speakers/fernando-gadotti.png",
      },
      {
        name: "Davi Abreu",
        company: "Inteli",
        photo: "/speakers/davi-abreu.png",
        isModerator: true,
      },
    ],
    description:
      "O que muda quando a empresa inteira — não só o produto — é construída em torno de IA, com quem está fazendo isso na Tako.",
  },
  {
    id: "podio",
    type: "plenary",
    slot: null,
    start: "17:45",
    end: "18:00",
    title: "Anúncio do pódio do pitch",
    room: "IA House",
    speakers: [],
    description:
      "O resultado das Pitch Sessions da manhã: as startups vencedoras de MVP e Seed + Pré-seed sobem ao palco.",
  },
  {
    id: "fechamento",
    type: "plenary",
    slot: null,
    start: "18:00",
    end: "18:30",
    title: "Fechamento",
    room: "IA House",
    speakers: [
      { name: "Breno", photo: "/speakers/breno.jpeg" },
      { name: "Alice", photo: "/speakers/alice.png" },
    ],
    description:
      "O encerramento oficial do Sync 2026: os destaques do dia e o que vem depois do evento.",
  },
];

export const TRACKS = AGENDA.filter((b) => b.type === "track");
export const SLOT_TIMES: Record<1 | 2, { start: string; end: string }> = {
  1: { start: "11:00", end: "12:15" },
  2: { start: "14:45", end: "15:45" },
};

export function tracksForSlot(slot: 1 | 2): AgendaBlock[] {
  return TRACKS.filter((b) => b.slot === slot);
}

export function blockById(id: string): AgendaBlock | undefined {
  return AGENDA.find((b) => b.id === id);
}
