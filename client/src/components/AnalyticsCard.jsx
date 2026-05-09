import React from 'react';

const AnalyticsCard = React.memo(({ label, value, icon, trend, color = 'primary' }) => {
  const colorStyles = {
    primary: 'from-primary-500/10 to-primary-600/5 border-primary-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
  };

  const valueColors = {
    primary: 'text-primary-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorStyles[color]} border rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-dark-400 text-sm font-medium">{label}</span>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${valueColors[color]}`}>
          {value}
        </span>
        {trend !== undefined && trend !== null && (
          <span className={`text-xs font-medium mb-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
});

AnalyticsCard.displayName = 'AnalyticsCard';

export default AnalyticsCard;
