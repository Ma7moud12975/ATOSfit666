import React from 'react';
import Icon from './AppIcon';

const CoachPulse = ({ title = 'ATOS Coach', note, actionLabel, tone = 'steady', compact = false, className = '', onClick }) => {
  if (!note) return null;

  return (
    <div
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      className={`coach-pulse coach-pulse-${tone} ${compact ? 'coach-pulse-compact' : ''} ${className}`}
    >
      <div className="coach-pulse-avatar" aria-hidden="true">
        <Icon name="Sparkles" size={17} />
      </div>
      <div className="coach-pulse-copy">
        <span>{title}</span>
        <p>{note}</p>
      </div>
      {actionLabel && <div className="coach-pulse-action">{actionLabel}</div>}
    </div>
  );
};

export default CoachPulse;
