import type { TFunction } from 'i18next';
import type { Role } from '../aboutRolesData';

interface AboutRolesBranchListProps {
  roles: Role[];
  activeRoleId: string;
  onSelectRole: (roleId: string) => void;
  t: TFunction;
}

export const AboutRolesBranchList: React.FC<Readonly<AboutRolesBranchListProps>> = ({
  roles,
  activeRoleId,
  onSelectRole,
  t,
}) => {
  return (
    <div
      role="tablist"
      aria-label={t('about.roles.branches_list', 'Ramas de progresión')}
      className="my-auto flex flex-col gap-3 lg:col-span-3"
    >
      {roles.map((role) => {
        const isActive = role.id === activeRoleId;
        return (
          <button
            type="button"
            key={role.id}
            id={`role-tab-${role.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`role-panel-${role.id}`}
            onClick={() => onSelectRole(role.id)}
            className={`group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border p-4 text-left backdrop-blur-md transition-colors duration-300 ${
              isActive
                ? 'border-white/20 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                : 'bg-white/3 border-white/5 hover:border-white/15 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <div
                className="pointer-events-none absolute -inset-10 rounded-full opacity-25 blur-xl"
                style={{
                  background: `radial-gradient(circle, ${role.colorHex} 0%, transparent 70%)`,
                }}
              />
            )}

            <div className="relative z-10 flex items-center gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border p-2 shadow-md transition-colors duration-300"
                style={{
                  borderColor: isActive ? `${role.colorHex}80` : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? `${role.colorHex}25` : 'rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={role.iconUrl}
                  alt={role.title}
                  className="size-7 object-contain drop-shadow-md"
                />
              </div>

              <div>
                <h3 className="text-sm font-black tracking-tight text-white transition-colors group-hover:text-white">
                  {t(`about.roles.branch.${role.id}.title`, role.title)}
                </h3>
                <p className="text-xs font-medium text-gray-400">
                  {t(`about.roles.branch.${role.id}.subtitle`, role.subtitle)}
                </p>
              </div>
            </div>

            <div
              className={`size-3 shrink-0 rounded-full border transition-colors ${
                isActive ? 'scale-110 shadow-sm' : 'border-white/20 bg-transparent opacity-30'
              }`}
              style={{
                backgroundColor: isActive ? role.colorHex : 'transparent',
                borderColor: isActive ? role.colorHex : 'transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
