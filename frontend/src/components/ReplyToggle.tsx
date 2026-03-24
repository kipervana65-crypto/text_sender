type ReplyToggleProps = {
  isExpanded: boolean;
  repliesCount: number;
  onToggle: () => void;
};

const getRepliesLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ответ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ответа`;
  return `${count} ответов`;
};

export const ReplyToggle = ({ isExpanded, repliesCount, onToggle }: ReplyToggleProps) => (
  <button
    type="button"
    className="inline-flex items-center gap-1 text-sm text-blue-600 transition hover:text-blue-700"
    onClick={onToggle}
  >
    {isExpanded ? 'Скрыть ответы' : `Посмотреть ${getRepliesLabel(repliesCount)}`}
    <span className={`inline-block text-xs transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} aria-hidden>
      ⌄
    </span>
  </button>
);
