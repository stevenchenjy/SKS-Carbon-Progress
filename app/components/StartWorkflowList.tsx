interface StartWorkflowListProps {
  steps: readonly string[];
}

export function StartWorkflowList({ steps }: StartWorkflowListProps) {
  const usesFiveStageLayout = steps.length === 5;

  return (
    <ol className={usesFiveStageLayout ? 'workflow-list' : 'workflow-variable-list'}>
      {steps.map((step, index) => (
        <li className={usesFiveStageLayout ? 'workflow-step' : 'workflow-variable-step'} key={`${index}-${step}`}>
          <span className="workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}
