export const Loader = ({ text = 'Загрузка...' }: { text?: string }) => (
  <div className="flex items-center justify-center py-10 text-slate-600">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
    <span className="ml-3">{text}</span>
  </div>
);
