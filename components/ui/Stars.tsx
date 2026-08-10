export default function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-[1px]">
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <span key={i} className={i <= Math.round(rating) ? "text-gold" : "text-dim"}>
          ★
        </span>
      ))}
    </span>
  );
}
