type Props = {
  intensity?: "high" | "low";
};

/**
 * Fundo-assinatura do Sync: manchas verde-limão e cinza-azulado derretendo
 * sobre o escuro, com grão por cima. Presente em todas as telas do participante.
 */
export default function LivingBackground({ intensity = "high" }: Props) {
  const high = intensity === "high";
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-ink"
      style={{ opacity: 1 }}
    >
      <div style={{ opacity: high ? 1 : 0.4 }} className="absolute inset-0">
        <div
          className="blob blob-a"
          style={{
            width: "70vmax",
            height: "70vmax",
            left: "-20vmax",
            top: "-25vmax",
            background:
              "radial-gradient(circle at 40% 40%, rgba(229,242,126,0.55), transparent 65%)",
          }}
        />
        <div
          className="blob blob-b"
          style={{
            width: "65vmax",
            height: "65vmax",
            right: "-25vmax",
            top: "10vmax",
            background:
              "radial-gradient(circle at 55% 45%, rgba(143,160,184,0.45), transparent 65%)",
          }}
        />
        <div
          className="blob blob-c"
          style={{
            width: "60vmax",
            height: "60vmax",
            left: "-10vmax",
            bottom: "-25vmax",
            background:
              "radial-gradient(circle at 50% 50%, rgba(229,242,126,0.45), transparent 65%)",
          }}
        />
        <div
          className="blob blob-d"
          style={{
            width: "50vmax",
            height: "50vmax",
            right: "-12vmax",
            bottom: "-15vmax",
            background:
              "radial-gradient(circle at 50% 50%, rgba(183,186,204,0.3), transparent 65%)",
          }}
        />
      </div>
      {/* desvanece para o ink nas bordas: as barras do navegador (theme-color
          #18212B) encostam na página já na mesma cor, sem "borda" visível */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #18212B 0%, rgba(24,33,43,0) 16%, rgba(24,33,43,0) 84%, #18212B 100%)",
        }}
      />
      {/* grão */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] mix-blend-overlay">
        <filter id="sync-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#sync-noise)" />
      </svg>
    </div>
  );
}
