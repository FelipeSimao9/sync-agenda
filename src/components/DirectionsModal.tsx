"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Car,
  CarTaxiFront,
  Map,
  MapPin,
  Navigation,
  TriangleAlert,
} from "lucide-react";

const ADDRESS = "Av. dos Autonomistas, 1496 — Vila Yara, Osasco/SP";
const LAT = -23.5406754;
const LNG = -46.7674194;
const PLACE_ID = "ChIJ7Z225lH_zpQRRqJ8pMprye8";

const NAV_APPS = [
  {
    label: "Uber",
    icon: CarTaxiFront,
    href: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(
      `iFood - ${ADDRESS}`,
    )}&dropoff[latitude]=${LAT}&dropoff[longitude]=${LNG}`,
  },
  {
    label: "Waze",
    icon: Navigation,
    href: `https://www.waze.com/ul?ll=${LAT}%2C${LNG}&navigate=yes&zoom=17`,
  },
  {
    label: "Maps",
    icon: Map,
    href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `iFood - ${ADDRESS}`,
    )}&destination_place_id=${PLACE_ID}`,
  },
];

function Section({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof Car;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center gap-2.5">
        <Icon size={18} strokeWidth={1.75} className="shrink-0 text-lime" />
        <p className="text-[15px] font-bold leading-tight text-cream">{title}</p>
      </div>
      {note && <p className="mt-1 text-[12.5px] text-mist">{note}</p>}
      <div className="mt-3 text-[14px] leading-relaxed text-cream/85">
        {children}
      </div>
    </div>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-lime">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
};

/** "Como chegar": endereço, apps de navegação e instruções de acesso. */
export default function DirectionsModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-deep/60 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] w-full max-w-[480px] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-ink"
            style={{ boxShadow: "0 -20px 60px rgba(0,0,0,0.5)" }}
          >
            <div className="sticky top-0 flex justify-center bg-ink pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div className="max-h-[calc(88dvh-24px)] overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3">
              <p className="eyebrow">Como chegar</p>
              <h2 className="mt-2 text-[26px] font-bold uppercase leading-[1.02]">
                iFood HQ · Osasco
              </h2>
              <p className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug text-mist">
                <MapPin size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-lime" />
                {ADDRESS} · CEP 06020-902
              </p>

              {/* apps de navegação */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {NAV_APPS.map((app) => (
                  <a
                    key={app.label}
                    href={app.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-[18px] bg-lime py-3.5 font-bold text-ink-deep transition-transform active:scale-95"
                  >
                    <app.icon size={20} strokeWidth={1.75} />
                    <span className="text-[13px]">{app.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3.5">
                <Section
                  icon={Car}
                  title="De carro · Estacionamento iFood (P3)"
                  note="Av. dos Autonomistas, 1400 · 400 vagas para visitantes, por ordem de chegada"
                >
                  <Steps
                    items={[
                      "Passe em frente à entrada principal do Shopping União",
                      "Se oriente pela grade vermelha como referência visual",
                      "Desça a última rampa até a cancela",
                      "O time de segurança patrimonial vai orientar o seu acesso",
                    ]}
                  />
                  <p className="mt-3 flex items-start gap-2 rounded-[14px] border border-[#e9c46a]/40 bg-[#e9c46a]/10 px-3.5 py-2.5 text-[13px] font-semibold text-[#e9c46a]">
                    <TriangleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                    Não entre no estacionamento do shopping
                  </p>
                </Section>

                <Section
                  icon={Car}
                  title="Estacionamento do Shopping União"
                  note="Grátis às terças e quintas — dias de maior movimento, além das 500 vagas do iFood"
                >
                  <p>
                    <span className="font-semibold text-cream">Para entrar:</span>{" "}
                    retire o ticket na cancela e estacione na área{" "}
                    <span className="font-bold text-lime">AZUL</span>.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-cream">Para sair:</span>{" "}
                    retire o voucher no balcão da P2, próximo às catracas do
                    iFood (saída do estacionamento do shopping). Insira primeiro
                    o voucher no leitor e depois o ticket do estacionamento.
                    Pronto!
                  </p>
                </Section>

                <Section icon={Accessibility} title="Acessibilidade">
                  <p>
                    O estacionamento conta com vagas demarcadas para PCD. O
                    acesso ao escritório pode ser feito pelo elevador localizado
                    logo após a catraca.
                  </p>
                </Section>

                <Section icon={CarTaxiFront} title="De Uber ou a pé">
                  <p>
                    Peça para o motorista ir até a entrada principal do iFood na
                    Av. dos Autonomistas, 1496. A portaria é a entrada exclusiva
                    do escritório, com acesso direto pela avenida.
                  </p>
                </Section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
