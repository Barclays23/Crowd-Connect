
type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  accent?: string;
  isMultiline?: boolean;
};



const DetailItem = ({ label, value, accent = '', isMultiline = false }: DetailItemProps) => (
  <div>
    <dt className="text-sm font-medium text-(--text-secondary) mb-1.5">
      {label}
    </dt>
    {isMultiline ? (
      <dd className="text-(--text-primary) leading-relaxed whitespace-pre-wrap">
        {value || '—'}
      </dd>
    ) : (
      <dd className={`font-medium ${accent || 'text-(--text-primary)'}`}>
        {value || '—'}
      </dd>
    )}
  </div>
);
export default DetailItem;