import { Link } from 'react-router';
import RoleBadge from '../User/RoleBadge';
import { slugify } from '../../utils/slugify';
import { RANK_IMAGES, type Thread } from '../../types/forum';

interface ForumAuthorHeaderProps {
  readonly thread: Thread;
}

function getAuthorAvatar(thread: Thread): string {
  const metadata = thread.author_data_fresh;
  const pref = metadata?.avatar_preference ?? 'minecraft';
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === 'minecraft' && Boolean(mcNick);

  if (useMinecraft && mcNick) {
    return `https://mc-heads.net/avatar/${mcNick}/128`;
  }
  return (
    metadata?.social_avatar_url ??
    metadata?.avatar_url ??
    thread.author_avatar ??
    `https://ui-avatars.com/api/?name=${thread.author}`
  );
}

function getAuthorDisplayName(thread: Thread): string {
  const metadata = thread.author_data_fresh;
  const pref = metadata?.avatar_preference ?? 'minecraft';
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === 'minecraft' && Boolean(mcNick);

  if (useMinecraft && mcNick) {
    return mcNick;
  }
  return metadata?.full_name ?? metadata?.username ?? thread.author;
}

function getAuthorRoleInfo(thread: Thread): { roleRaw: string; roleImage: string } {
  const roleRaw = (thread.author_data_fresh?.role ?? thread.author_role ?? 'user').toLowerCase();
  const roleImage =
    RANK_IMAGES[roleRaw] || (roleRaw.includes('donador') ? RANK_IMAGES.donador : RANK_IMAGES.user);
  return { roleRaw, roleImage };
}

export default function ForumAuthorHeader({ thread }: Readonly<ForumAuthorHeaderProps>) {
  const metadata = thread.author_data_fresh;
  const mcNick = metadata?.minecraft_nick;
  const discordTag = metadata?.social_discord ?? metadata?.discord_tag;
  const statusMessage = metadata?.status_message;

  const displayAvatar = getAuthorAvatar(thread);
  const displayName = getAuthorDisplayName(thread);
  const { roleRaw, roleImage } = getAuthorRoleInfo(thread);

  return (
    <div className="group/author relative flex items-center gap-4 p-2">
      <div className="flex cursor-pointer items-center gap-4">
        <div className="size-14 overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg transition-transform group-hover/author:scale-105">
          <img src={displayAvatar} alt={displayName} className="size-full object-cover" />
        </div>
        <div className="flex flex-col text-left">
          <Link
            to={`/u/${slugify(thread.author)}`}
            className="hover:text-(--accent) font-bold leading-tight text-white transition-colors"
          >
            {displayName}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <RoleBadge role={thread.author_role} username={thread.author} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              • {thread.date}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a]/98 pointer-events-none absolute bottom-full left-0 z-50 mb-4 w-72 translate-y-2 rounded-2xl border border-white/10 p-5 text-left opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-colors duration-200 group-hover/author:translate-y-0 group-hover/author:opacity-100">
        <div className="mb-4 flex items-center gap-4 border-b border-white/5 pb-4">
          <img
            src={displayAvatar}
            className="size-12 rounded-xl border border-white/10 shadow-inner"
            alt="Avatar"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm/tight font-bold text-white">{displayName}</p>
            {statusMessage && (
              <p className="mt-0.5 line-clamp-2 text-[10px] italic leading-relaxed text-gray-400">
                "{statusMessage}"
              </p>
            )}
            <div className="mt-2">
              <img src={roleImage} alt={roleRaw} className="h-4 object-contain object-left" />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-400">
          {mcNick && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Minecraft
              </span>
              <span className="font-mono text-white">{mcNick}</span>
            </div>
          )}
          {discordTag && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Discord
              </span>
              <span className="text-indigo-300">{discordTag}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Rol</span>
            <span className="capitalize text-white">{roleRaw}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
