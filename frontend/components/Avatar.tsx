export const AVATAR_COUNT = 8;

interface AvatarProps {
  seed: number;
  className?: string;
}

/** Deterministic seed -> avatar face, so the same seed always renders the same avatar. */
export default function Avatar({ seed, className }: AvatarProps) {
  const index = ((seed % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT;
  const Face = FACES[index];

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="49" fill="#fffcfc" stroke="#000000" strokeWidth="2" />
      <Face />
    </svg>
  );
}

function Eyes({ y = 46 }: { y?: number }) {
  return (
    <>
      <circle cx="38" cy={y} r="2.6" fill="#000000" />
      <circle cx="62" cy={y} r="2.6" fill="#000000" />
    </>
  );
}

function Smile() {
  return <path d="M38 62 Q50 71 62 62" fill="none" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" />;
}

// 1. Short side-part hair, neutral smile
function Face0() {
  return (
    <>
      <path d="M22 46c0-18 12-30 28-30s28 12 28 30" fill="none" stroke="#000" strokeWidth="2.4" />
      <path d="M20 44c4-14 12-4 12-4M80 44c-4-14-12-4-12-4" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
      <Eyes />
      <Smile />
    </>
  );
}

// 2. Long bob hair, round surprised eyes
function Face1() {
  return (
    <>
      <path d="M20 48c0-18 13-31 30-31s30 13 30 31" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 44v22c0 2.5 5 2.5 5 0V50" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80 44v22c0 2.5-5 2.5-5 0V50" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="48" r="3.2" fill="none" stroke="#000" strokeWidth="2" />
      <circle cx="62" cy="48" r="3.2" fill="none" stroke="#000" strokeWidth="2" />
      <Smile />
    </>
  );
}

// 3. Bald, round glasses
function Face2() {
  return (
    <>
      <path d="M23 44c0-16 11-27 27-27s27 11 27 27" fill="none" stroke="#000" strokeWidth="2.4" />
      <circle cx="38" cy="47" r="8" fill="none" stroke="#000" strokeWidth="2.2" />
      <circle cx="62" cy="47" r="8" fill="none" stroke="#000" strokeWidth="2.2" />
      <path d="M46 47h8M30 44l-6-2M70 44l6-2" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <Smile />
    </>
  );
}

// 4. Curly hair (scalloped top)
function Face3() {
  return (
    <>
      <path
        d="M20 46c-3-4-3-10 2-13-2-5 1-10 6-10-1-5 4-9 9-7 2-5 9-6 12-1 5-3 11 1 10 6 5 0 8 6 5 10 4 3 4 9 1 13"
        fill="none"
        stroke="#000"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <Eyes />
      <Smile />
    </>
  );
}

// 5. Side part + closed happy eyes
function Face4() {
  return (
    <>
      <path d="M21 45c0-17 12-29 29-29 15 0 27 11 29 25-6-6-16-9-29-9-11 0-20 5-29 13z" fill="none" stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M34 46q4-4 8 0M56 46q4-4 8 0" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
      <Smile />
    </>
  );
}

// 6. Cap + sunglasses
function Face5() {
  return (
    <>
      <path d="M20 42c0-17 13-28 30-28s30 11 30 28H20z" fill="none" stroke="#000" strokeWidth="2.2" />
      <path d="M18 42h30M18 42c0-3 1-5 3-6" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="30" y="43" width="16" height="9" rx="2" fill="#000" />
      <rect x="54" y="43" width="16" height="9" rx="2" fill="#000" />
      <path d="M46 47h8" stroke="#000" strokeWidth="2" />
      <Smile />
    </>
  );
}

// 7. Ponytail + wink
function Face6() {
  return (
    <>
      <path d="M22 46c0-18 12-30 28-30s28 12 28 30" fill="none" stroke="#000" strokeWidth="2.4" />
      <path d="M78 40c6 1 9 6 7 12-1 4-5 6-9 5" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M34 46q4-4 8 0" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="62" cy="46" r="2.6" fill="#000" />
      <Smile />
    </>
  );
}

// 8. Mohawk + open surprised mouth
function Face7() {
  return (
    <>
      <path d="M41 26l9-14 9 14-9-4z" fill="#000" />
      <path d="M22 46c0-16 12-24 28-24s28 8 28 24" fill="none" stroke="#000" strokeWidth="2.2" />
      <Eyes />
      <ellipse cx="50" cy="65" rx="7" ry="6" fill="#fffcfc" stroke="#000" strokeWidth="2.2" />
    </>
  );
}

const FACES = [Face0, Face1, Face2, Face3, Face4, Face5, Face6, Face7];
