export const getTheme = (id) => (id % 2 === 1 ? 'purple' : 'green');
export const themeColors = {
  purple: { base: '#EAE5FF', accent: '#A992FF', text: '#7356D2', pill: '#F3F0FF', pillText: '#9A8CFF' },
  green: { base: '#E6F5EC', accent: '#A7E4B3', text: '#31704D', pill: '#E9F9F0', pillText: '#6DCC95' },
};

const iconMap = {
  'Play Style': { Aggressive: 'flame', Defensive: 'shield' },
  'Skill Level': 'chart-line',
  'Preferred Hand': 'hand-paper',
  'Favorite Brands': 'heart',
};

const InfoBlock = ({ label, value, theme }) => {
  const themeData = themeColors[theme];
  let iconName = label === 'Play Style' ? (iconMap[label][value] || 'question') : iconMap[label];
  const icons = {
    flame: <path d="M5 10a1 1 0 112 0A5 5 0 0017 10v4.74a3 3 0 11-4.01-.22l2 2a1 1 0 011.02.23A5 5 0 0019 10a5.13 5.13 0 00-.04-.6 1 1 0 111.96-.3c.05.3.08.6.08.9a7 7 0 11-14 0zm10.7 7a1 1 0 010 1.4L11.4 22.7a1 1 0 11-1.4-1.4l4.3-4.3a1 1 0 011.4 0z" />,
    shield: <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8v1.3a7.96 7.96 0 001.91 5.15A1 1 0 005.15 17h9.7a1 1 0 001.24-.55A7.96 7.96 0 0018 11.3V10a8 8 0 00-8-8zM6.6 6.6a1 1 0 010 1.4 3 3 0 000 4 1 1 0 11-1.4 1.4 5 5 0 010-6.8 1 1 0 011.4 0zm8.2 0a1 1 0 010-1.4 5 5 0 010 6.8 1 1 0 11-1.4-1.4 3 3 0 000-4 1 1 0 011.4 0z" clipRule="evenodd" />,
    'chart-line': <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1v-7zm6-4a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />,
    'hand-paper': <path d="M10 2a1 1 0 00-1 1v7a1 1 0 01-2 0V3a1 1 0 00-2 0v7a1 1 0 01-2 0V5a1 1 0 00-2 0v9a6 6 0 006 6h1a7 7 0 007-7V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v4h1a1 1 0 001 1v7a1 1 0 01-2 0v-7a1 1 0 00-1-1h-2a1 1 0 00-1 1v7a1 1 0 01-2 0V5a1 1 0 00-2 0" />,
    heart: <path d="M10 18a.7.7 0 01-.5-.2 8.3 8.3 0 01-5.6-7c-.1-.5-.1-.9-.1-1.3A4.5 4.5 0 018.3 5h3.4a4.5 4.5 0 014.5 4.5 4.5 4.5 0 01-1.3 3.2 1 1 0 01-1.4 0c-.4-.4-.4-1.1 0-1.5.7-.7.9-1.3.9-2a2.5 2.5 0 00-2.5-2.5H8.3A2.5 2.5 0 005.8 9.5a7.8 7.8 0 004.3 6h-.3a1 1 0 01.5.2 8.3 8.3 0 015.6 7c.1.5.1.9.1 1.3 0 1.2-.5 2.4-1.3 3.2-.4.4-1.1.4-1.5 0" />
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${themeData.base}` }}>
      <svg viewBox="0 0 20 20" style={{ width: '24px', height: '24px', color: themeData.text }}>{icons[iconName]}</svg>
      <div>
        <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{label}</div>
        {label === 'Favorite Brands' ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {value.map(brand => (<span key={brand} style={{ backgroundColor: themeData.pill, color: themeData.pillText, fontSize: '12px', padding: '4px 10px', borderRadius: '16px' }}>{brand}</span>))}
          </div>
        ) : (<div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value}</div>)}
      </div>
    </div>
  );
};
export default InfoBlock;