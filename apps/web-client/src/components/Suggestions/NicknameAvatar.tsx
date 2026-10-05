import { DEFAULT_AVATAR } from './constants';

export default function NicknameAvatar({ nickname }: Readonly<{ nickname?: string }>) {
  if (!nickname || nickname.length < 3) {
    return <div className="text-lg font-black text-white/25">?</div>;
  }

  return (
    <img
      src={`https://mc-heads.net/avatar/${nickname}/64`}
      alt={nickname}
      className="size-10 object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
      }}
    />
  );
}
