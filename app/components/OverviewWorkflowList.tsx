interface OverviewWorkflowListProps {
  steps: readonly string[];
}

export function OverviewWorkflowList({ steps }: OverviewWorkflowListProps) {
  const usesFiveStageLayout = steps.length === 5;

  return (
    <ol className={usesFiveStageLayout ? 'process-list' : 'process-list process-list-variable'}>
      {steps.map((step, index) => (
        <li key={`${index}-${step}`}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
