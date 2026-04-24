/**
 * StatCard Component
 * Reusable dashboard metric card with icon and glassmorphism styling
 */
const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'from-primary-500/15 to-primary-600/5 border-primary-500/15 text-primary-400',
    success: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/15 text-emerald-400',
    warning: 'from-amber-500/15 to-amber-600/5 border-amber-500/15 text-amber-400',
    danger: 'from-red-500/15 to-red-600/5 border-red-500/15 text-red-400',
    info: 'from-blue-500/15 to-blue-600/5 border-blue-500/15 text-blue-400',
  };

  const iconBgMap = {
    primary: 'bg-primary-500/15 text-primary-400',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
    info: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} border p-5`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 truncate">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBgMap[color]} flex items-center justify-center flex-shrink-0 ml-3`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
