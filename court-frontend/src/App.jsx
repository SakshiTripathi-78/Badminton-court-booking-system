import { useState, useEffect } from 'react';
import PlayerAvatar from './components/PlayerAvatar';
import InfoBlock, { getTheme, themeColors } from './components/InfoBlock';
import SoloBookingView from './components/SoloBookingView';
import MyBookings from './components/MyBookings';

function App() {
  const [acceptedAlerts, setAcceptedAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]); 
  const [needsSetup, setNeedsSetup] = useState(false);
  const [playStyle, setPlayStyle] = useState('Aggressive');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [preferredHand, setPreferredHand] = useState('Right');
  const [brands, setBrands] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [viewMode, setViewMode] = useState('match'); 

  const loadProfiles = () => {
    fetch('http://localhost:3000/profiles')
      .then(res => res.json())
      .then(data => {
        const myProfileExists = data.some(profile => String(profile.user_id) === String(currentUser.id));
        if (!myProfileExists) setNeedsSetup(true);
        else {
          setNeedsSetup(false);
          const opponents = data.filter(profile => String(profile.user_id) !== String(currentUser.id));
          setProfiles(opponents);
          setCurrentIndex(0);
        }
      })
      .catch(err => console.error("Error fetching live profiles:", err));
  };

  const loadNotifications = () => {
    fetch(`http://localhost:3000/challenges/pending/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error("Error fetching notifications:", err));
  };

  const loadUpcomingMatches = () => {
    fetch(`http://localhost:3000/matches/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setUpcomingMatches(data))
      .catch(err => console.error("Error fetching upcoming matches:", err));
  };

  const loadAcceptedAlerts = () => {
    fetch(`http://localhost:3000/challenges/accepted/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setAcceptedAlerts(data))
      .catch(err => console.error("Error fetching accepted alerts:", err));
  };

  useEffect(() => {
    if (currentUser) {
      loadProfiles();
      loadNotifications(); 
      loadUpcomingMatches(); 
      loadAcceptedAlerts();
    }
  }, [currentUser]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = isLoginView ? 'http://localhost:3000/login' : 'http://localhost:3000/register';
    const payload = isLoginView ? { email, password } : { name, email, password };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      setCurrentUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const brandArray = brands.split(',').map(b => b.trim()).filter(b => b !== '');
    try {
      const response = await fetch('http://localhost:3000/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, play_style: playStyle, skill_level: skillLevel, preferred_hand: preferredHand, favorite_brands: brandArray }),
      });
      if (!response.ok) throw new Error("Failed to save profile");
      alert("✅ Profile completed! Let's find some matches.");
      loadProfiles();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleChallenge = async (opponentId) => {
    if (!selectedDate || !selectedTime) {
      alert("⚠️ Please select a date and time for the match!");
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenger_id: currentUser.id, opponent_id: opponentId, match_date: selectedDate, match_time: selectedTime }),
      });
      const data = await response.json();
      if (!response.ok) { alert(`❌ ${data.error}`); return; }
      alert(`✅ ${data.message}`);
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      alert("❌ Something went wrong while sending the challenge.");
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const response = await fetch(`http://localhost:3000/challenge/${challengeId}/accept`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert(`✅ ${data.message}`);
      loadNotifications(); 
      loadUpcomingMatches(); 
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:3000/challenge/${selectedMatchId}/pay`, { method: 'PUT' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setIsPaymentModalOpen(false);
        setIsProcessingPayment(false);
        loadUpcomingMatches(); 
      } catch (err) {
        alert(`❌ ${err.message}`);
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  const getProfileFields = (profile) => {
    const fields = [{ label: 'Play Style', value: profile.play_style }];
    if (profile.skill_level) fields.push({ label: 'Skill Level', value: profile.skill_level });
    if (profile.preferred_hand) fields.push({ label: 'Preferred Hand', value: profile.preferred_hand });
    if (profile.favorite_brands && profile.favorite_brands.length > 0) fields.push({ label: 'Favorite Brands', value: profile.favorite_brands });
    return fields;
  };

  if (!currentUser) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #e6fae8 0%, #eef0ff 50%, #f9eaff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '50px 40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏸</div>
          <div style={{ fontSize: '10px', color: '#7868E6', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px' }}>Court Booking</div>
          <h2 style={{ margin: '0 0 8px 0', fontFamily: 'Georgia, serif', fontSize: '26px', color: '#111' }}>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ margin: '0 0 30px 0', fontSize: '13px', color: '#666' }}>{isLoginView ? 'Sign in to reserve your court' : 'Sign up to start booking courts'}</p>
          <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
            {authError && <div style={{ color: 'red', fontSize: '13px', marginBottom: '15px' }}>{authError}</div>}
            {!isLoginView && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>Full Name</label>
                <input style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #EAE5FF', backgroundColor: '#FCFBFF', fontSize: '14px', boxSizing: 'border-box' }} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>Email address</label>
              <input style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #EAE5FF', backgroundColor: '#FCFBFF', fontSize: '14px', boxSizing: 'border-box' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>Password</label>
              <input style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #EAE5FF', backgroundColor: '#FCFBFF', fontSize: '14px', boxSizing: 'border-box' }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#7868E6', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', marginBottom: '20px' }}>{isLoginView ? 'Log In' : 'Register'}</button>
            <div style={{ fontSize: '13px', color: '#666', textAlign: 'center' }}>
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <span style={{ color: '#7868E6', cursor: 'pointer', fontWeight: '500' }} onClick={() => setIsLoginView(!isLoginView)}>{isLoginView ? 'Register' : 'Log In'}</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: '#fbfbff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #EAE5FF', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', width: '100%', maxWidth: '450px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#111' }}>Complete Your Profile</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666' }}>Let others know your play style before matchmaking!</p>
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Play Style</label>
              <select value={playStyle} onChange={(e) => setPlayStyle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="Aggressive">Aggressive</option>
                <option value="Defensive">Defensive</option>
                <option value="Balanced">Balanced</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Skill Level</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Preferred Hand</label>
              <select value={preferredHand} onChange={(e) => setPreferredHand(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="Right">Right Handed</option>
                <option value="Left">Left Handed</option>
                <option value="Ambidextrous">Ambidextrous</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Favorite Brands (Comma separated)</label>
              <input type="text" placeholder="e.g. Yonex, Victor, Li-Ning" value={brands} onChange={(e) => setBrands(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#31704D', color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Save Profile & Start Matchmaking</button>
          </form>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <>
      <style>{`body::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 10% 10%, #E8E5FF40 0%, transparent 40%), radial-gradient(circle at 90% 90%, #A7E4B340 0%, transparent 40%); z-index: -1; }`}</style>
      
      {isPaymentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Secure Checkout</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={handleProcessPayment}>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Card Number</label><input type="text" placeholder="0000 0000 0000 0000" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Expiry</label><input type="text" placeholder="MM/YY" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>CVC</label><input type="text" placeholder="123" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
              </div>
              <button type="submit" disabled={isProcessingPayment} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: isProcessingPayment ? '#999' : '#31704D', color: '#fff', fontWeight: 'bold', cursor: isProcessingPayment ? 'not-allowed' : 'pointer' }}>{isProcessingPayment ? 'Processing...' : 'Pay $15.00'}</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 20px', fontFamily: 'Inter, sans-serif', background: 'linear-gradient(to bottom right, #fbfbff 0%, #f7f9fd 100%), radial-gradient(circle at top left, #ddd 1px, transparent 1px) 0 0/20px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 20px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '24px' }}>🏸</span><h2 style={{ margin: 0, color: '#333', fontSize: '18px' }}>Court Booking</h2></div>
          <button onClick={() => setCurrentUser(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #f0f0f0', backgroundColor: '#fafafa', color: '#333', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </header>

        {/* VIEW TOGGLE */}
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', backgroundColor: '#fff', borderRadius: '12px', padding: '4px', marginBottom: '30px', border: '1px solid #f0f0f0' }}>
            <button onClick={() => setViewMode('match')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: viewMode === 'match' ? '#7868E6' : 'transparent', color: viewMode === 'match' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>🎾 Find a Match</button>
            <button onClick={() => setViewMode('book')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: viewMode === 'book' ? '#31704D' : 'transparent', color: viewMode === 'book' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>🏟️ Book a Court</button>
            <button onClick={() => setViewMode('mybookings')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: viewMode === 'mybookings' ? '#31704D' : 'transparent', color: viewMode === 'mybookings' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>📅 My Bookings</button>
        </div>

        {viewMode === 'match' ? (
          <>
            {notifications.length > 0 && (
              <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#EAE5FF', border: '1px solid #A992FF', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#7356D2' }}>🔔 Pending Match Requests ({notifications.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map(notif => (
                      <div key={notif.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #F3F0FF' }}>
                      <span style={{ fontSize: '15px', color: '#333' }}><strong>{notif.challenger_name}</strong> challenged you!</span>
                      <button onClick={() => handleAcceptChallenge(notif.id)} style={{ backgroundColor: '#7868E6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Accept Match</button>
                      </div>
                  ))}
                  </div>
              </div>
            )}

            {acceptedAlerts.length > 0 && (
              <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#E6F5EC', border: '1px solid #A7E4B3', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#31704D' }}>✅ Match Accepted!</h3>
                {acceptedAlerts.map(alert => (
                  <div key={alert.id} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                    {alert.opponent_name} accepted your challenge! Time to coordinate.
                  </div>
                ))}
              </div>
            )}

            {upcomingMatches.length > 0 && (
              <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#E6F5EC', border: '1px solid #A7E4B3', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#31704D' }}>🎾 Upcoming Matches ({upcomingMatches.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingMatches.map(match => {
                      const opponentName = match.challenger_name === currentUser.name ? match.opponent_name : match.challenger_name;
                      return (
                      <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #E9F9F0' }}>
                          <span style={{ fontSize: '15px', color: '#333' }}>Match against <strong>{opponentName}</strong></span>
                          {match.status === 'paid' ? (
                          <span style={{ backgroundColor: '#E9F9F0', color: '#31704D', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>✅ Court Booked!</span>
                          ) : (
                          <button onClick={() => { setSelectedMatchId(match.id); setIsPaymentModalOpen(true); }} style={{ backgroundColor: '#31704D', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Pay & Book Court</button>
                          )}
                      </div>
                      );
                  })}
                  </div>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#333', margin: '0 0 10px 0' }}><h1 style={{ fontSize: '32px', margin: '0' }}>Matchmaking Feed</h1></div>
            <div style={{ height: '4px', width: '60px', background: 'linear-gradient(to right, #9A8CFF 0%, #A7E4B3 100%)', borderRadius: '4px', margin: '0 0 50px 0' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {profiles.length === 0 ? <p style={{ color: '#666' }}>No opponents available.</p> : (
                <>
                {(() => {
                    const theme = getTheme(currentProfile.user_id);
                    const themeData = themeColors[theme];
                    return (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', width: '325px', boxShadow: '0 12px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '30px 20px', borderRadius: '16px 16px 0 0', marginBottom: '20px', backgroundColor: themeData.base, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', color: themeData.text, marginBottom: '10px' }}><PlayerAvatar id={currentProfile.user_id} /></div>
                        <h3 style={{ fontSize: '20px', color: themeData.text, margin: '0' }}>{currentProfile.name}</h3>
                        </div>
                        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getProfileFields(currentProfile).map(field => <InfoBlock key={field.label} label={field.label} value={field.value} theme={theme} />)}
                        </div>
                        <div style={{ padding: '10px 20px', display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>DATE</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>TIME</label><input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                        </div>
                        <div style={{ padding: '20px' }}><button onClick={() => handleChallenge(currentProfile.user_id)} style={{ width: '100%', padding: '12px', backgroundColor: themeData.text, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Challenge to Match</button></div>
                    </div>
                    );
                })()}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', marginBottom: '40px' }}>
                    <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontWeight: 'bold', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>← Previous</button>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#555' }}>{currentIndex + 1} / {profiles.length}</span>
                    <button onClick={() => setCurrentIndex(prev => Math.min(profiles.length - 1, prev + 1))} disabled={currentIndex === profiles.length - 1} style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontWeight: 'bold', cursor: currentIndex === profiles.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>Next →</button>
                </div>
                </>
            )}
            </div>
          </>
        ) : viewMode === 'book' ? (
          <SoloBookingView currentUser={currentUser} />
        ) : (
          <MyBookings currentUser={currentUser} />
        )}
      </div>
    </>
  );
}

export default App;