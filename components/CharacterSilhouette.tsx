"use client";

// Highly distinctive SVG silhouettes — each character's most iconic feature dominates the frame
export function CharacterSilhouette({
  characterId,
  color,
  size = 56,
}: {
  characterId: string;
  color: string;
  size?: number;
}) {
  const shapes: Record<string, React.ReactNode> = {

    // YODA — enormous drooping ears are the whole story
    yoda: (
      <g>
        {/* Left ear — huge drooping */}
        <ellipse cx={18} cy={44} rx={11} ry={26} fill={color} opacity={0.92}
          transform="rotate(-18 18 44)" />
        {/* Right ear — huge drooping */}
        <ellipse cx={82} cy={44} rx={11} ry={26} fill={color} opacity={0.92}
          transform="rotate(18 82 44)" />
        {/* Small round head */}
        <circle cx={50} cy={30} r={18} fill={color} />
        {/* Forehead wrinkles */}
        <path d="M 40 25 Q 50 22 60 25" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.4} />
        <path d="M 42 29 Q 50 26 58 29" fill="none" stroke="#0a0a1a" strokeWidth={1.5} opacity={0.3} />
        {/* Eyes — large, wise */}
        <ellipse cx={43} cy={32} rx={5} ry={6} fill="#0a0a1a" />
        <ellipse cx={57} cy={32} rx={5} ry={6} fill="#0a0a1a" />
        <circle cx={43} cy={31} r={2} fill={color} opacity={0.7} />
        <circle cx={57} cy={31} r={2} fill={color} opacity={0.7} />
        {/* Squat robed body */}
        <path d="M 30 50 Q 28 72 26 88 L 74 88 Q 72 72 70 50 Z" fill={color} opacity={0.75} />
        {/* Cane */}
        <line x1={70} y1={65} x2={82} y2={90} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
      </g>
    ),

    // MACE WINDU — perfectly bald, purple lightsaber drawn
    mace: (
      <g>
        {/* Bald head — very round, no hair at all */}
        <ellipse cx={50} cy={26} rx={20} ry={22} fill={color} />
        {/* Strong brow ridge */}
        <path d="M 33 22 Q 50 18 67 22" fill="none" stroke="#0a0a1a" strokeWidth={3} opacity={0.5} />
        {/* Eyes */}
        <ellipse cx={42} cy={28} rx={5} ry={4} fill="#0a0a1a" />
        <ellipse cx={58} cy={28} rx={5} ry={4} fill="#0a0a1a" />
        {/* Body — broad, authoritative */}
        <path d="M 28 50 L 24 90 L 76 90 L 72 50 Z" fill={color} opacity={0.8} />
        {/* Cape */}
        <path d="M 28 50 L 18 90 L 28 90 L 32 55 Z" fill={color} opacity={0.5} />
        <path d="M 72 50 L 82 90 L 72 90 L 68 55 Z" fill={color} opacity={0.5} />
        {/* Lightsaber — the PURPLE one, held up */}
        <rect x={72} y={12} width={5} height={52} rx={2} fill="#a855f7" opacity={0.9} />
        <rect x={73} y={8} width={3} height={6} rx={1} fill="#7c3aed" />
        <ellipse cx={74} cy={10} rx={4} ry={2} fill="#c4b5fd" opacity={0.6} />
      </g>
    ),

    // OBI-WAN KENOBI — distinctive beard + Jedi robes
    obiwan: (
      <g>
        {/* Hair on top */}
        <ellipse cx={50} cy={18} rx={19} ry={14} fill={color} opacity={0.8} />
        {/* Head */}
        <ellipse cx={50} cy={28} rx={17} ry={18} fill={color} />
        {/* Eyes */}
        <ellipse cx={43} cy={27} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={27} rx={4} ry={4} fill="#0a0a1a" />
        {/* Beard — most distinctive, pointed downward */}
        <path d="M 40 40 Q 42 48 50 54 Q 58 48 60 40 Q 55 44 50 45 Q 45 44 40 40 Z"
          fill={color} opacity={0.9} />
        {/* Mustache */}
        <path d="M 42 38 Q 46 40 50 39 Q 54 40 58 38" fill="none" stroke={color} strokeWidth={3} opacity={0.7} />
        {/* Jedi robes — layered */}
        <path d="M 30 50 L 22 90 L 50 80 L 78 90 L 70 50 Z" fill={color} opacity={0.75} />
        <path d="M 36 50 L 34 88 L 50 80 L 66 88 L 64 50 Z" fill={color} opacity={0.6} />
        {/* Belt */}
        <rect x={30} y={68} width={40} height={5} rx={2} fill={color} opacity={0.95} />
      </g>
    ),

    // QUI-GON JINN — long hair flowing down sides
    quigon: (
      <g>
        {/* Long hair left */}
        <ellipse cx={26} cy={42} rx={10} ry={30} fill={color} opacity={0.8}
          transform="rotate(-5 26 42)" />
        {/* Long hair right */}
        <ellipse cx={74} cy={42} rx={10} ry={30} fill={color} opacity={0.8}
          transform="rotate(5 74 42)" />
        {/* Head */}
        <ellipse cx={50} cy={26} rx={18} ry={20} fill={color} />
        {/* Eyes */}
        <ellipse cx={43} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        {/* Short beard */}
        <ellipse cx={50} cy={42} rx={8} ry={5} fill={color} opacity={0.8} />
        {/* Tall body */}
        <path d="M 32 48 L 26 90 L 74 90 L 68 48 Z" fill={color} opacity={0.8} />
        <path d="M 38 48 L 36 88 L 64 88 L 62 48 Z" fill={color} opacity={0.6} />
      </g>
    ),

    // KI-ADI-MUNDI — his head is a CONE. unmistakable.
    kiadimundi: (
      <g>
        {/* The binary brain / cone head — VERY tall and pointed */}
        <path d="M 50 2 L 62 30 L 38 30 Z" fill={color} opacity={0.9} />
        <ellipse cx={50} cy={32} rx={14} ry={10} fill={color} />
        {/* Normal Jedi face below */}
        <ellipse cx={50} cy={42} rx={12} ry={12} fill={color} />
        {/* Eyes */}
        <ellipse cx={44} cy={41} rx={3.5} ry={3.5} fill="#0a0a1a" />
        <ellipse cx={56} cy={41} rx={3.5} ry={3.5} fill="#0a0a1a" />
        {/* Body */}
        <path d="M 32 56 L 26 90 L 74 90 L 68 56 Z" fill={color} opacity={0.78} />
        <path d="M 38 56 L 36 88 L 64 88 L 62 56 Z" fill={color} opacity={0.6} />
      </g>
    ),

    // AAYLA SECURA — Twi'lek, two long lekku hanging down past shoulders
    aayla: (
      <g>
        {/* Left lekku — thick tentacle hanging down */}
        <path d="M 36 36 Q 28 52 24 72 Q 20 82 22 90 Q 30 88 32 78 Q 34 62 38 46 Z"
          fill={color} opacity={0.85} />
        {/* Right lekku */}
        <path d="M 64 36 Q 72 52 76 72 Q 80 82 78 90 Q 70 88 68 78 Q 66 62 62 46 Z"
          fill={color} opacity={0.85} />
        {/* Round Twi'lek head (no hair, smooth) */}
        <circle cx={50} cy={28} r={19} fill={color} />
        {/* Almond eyes */}
        <ellipse cx={43} cy={27} rx={5} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={27} rx={5} ry={4} fill="#0a0a1a" />
        {/* Body */}
        <path d="M 34 48 L 30 88 L 70 88 L 66 48 Z" fill={color} opacity={0.75} />
      </g>
    ),

    // ANAKIN SKYWALKER — scar, raised fist with saber
    anakin: (
      <g>
        {/* Head */}
        <ellipse cx={50} cy={26} rx={18} ry={20} fill={color} />
        {/* Scar — thin line from eye down cheek */}
        <path d="M 58 22 L 62 36" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.6} />
        {/* Eyes */}
        <ellipse cx={42} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        {/* Dark clothing — no robe, more form-fitting */}
        <path d="M 30 48 L 24 90 L 76 90 L 70 48 Z" fill={color} opacity={0.85} />
        {/* Right arm raised with lightsaber */}
        <rect x={70} y={20} width={5} height={50} rx={2} fill={color} opacity={0.95} />
        <rect x={71} y={14} width={3} height={8} rx={1} fill={color} />
        {/* Saber blade glow */}
        <rect x={72} y={8} width={2} height={14} rx={1} fill="#fbbf24" opacity={0.8} />
      </g>
    ),

    // AHSOKA TANO — tall orange-white STRIPED montrals going up, lekku going down
    ahsoka: (
      <g>
        {/* Left montral going UP — tall striped horn */}
        <path d="M 40 22 Q 36 10 38 2 Q 42 0 44 8 Q 44 16 42 24 Z" fill={color} opacity={0.9} />
        {/* Right montral going UP */}
        <path d="M 60 22 Q 64 10 62 2 Q 58 0 56 8 Q 56 16 58 24 Z" fill={color} opacity={0.9} />
        {/* Stripe markings on montrals */}
        <path d="M 39 14 Q 40 10 43 8" fill="none" stroke="#f1f5f9" strokeWidth={1.5} opacity={0.6} />
        <path d="M 61 14 Q 60 10 57 8" fill="none" stroke="#f1f5f9" strokeWidth={1.5} opacity={0.6} />
        {/* Left lekku going DOWN */}
        <path d="M 36 36 Q 30 54 28 72 Q 26 82 28 90" fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" opacity={0.85} />
        {/* Right lekku going DOWN */}
        <path d="M 64 36 Q 70 54 72 72 Q 74 82 72 90" fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" opacity={0.85} />
        {/* Head */}
        <ellipse cx={50} cy={30} rx={16} ry={16} fill={color} />
        {/* Eyes */}
        <ellipse cx={43} cy={29} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={29} rx={4} ry={4} fill="#0a0a1a" />
        {/* Body */}
        <path d="M 34 48 L 30 88 L 70 88 L 66 48 Z" fill={color} opacity={0.75} />
      </g>
    ),

    // PLO KOON — breathing mask + goggles, very alien face
    plokoon: (
      <g>
        {/* Head */}
        <ellipse cx={50} cy={28} rx={18} ry={20} fill={color} />
        {/* Breathing mask / respirator — lower half of face */}
        <path d="M 34 32 Q 36 44 50 46 Q 64 44 66 32 Z" fill="#1e293b" opacity={0.9} />
        <rect x={36} y={36} width={28} height={8} rx={3} fill="#334155" opacity={0.8} />
        {/* Vent slits on mask */}
        <rect x={40} y={38} width={6} height={2} rx={1} fill={color} opacity={0.4} />
        <rect x={54} y={38} width={6} height={2} rx={1} fill={color} opacity={0.4} />
        {/* Goggle eyes — distinctive circular */}
        <circle cx={42} cy={26} r={7} fill="#0f172a" />
        <circle cx={58} cy={26} r={7} fill="#0f172a" />
        <circle cx={42} cy={26} r={4} fill={color} opacity={0.5} />
        <circle cx={58} cy={26} r={4} fill={color} opacity={0.5} />
        {/* Body */}
        <path d="M 30 50 L 24 90 L 76 90 L 70 50 Z" fill={color} opacity={0.78} />
        <path d="M 36 50 L 34 88 L 66 88 L 64 50 Z" fill={color} opacity={0.58} />
      </g>
    ),

    // SHAAK TI — tall fan/fin on head, two lekku
    shaakti: (
      <g>
        {/* Central head fin — tall and fan shaped */}
        <path d="M 50 2 Q 40 8 36 20 Q 38 24 50 22 Q 62 24 64 20 Q 60 8 50 2 Z"
          fill={color} opacity={0.9} />
        {/* Left lekku */}
        <path d="M 36 36 Q 28 54 26 74 Q 24 84 26 90"
          fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
        {/* Right lekku */}
        <path d="M 64 36 Q 72 54 74 74 Q 76 84 74 90"
          fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
        {/* Head */}
        <ellipse cx={50} cy={30} rx={16} ry={16} fill={color} />
        {/* Eyes */}
        <ellipse cx={43} cy={29} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={29} rx={4} ry={4} fill="#0a0a1a" />
        {/* Body */}
        <path d="M 34 48 L 30 88 L 70 88 L 66 48 Z" fill={color} opacity={0.75} />
      </g>
    ),

    // LUMINARA UNDULI — hooded, green-skinned, dark lips markings
    luminara: (
      <g>
        {/* Hood — large rounded shape behind/above head */}
        <ellipse cx={50} cy={22} rx={24} ry={20} fill={color} opacity={0.6} />
        {/* Head inside hood */}
        <ellipse cx={50} cy={26} rx={16} ry={17} fill={color} />
        {/* Chin tattoo markings */}
        <path d="M 44 40 Q 50 43 56 40" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.6} />
        <path d="M 46 43 Q 50 46 54 43" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.5} />
        {/* Eyes */}
        <ellipse cx={43} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={26} rx={4} ry={4} fill="#0a0a1a" />
        {/* Hooded robe body */}
        <path d="M 24 46 L 18 90 L 82 90 L 76 46 Q 62 44 50 48 Q 38 44 24 46 Z"
          fill={color} opacity={0.7} />
      </g>
    ),

    // BARRISS OFFEE — hooded Mirialan with facial tattoos
    barris: (
      <g>
        {/* Hood */}
        <ellipse cx={50} cy={20} rx={24} ry={18} fill={color} opacity={0.6} />
        {/* Head */}
        <ellipse cx={50} cy={28} rx={16} ry={17} fill={color} />
        {/* Distinctive diamond tattoos on face */}
        <polygon points="50,20 53,24 50,28 47,24" fill="#0a0a1a" opacity={0.5} />
        <polygon points="42,26 44,29 42,32 40,29" fill="#0a0a1a" opacity={0.4} />
        <polygon points="58,26 60,29 58,32 56,29" fill="#0a0a1a" opacity={0.4} />
        {/* Eyes */}
        <ellipse cx={43} cy={28} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={57} cy={28} rx={4} ry={4} fill="#0a0a1a" />
        {/* Robe */}
        <path d="M 26 46 L 20 90 L 80 90 L 74 46 Q 60 44 50 48 Q 40 44 26 46 Z"
          fill={color} opacity={0.72} />
      </g>
    ),

    // R2-D2 — dome + cylinder + stubby legs. absolutely unmistakable.
    r2d2: (
      <g>
        {/* Dome head — big semicircle */}
        <ellipse cx={50} cy={28} rx={22} ry={18} fill={color} />
        {/* Central eye / camera — circular, prominent */}
        <circle cx={50} cy={26} r={8} fill="#0f172a" />
        <circle cx={50} cy={26} r={5} fill={color} opacity={0.7} />
        <circle cx={50} cy={26} r={2.5} fill="#0f172a" />
        {/* Side indicator lights */}
        <circle cx={34} cy={24} r={3} fill="#ef4444" opacity={0.8} />
        <circle cx={66} cy={24} r={3} fill="#fbbf24" opacity={0.8} />
        {/* Cylindrical body */}
        <rect x={28} y={46} width={44} height={36} rx={8} fill={color} opacity={0.9} />
        {/* Panel lines */}
        <rect x={36} y={52} width={8} height={10} rx={2} fill="#0f172a" opacity={0.5} />
        <rect x={56} y={52} width={8} height={10} rx={2} fill="#0f172a" opacity={0.5} />
        <rect x={44} y={54} width={12} height={6} rx={2} fill="#0f172a" opacity={0.4} />
        {/* Horizontal seam */}
        <line x1={28} y1={62} x2={72} y2={62} stroke="#0f172a" strokeWidth={2} opacity={0.4} />
        {/* Stubby legs */}
        <rect x={30} y={80} width={12} height={14} rx={4} fill={color} opacity={0.85} />
        <rect x={58} y={80} width={12} height={14} rx={4} fill={color} opacity={0.85} />
      </g>
    ),

    // C-3PO — golden humanoid, round head with visor eyes
    c3po: (
      <g>
        {/* Round golden head */}
        <circle cx={50} cy={22} r={20} fill={color} />
        {/* Visor / eye piece — wide horizontal visor */}
        <rect x={34} y={18} width={32} height={10} rx={4} fill="#0f172a" />
        {/* Pupils */}
        <circle cx={43} cy={23} r={4} fill={color} opacity={0.6} />
        <circle cx={57} cy={23} r={4} fill={color} opacity={0.6} />
        <circle cx={43} cy={23} r={2} fill="#0f172a" />
        <circle cx={57} cy={23} r={2} fill="#0f172a" />
        {/* Neck */}
        <rect x={44} y={42} width={12} height={6} rx={3} fill={color} opacity={0.85} />
        {/* Articulated body */}
        <rect x={30} y={48} width={40} height={30} rx={6} fill={color} opacity={0.9} />
        {/* Chest panel */}
        <rect x={38} y={54} width={24} height={16} rx={3} fill="#0f172a" opacity={0.3} />
        {/* Arms */}
        <rect x={18} y={50} width={10} height={22} rx={4} fill={color} opacity={0.8} />
        <rect x={72} y={50} width={10} height={22} rx={4} fill={color} opacity={0.8} />
        {/* Legs */}
        <rect x={32} y={78} width={14} height={16} rx={4} fill={color} opacity={0.85} />
        <rect x={54} y={78} width={14} height={16} rx={4} fill={color} opacity={0.85} />
      </g>
    ),

    // BB-8 — big sphere body, small dome offset. super recognizable.
    bb8: (
      <g>
        {/* Big sphere body */}
        <circle cx={50} cy={66} r={30} fill={color} opacity={0.9} />
        {/* Sphere panel markings */}
        <ellipse cx={50} cy={66} rx={30} ry={14} fill="none" stroke="#0f172a" strokeWidth={2} opacity={0.3} />
        <ellipse cx={50} cy={66} rx={14} ry={30} fill="none" stroke="#0f172a" strokeWidth={2} opacity={0.3} />
        {/* Orange accent circle on body */}
        <circle cx={42} cy={56} r={6} fill="none" stroke="#f97316" strokeWidth={2.5} opacity={0.7} />
        <circle cx={60} cy={72} r={4} fill="none" stroke="#f97316" strokeWidth={2} opacity={0.6} />
        {/* Small dome head — offset to right */}
        <ellipse cx={58} cy={36} rx={16} ry={12} fill={color} />
        {/* BB-8 eye — central camera */}
        <circle cx={60} cy={34} r={6} fill="#0f172a" />
        <circle cx={60} cy={34} r={3.5} fill={color} opacity={0.6} />
        <circle cx={60} cy={34} r={1.5} fill="#0f172a" />
        {/* Small indicator */}
        <circle cx={50} cy={32} r={3} fill="#f97316" opacity={0.8} />
      </g>
    ),

    // JAR JAR BINKS — absurdly long floppy ears and long neck
    jarjar: (
      <g>
        {/* Left long floppy ear — hangs WAY down */}
        <path d="M 34 28 Q 22 44 18 66 Q 16 80 20 88 Q 28 86 30 74 Q 32 54 38 36 Z"
          fill={color} opacity={0.85} />
        {/* Right long floppy ear */}
        <path d="M 66 28 Q 78 44 82 66 Q 84 80 80 88 Q 72 86 70 74 Q 68 54 62 36 Z"
          fill={color} opacity={0.85} />
        {/* Long neck */}
        <rect x={44} y={40} width={12} height={20} rx={4} fill={color} opacity={0.85} />
        {/* Head */}
        <ellipse cx={50} cy={26} rx={18} ry={18} fill={color} />
        {/* Bug eyes — on stalks, bulging outward */}
        <ellipse cx={38} cy={20} rx={8} ry={8} fill={color} />
        <ellipse cx={62} cy={20} rx={8} ry={8} fill={color} />
        <circle cx={38} cy={20} r={5} fill="#0f172a" />
        <circle cx={62} cy={20} r={5} fill="#0f172a" />
        <circle cx={38} cy={19} r={2} fill={color} opacity={0.7} />
        <circle cx={62} cy={19} r={2} fill={color} opacity={0.7} />
        {/* Body */}
        <path d="M 36 62 L 30 90 L 70 90 L 64 62 Z" fill={color} opacity={0.75} />
      </g>
    ),

    // CHEWBACCA — enormous, shaggy, bandolier across chest
    chewie: (
      <g>
        {/* Big shaggy body */}
        <ellipse cx={50} cy={68} rx={30} ry={26} fill={color} opacity={0.9} />
        {/* Fur texture on body sides */}
        <path d="M 20 60 Q 16 68 20 76 Q 24 66 20 60 Z" fill={color} opacity={0.7} />
        <path d="M 80 60 Q 84 68 80 76 Q 76 66 80 60 Z" fill={color} opacity={0.7} />
        {/* Small round ears */}
        <circle cx={34} cy={20} r={9} fill={color} />
        <circle cx={66} cy={20} r={9} fill={color} />
        {/* Head */}
        <ellipse cx={50} cy={28} rx={22} ry={22} fill={color} />
        {/* Face — brow ridge, small nose */}
        <path d="M 34 24 Q 50 20 66 24" fill="none" stroke="#0f172a" strokeWidth={3} opacity={0.5} />
        {/* Eyes */}
        <ellipse cx={42} cy={28} rx={4} ry={4} fill="#1a0a00" />
        <ellipse cx={58} cy={28} rx={4} ry={4} fill="#1a0a00" />
        {/* Nose */}
        <ellipse cx={50} cy={36} rx={5} ry={3} fill="#1a0a00" opacity={0.8} />
        {/* Bandolier — thick diagonal strap */}
        <path d="M 24 48 L 72 80" stroke="#1a0a00" strokeWidth={7} strokeLinecap="round" opacity={0.6} />
        {/* Ammo pouches on bandolier */}
        <circle cx={36} cy={54} r={4} fill="#1a0a00" opacity={0.7} />
        <circle cx={46} cy={60} r={4} fill="#1a0a00" opacity={0.7} />
        <circle cx={56} cy={66} r={4} fill="#1a0a00" opacity={0.7} />
      </g>
    ),

    // LANDO CALRISSIAN — flowing cape, dashing silhouette
    lando: (
      <g>
        {/* Cape — flowing dramatically to left */}
        <path d="M 30 44 Q 10 58 8 80 Q 8 90 16 90 L 30 90 Q 26 76 28 60 L 34 48 Z"
          fill={color} opacity={0.7} />
        {/* Head */}
        <ellipse cx={50} cy={24} rx={18} ry={20} fill={color} />
        {/* Smile / charm */}
        <path d="M 43 32 Q 50 36 57 32" fill="none" stroke="#0f172a" strokeWidth={2} opacity={0.5} />
        {/* Eyes */}
        <ellipse cx={43} cy={24} rx={4} ry={4} fill="#0f172a" />
        <ellipse cx={57} cy={24} rx={4} ry={4} fill="#0f172a" />
        {/* Body — suave outfit */}
        <path d="M 32 46 L 28 90 L 72 90 L 68 46 Z" fill={color} opacity={0.85} />
        {/* Collar detail */}
        <path d="M 38 46 L 50 54 L 62 46" fill="none" stroke={color} strokeWidth={4}
          strokeLinejoin="round" opacity={0.95} />
        {/* Belt */}
        <rect x={32} y={70} width={36} height={4} rx={2} fill={color} opacity={0.95} />
      </g>
    ),

    // ── NEW HIGH-TIER CHARACTERS ──────────────────────────────────────────────

    // KIT FISTO — wide Nautolan head with flowing tentacle dreadlocks, massive grin
    kitfisto: (
      <g>
        {/* Tentacle dreadlocks fanning left */}
        <path d="M 32 34 Q 14 40 8 56 Q 10 62 16 60 Q 22 50 30 42 Z" fill={color} opacity={0.8} />
        <path d="M 34 38 Q 18 52 14 70 Q 18 76 24 72 Q 28 56 36 44 Z" fill={color} opacity={0.75} />
        <path d="M 36 42 Q 22 62 20 80 Q 24 86 30 82 Q 32 66 40 50 Z" fill={color} opacity={0.65} />
        {/* Tentacle dreadlocks fanning right */}
        <path d="M 68 34 Q 86 40 92 56 Q 90 62 84 60 Q 78 50 70 42 Z" fill={color} opacity={0.8} />
        <path d="M 66 38 Q 82 52 86 70 Q 82 76 76 72 Q 72 56 64 44 Z" fill={color} opacity={0.75} />
        <path d="M 64 42 Q 78 62 80 80 Q 76 86 70 82 Q 68 66 60 50 Z" fill={color} opacity={0.65} />
        {/* Head */}
        <ellipse cx={50} cy={28} rx={20} ry={20} fill={color} />
        {/* Large dark eyes */}
        <ellipse cx={42} cy={26} rx={5} ry={5} fill="#0a0a1a" />
        <ellipse cx={58} cy={26} rx={5} ry={5} fill="#0a0a1a" />
        <circle cx={42} cy={25} r={2} fill={color} opacity={0.55} />
        <circle cx={58} cy={25} r={2} fill={color} opacity={0.55} />
        {/* Big permanent grin */}
        <path d="M 38 36 Q 50 44 62 36" fill="none" stroke="#0a0a1a" strokeWidth={3}
          strokeLinecap="round" opacity={0.6} />
        {/* Body */}
        <path d="M 32 50 L 26 90 L 74 90 L 68 50 Z" fill={color} opacity={0.78} />
      </g>
    ),

    // SAESEE TIIN — massive curved ram horns sweeping backward
    saesee: (
      <g>
        {/* Left curved horn */}
        <path d="M 36 22 Q 18 16 10 28 Q 6 42 18 52 Q 24 56 28 50 Q 20 44 22 32 Q 26 18 38 26 Z"
          fill={color} opacity={0.9} />
        {/* Right curved horn */}
        <path d="M 64 22 Q 82 16 90 28 Q 94 42 82 52 Q 76 56 72 50 Q 80 44 78 32 Q 74 18 62 26 Z"
          fill={color} opacity={0.9} />
        {/* Head */}
        <ellipse cx={50} cy={30} rx={18} ry={18} fill={color} />
        {/* Eyes */}
        <ellipse cx={42} cy={28} rx={4} ry={4} fill="#0a0a1a" />
        <ellipse cx={58} cy={28} rx={4} ry={4} fill="#0a0a1a" />
        {/* Strong jaw */}
        <path d="M 36 40 Q 50 46 64 40" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.4} />
        {/* Body */}
        <path d="M 30 50 L 24 90 L 76 90 L 70 50 Z" fill={color} opacity={0.8} />
        <path d="M 36 50 L 34 88 L 66 88 L 64 50 Z" fill={color} opacity={0.6} />
      </g>
    ),

    // YADDLE — female Yoda species, long flowing hair, drooping ears
    yaddle: (
      <g>
        {/* Left drooping ear */}
        <ellipse cx={17} cy={46} rx={10} ry={28} fill={color} opacity={0.9}
          transform="rotate(-14 17 46)" />
        {/* Right ear */}
        <ellipse cx={83} cy={46} rx={10} ry={28} fill={color} opacity={0.9}
          transform="rotate(14 83 46)" />
        {/* Long flowing hair behind head */}
        <ellipse cx={50} cy={54} rx={16} ry={32} fill={color} opacity={0.55} />
        {/* Small round head */}
        <circle cx={50} cy={30} r={18} fill={color} />
        {/* Eyes */}
        <ellipse cx={43} cy={30} rx={5} ry={5} fill="#0a0a1a" />
        <ellipse cx={57} cy={30} rx={5} ry={5} fill="#0a0a1a" />
        <circle cx={43} cy={29} r={2} fill={color} opacity={0.6} />
        <circle cx={57} cy={29} r={2} fill={color} opacity={0.6} />
        {/* Gentle smile */}
        <path d="M 44 40 Q 50 43 56 40" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.4} />
        {/* Small robed body */}
        <path d="M 32 50 Q 30 68 28 88 L 72 88 Q 70 68 68 50 Z" fill={color} opacity={0.75} />
      </g>
    ),

    // EVEN PIELL — tiny Lannik, huge pointed ears, fierce battle scar
    evenpiell: (
      <g>
        {/* Huge pointed left ear — taller than head */}
        <path d="M 28 24 Q 10 6 14 28 Q 16 38 26 34 Z" fill={color} opacity={0.9} />
        {/* Huge pointed right ear */}
        <path d="M 72 24 Q 90 6 86 28 Q 84 38 74 34 Z" fill={color} opacity={0.9} />
        {/* Head */}
        <ellipse cx={50} cy={34} rx={22} ry={18} fill={color} />
        {/* Eyes */}
        <ellipse cx={41} cy={32} rx={5} ry={4} fill="#0a0a1a" />
        <ellipse cx={59} cy={32} rx={5} ry={4} fill="#0a0a1a" />
        {/* Battle scar across right eye */}
        <path d="M 55 26 L 63 40" fill="none" stroke="#0a0a1a" strokeWidth={3} opacity={0.7} />
        {/* Fierce frown */}
        <path d="M 42 44 Q 50 40 58 44" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.5} />
        {/* Stocky body */}
        <path d="M 28 54 L 22 90 L 78 90 L 72 54 Z" fill={color} opacity={0.82} />
      </g>
    ),

    // ── NEW MEDIUM-TIER CHARACTERS ────────────────────────────────────────────

    // CAPTAIN REX — clone trooper helmet with blue Y-visor marking
    rex: (
      <g>
        {/* Helmet dome */}
        <ellipse cx={50} cy={24} rx={22} ry={20} fill={color} opacity={0.9} />
        {/* T-visor */}
        <rect x={34} y={20} width={32} height={12} rx={3} fill="#0f172a" />
        {/* Vertical slit above visor */}
        <rect x={46} y={12} width={8} height={10} rx={2} fill="#0f172a" />
        {/* Blue Y-shaped helmet markings */}
        <path d="M 42 20 Q 50 26 58 20" fill="none" stroke="#60a5fa" strokeWidth={2.5} opacity={0.85} />
        <line x1={50} y1={26} x2={50} y2={34} stroke="#60a5fa" strokeWidth={2.5} opacity={0.85} />
        {/* Rangefinder on left */}
        <rect x={27} y={14} width={5} height={10} rx={2} fill={color} opacity={0.85} />
        <circle cx={29} cy={14} r={3} fill="#60a5fa" opacity={0.7} />
        {/* Armor body */}
        <path d="M 28 46 L 22 90 L 78 90 L 72 46 Z" fill={color} opacity={0.85} />
        {/* Right pauldron */}
        <ellipse cx={76} cy={52} rx={10} ry={7} fill={color} opacity={0.95} />
        {/* Chest plate */}
        <rect x={34} y={52} width={32} height={20} rx={4} fill={color} opacity={0.95} />
        {/* Blue stripe */}
        <rect x={44} y={52} width={12} height={20} rx={2} fill="#60a5fa" opacity={0.3} />
        {/* Utility belt */}
        <rect x={28} y={74} width={44} height={5} rx={2} fill={color} opacity={0.95} />
      </g>
    ),

    // KANAN JARRUS — blindfold across eyes, scruffy beard, Jedi exile
    kanan: (
      <g>
        {/* Hair */}
        <ellipse cx={50} cy={18} rx={20} ry={14} fill={color} opacity={0.75} />
        {/* Head */}
        <ellipse cx={50} cy={28} rx={18} ry={18} fill={color} />
        {/* Blindfold — wraps across eyes */}
        <rect x={32} y={23} width={36} height={10} rx={4} fill="#1e293b" opacity={0.95} />
        {/* Blindfold knot at side */}
        <ellipse cx={68} cy={28} rx={5} ry={4} fill="#0f172a" opacity={0.8} />
        {/* Scruffy beard */}
        <path d="M 38 38 Q 42 50 50 54 Q 58 50 62 38 Q 56 44 50 46 Q 44 44 38 38 Z"
          fill={color} opacity={0.85} />
        {/* Mustache */}
        <path d="M 42 37 Q 46 39 50 38 Q 54 39 58 37" fill="none" stroke={color} strokeWidth={2.5} opacity={0.7} />
        {/* Body — rebel jacket */}
        <path d="M 30 50 L 22 90 L 78 90 L 70 50 Z" fill={color} opacity={0.8} />
        {/* V-collar */}
        <path d="M 38 50 L 50 60 L 62 50" fill={color} opacity={0.9} />
        {/* Lightsaber at hip */}
        <rect x={70} y={68} width={4} height={22} rx={2} fill={color} opacity={0.9} />
      </g>
    ),

    // EZRA BRIDGER — young rebel, spiky hair, optimistic
    ezra: (
      <g>
        {/* Spiky hair — messy peaks */}
        <path d="M 32 18 Q 36 4 50 6 Q 64 4 68 18" fill={color} opacity={0.8} />
        <path d="M 36 12 Q 38 2 44 8" fill={color} opacity={0.7} />
        <path d="M 64 12 Q 62 2 56 8" fill={color} opacity={0.7} />
        <path d="M 50 6 Q 52 0 50 8" fill={color} opacity={0.75} />
        {/* Young round head */}
        <ellipse cx={50} cy={28} rx={18} ry={18} fill={color} />
        {/* Open youthful eyes */}
        <ellipse cx={42} cy={27} rx={4.5} ry={5} fill="#0a0a1a" />
        <ellipse cx={58} cy={27} rx={4.5} ry={5} fill="#0a0a1a" />
        <circle cx={42} cy={26} r={2} fill={color} opacity={0.6} />
        <circle cx={58} cy={26} r={2} fill={color} opacity={0.6} />
        {/* Slight smirk */}
        <path d="M 44 36 Q 50 39 55 36" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.4} />
        {/* Rebel jacket body */}
        <path d="M 32 48 L 26 90 L 74 90 L 68 48 Z" fill={color} opacity={0.8} />
        {/* Saber-blaster raised */}
        <rect x={68} y={40} width={4} height={28} rx={2} fill={color} opacity={0.9} />
        <rect x={66} y={36} width={8} height={6} rx={2} fill={color} opacity={0.85} />
        <line x1={70} y1={36} x2={70} y2={26} stroke="#38bdf8" strokeWidth={2.5} opacity={0.85} />
      </g>
    ),

    // HERA SYNDULLA — Twi'lek pilot, goggles on forehead, two lekku
    hera: (
      <g>
        {/* Left lekku */}
        <path d="M 36 34 Q 22 50 18 72 Q 16 84 20 90 Q 28 88 30 76 Q 32 56 40 42 Z"
          fill={color} opacity={0.85} />
        {/* Right lekku */}
        <path d="M 64 34 Q 78 50 82 72 Q 84 84 80 90 Q 72 88 70 76 Q 68 56 60 42 Z"
          fill={color} opacity={0.85} />
        {/* Head */}
        <ellipse cx={50} cy={26} rx={18} ry={18} fill={color} />
        {/* Pilot goggles on forehead */}
        <rect x={33} y={13} width={34} height={11} rx={5} fill="#1e293b" opacity={0.9} />
        <rect x={35} y={14} width={13} height={9} rx={4} fill="#334155" opacity={0.8} />
        <rect x={52} y={14} width={13} height={9} rx={4} fill="#334155" opacity={0.8} />
        <line x1={48} y1={18} x2={52} y2={18} stroke="#1e293b" strokeWidth={2} />
        {/* Eyes */}
        <ellipse cx={42} cy={28} rx={5} ry={4} fill="#0a0a1a" />
        <ellipse cx={58} cy={28} rx={5} ry={4} fill="#0a0a1a" />
        {/* Flight suit body */}
        <path d="M 32 46 L 26 90 L 74 90 L 68 46 Z" fill={color} opacity={0.82} />
      </g>
    ),

    // SABINE WREN — Mandalorian helmet with colorful paint markings
    sabine: (
      <g>
        {/* Helmet dome */}
        <ellipse cx={50} cy={24} rx={22} ry={20} fill={color} opacity={0.9} />
        {/* T-visor — Mandalorian style */}
        <path d="M 34 22 L 66 22 L 66 30 Q 58 34 50 34 Q 42 34 34 30 Z" fill="#0f172a" opacity={0.9} />
        {/* Helmet top crest */}
        <rect x={44} y={4} width={12} height={8} rx={2} fill={color} opacity={0.9} />
        {/* Paint splash markings */}
        <circle cx={38} cy={18} r={5} fill="#f97316" opacity={0.72} />
        <circle cx={44} cy={12} r={3} fill="#f97316" opacity={0.6} />
        <circle cx={32} cy={14} r={2} fill="#fbbf24" opacity={0.65} />
        <circle cx={42} cy={16} r={1.5} fill="#fbbf24" opacity={0.55} />
        {/* Armor body */}
        <path d="M 28 46 L 22 90 L 78 90 L 72 46 Z" fill={color} opacity={0.85} />
        {/* Chest plate */}
        <ellipse cx={50} cy={58} rx={16} ry={12} fill={color} opacity={0.95} />
        {/* Pauldrons */}
        <ellipse cx={26} cy={50} rx={9} ry={6} fill={color} opacity={0.9} />
        <ellipse cx={74} cy={50} rx={9} ry={6} fill={color} opacity={0.9} />
        {/* Wrist paint tool */}
        <rect x={17} y={64} width={9} height={6} rx={2} fill={color} opacity={0.85} />
        <circle cx={22} cy={64} r={3} fill="#f97316" opacity={0.75} />
      </g>
    ),

    // ── NEW LOW-TIER CHARACTERS ───────────────────────────────────────────────

    // GROGU (Baby Yoda) — ENORMOUS ears, oversized eyes, tiny cloak body
    grogu: (
      <g>
        {/* Mega-ears — dominate the entire frame */}
        <ellipse cx={12} cy={40} rx={12} ry={34} fill={color} opacity={0.92}
          transform="rotate(-10 12 40)" />
        <ellipse cx={88} cy={40} rx={12} ry={34} fill={color} opacity={0.92}
          transform="rotate(10 88 40)" />
        {/* Big round baby head */}
        <circle cx={50} cy={30} r={22} fill={color} />
        {/* GIANT shiny eyes — most important feature */}
        <circle cx={40} cy={30} r={9} fill="#0a0a1a" />
        <circle cx={60} cy={30} r={9} fill="#0a0a1a" />
        <circle cx={38} cy={27} r={3.5} fill="white" opacity={0.65} />
        <circle cx={58} cy={27} r={3.5} fill="white" opacity={0.65} />
        <circle cx={42} cy={33} r={1.5} fill="white" opacity={0.35} />
        <circle cx={62} cy={33} r={1.5} fill="white" opacity={0.35} />
        {/* Tiny wrinkled forehead */}
        <path d="M 40 18 Q 50 16 60 18" fill="none" stroke="#0a0a1a" strokeWidth={1.5} opacity={0.25} />
        {/* Tiny pursed mouth */}
        <ellipse cx={50} cy={43} rx={4} ry={3} fill={color} opacity={0.65} />
        {/* Little cloak body — much smaller than head */}
        <path d="M 36 54 Q 32 70 30 88 L 70 88 Q 68 70 64 54 Z" fill={color} opacity={0.72} />
        {/* Stubby little hands */}
        <circle cx={30} cy={62} r={5} fill={color} opacity={0.85} />
        <circle cx={70} cy={62} r={5} fill={color} opacity={0.85} />
      </g>
    ),

    // IG-11 — assassination droid, round head, twin photoreceptors
    ig11: (
      <g>
        {/* Neck strut */}
        <rect x={46} y={32} width={8} height={22} rx={2} fill={color} opacity={0.9} />
        {/* Round spherical head */}
        <circle cx={50} cy={22} r={22} fill={color} opacity={0.9} />
        {/* Twin photoreceptors — the defining feature */}
        <circle cx={37} cy={20} r={9} fill="#0f172a" />
        <circle cx={63} cy={20} r={9} fill="#0f172a" />
        <circle cx={37} cy={20} r={5} fill={color} opacity={0.48} />
        <circle cx={63} cy={20} r={5} fill={color} opacity={0.48} />
        <circle cx={37} cy={20} r={2.5} fill={color} opacity={0.9} />
        <circle cx={63} cy={20} r={2.5} fill={color} opacity={0.9} />
        {/* Sensor dish on top */}
        <path d="M 40 2 Q 50 -2 60 2 Q 60 10 50 12 Q 40 10 40 2 Z" fill={color} opacity={0.82} />
        <line x1={50} y1={0} x2={50} y2={-6} stroke={color} strokeWidth={2} />
        {/* Mechanical body */}
        <rect x={30} y={54} width={40} height={28} rx={4} fill={color} opacity={0.85} />
        <line x1={30} y1={60} x2={70} y2={60} stroke="#0f172a" strokeWidth={2} opacity={0.4} />
        <line x1={30} y1={66} x2={70} y2={66} stroke="#0f172a" strokeWidth={2} opacity={0.4} />
        <line x1={30} y1={72} x2={70} y2={72} stroke="#0f172a" strokeWidth={2} opacity={0.4} />
        {/* Long thin arms */}
        <rect x={10} y={56} width={8} height={26} rx={3} fill={color} opacity={0.8} />
        <rect x={82} y={56} width={8} height={26} rx={3} fill={color} opacity={0.8} />
        {/* Leg struts */}
        <rect x={34} y={82} width={10} height={12} rx={3} fill={color} opacity={0.85} />
        <rect x={56} y={82} width={10} height={12} rx={3} fill={color} opacity={0.85} />
      </g>
    ),

    // CHOPPER (C1-10P) — stocky grumpy astromech, extended claw arm
    chopper: (
      <g>
        {/* Boxy dome head */}
        <ellipse cx={50} cy={22} rx={20} ry={16} fill={color} opacity={0.92} />
        <rect x={32} y={16} width={36} height={12} rx={4} fill={color} opacity={0.92} />
        {/* Single grumpy photoreceptor */}
        <circle cx={50} cy={20} r={7} fill="#0f172a" />
        <circle cx={50} cy={20} r={4} fill={color} opacity={0.6} />
        <circle cx={50} cy={20} r={2} fill="#0f172a" />
        {/* Grumpy brow line */}
        <path d="M 38 13 Q 50 11 62 13" fill="none" stroke="#0f172a" strokeWidth={2.5} opacity={0.5} />
        {/* Indicator lights */}
        <circle cx={34} cy={18} r={3} fill="#ef4444" opacity={0.85} />
        <circle cx={66} cy={18} r={3} fill="#fbbf24" opacity={0.75} />
        {/* Stocky body */}
        <rect x={28} y={38} width={44} height={40} rx={6} fill={color} opacity={0.9} />
        {/* Body panels */}
        <rect x={36} y={46} width={10} height={9} rx={2} fill="#0f172a" opacity={0.4} />
        <rect x={54} y={46} width={10} height={9} rx={2} fill="#0f172a" opacity={0.4} />
        {/* Extended claw arm — distinctive */}
        <rect x={72} y={40} width={6} height={28} rx={3} fill={color} opacity={0.88} />
        <line x1={78} y1={44} x2={92} y2={36} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.82} />
        <line x1={78} y1={56} x2={92} y2={56} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.82} />
        {/* Wheels/legs */}
        <rect x={30} y={78} width={14} height={12} rx={4} fill={color} opacity={0.88} />
        <rect x={56} y={78} width={14} height={12} rx={4} fill={color} opacity={0.88} />
      </g>
    ),

    // WICKET — Ewok, triangle ears, spear, fuzzy round shape
    wicket: (
      <g>
        {/* Left triangle ear */}
        <path d="M 28 24 L 16 4 L 38 18 Z" fill={color} opacity={0.9} />
        {/* Right triangle ear */}
        <path d="M 72 24 L 84 4 L 62 18 Z" fill={color} opacity={0.9} />
        {/* Inner ear marks */}
        <path d="M 29 22 L 20 7 L 35 18 Z" fill={color} opacity={0.55} />
        <path d="M 71 22 L 80 7 L 65 18 Z" fill={color} opacity={0.55} />
        {/* Round fluffy head */}
        <circle cx={50} cy={30} r={22} fill={color} />
        {/* Muzzle bump */}
        <ellipse cx={50} cy={40} rx={10} ry={7} fill={color} opacity={0.82} />
        {/* Curious eyes */}
        <circle cx={40} cy={27} r={5} fill="#1a0a00" />
        <circle cx={60} cy={27} r={5} fill="#1a0a00" />
        <circle cx={39} cy={26} r={2} fill="white" opacity={0.4} />
        <circle cx={59} cy={26} r={2} fill="white" opacity={0.4} />
        {/* Nose */}
        <ellipse cx={50} cy={38} rx={4} ry={3} fill="#1a0a00" opacity={0.8} />
        {/* Fuzzy round body */}
        <ellipse cx={50} cy={70} rx={22} ry={22} fill={color} opacity={0.88} />
        {/* Leaf hood/cloth */}
        <path d="M 28 52 Q 26 64 30 68 L 70 68 Q 74 64 72 52 Z" fill={color} opacity={0.6} />
        {/* Spear */}
        <line x1={80} y1={8} x2={78} y2={92} stroke={color} strokeWidth={4}
          strokeLinecap="round" opacity={0.85} />
        <path d="M 76 8 L 80 8 L 82 18 Z" fill={color} opacity={0.92} />
      </g>
    ),

    // NIEN NUNB — Sullustian co-pilot, huge dark eyes, floppy cheek jowls
    niennunb: (
      <g>
        {/* Floppy cheek jowls — very distinctive */}
        <ellipse cx={26} cy={42} rx={14} ry={18} fill={color} opacity={0.85} />
        <ellipse cx={74} cy={42} rx={14} ry={18} fill={color} opacity={0.85} />
        {/* Round head */}
        <ellipse cx={50} cy={28} rx={20} ry={20} fill={color} />
        {/* HUGE dark eyes */}
        <ellipse cx={40} cy={26} rx={9} ry={8} fill="#0a0a1a" />
        <ellipse cx={60} cy={26} rx={9} ry={8} fill="#0a0a1a" />
        <ellipse cx={40} cy={25} rx={4} ry={3} fill={color} opacity={0.3} />
        <ellipse cx={60} cy={25} rx={4} ry={3} fill={color} opacity={0.3} />
        {/* Wide flat nose */}
        <ellipse cx={50} cy={34} rx={6} ry={4} fill="#0a0a1a" opacity={0.55} />
        {/* Pursed mouth */}
        <path d="M 44 42 Q 50 44 56 42" fill="none" stroke="#0a0a1a" strokeWidth={2} opacity={0.45} />
        {/* Rebel pilot suit */}
        <path d="M 30 50 L 24 90 L 76 90 L 70 50 Z" fill={color} opacity={0.82} />
        {/* Pilot harness straps */}
        <line x1={40} y1={52} x2={36} y2={88} stroke="#0a0a1a" strokeWidth={2} opacity={0.35} />
        <line x1={60} y1={52} x2={64} y2={88} stroke="#0a0a1a" strokeWidth={2} opacity={0.35} />
      </g>
    ),
  };

  const fallback = (
    <g>
      <circle cx={50} cy={30} r={18} fill={color} />
      <ellipse cx={50} cy={32} rx={5} ry={5} fill="#0a0a1a" />
      <path d="M 30 52 L 24 90 L 76 90 L 70 52 Z" fill={color} opacity={0.78} />
    </g>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {shapes[characterId] ?? fallback}
    </svg>
  );
}
