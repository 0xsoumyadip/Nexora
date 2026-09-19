export default function Loading() {
  return <div className="app-content" aria-label="Loading documents"><div className="skeleton title-skeleton" /><div className="skeleton toolbar-skeleton" /><div className="skeleton-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton card-skeleton" key={index} />)}</div></div>;
}
