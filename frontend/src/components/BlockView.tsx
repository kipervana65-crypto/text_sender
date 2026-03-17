import { BlockResponse } from '../types/api';

export const BlockView = ({ block }: { block: BlockResponse }) => (
  <section className="mb-4 rounded border bg-white p-4">
    <h1 className="mb-2 text-xl font-semibold">{block.title}</h1>
    <p className="whitespace-pre-wrap text-slate-800">{block.text}</p>
  </section>
);
