const PlayerAvatar = ({ id }) => (
  <svg viewBox="0 0 100 100" style={{ display: 'block' }}>
    <circle cx="50" cy="50" r="50" fill="currentColor" fillOpacity="0.1" />
    <path fill="currentColor" d="M32.5 40a17.5 17.5 0 1 1 35 0 17.5 17.5 0 1 1-35 0zM15 80c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25v5a10 10 0 0 1-10 10H25a10 10 0 0 1-10-10v-5z" />
  </svg>
);
export default PlayerAvatar;