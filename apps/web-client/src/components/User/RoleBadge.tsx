interface RoleBadgeProps {
  role?: string;
  username?: string;
}

const ROLE_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  staff: { src: '/ranks/staff.png', alt: 'STAFF' },
  admin: { src: '/ranks/admin.png', alt: 'ADMIN' },
  helper: { src: '/ranks/helper.png', alt: 'HELPER' },
  donador: { src: '/ranks/donador.png', alt: 'DONADOR' },
  developer: { src: '/ranks/developer.png', alt: 'DEVELOPER' },
};

function getOwnerBadge(u: string) {
  if (u.includes('killu')) {
    return <img src="/ranks/rank-killu.png" alt="KILLU" style={{ verticalAlign: 'middle' }} />;
  }
  if (u.includes('ultraxn') || u.includes('neroferno')) {
    return (
      <img src="/ranks/rank-neroferno.png" alt="NEROFERNO" style={{ verticalAlign: 'middle' }} />
    );
  }
  return (
    <span
      style={{
        background: '#FFD700',
        color: '#000',
        padding: '2px 6px',
        fontWeight: 'bold',
        borderRadius: '4px',
        fontSize: '0.7rem',
      }}
    >
      OWNER
    </span>
  );
}

export default function RoleBadge({ role, username }: Readonly<RoleBadgeProps>) {
  if (!role && !username) return null;

  const u = username?.toLowerCase() ?? '';
  if (u.includes('killu') || u.includes('ultraxn') || u.includes('neroferno')) {
    return getOwnerBadge(u);
  }

  const r = role?.toLowerCase() ?? '';
  const badge = ROLE_IMAGE_MAP[r] ?? { src: '/ranks/user.png', alt: 'USUARIO' };
  return <img src={badge.src} alt={badge.alt} style={{ verticalAlign: 'middle' }} />;
}
