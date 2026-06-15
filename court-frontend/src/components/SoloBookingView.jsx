import { useState } from 'react';
const SoloBookingView = ({ currentUser }) => {
  const venues = ["Downtown Sports Arena", "Greenwood Badminton Club", "Whitefield Elite Courts"];
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const handleBook = async (courtName) => {
    if (!date || !time) { alert("Please select date and time"); return; }
    const response = await fetch('http://localhost:3000/book-court', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, court_name: courtName, booking_date: date, booking_time: time }),
    });
    if (response.ok) alert(`✅ Booked ${courtName} successfully!`);
    else alert("❌ Booking failed.");
  };
  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <input type="date" onChange={(e) => setDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <input type="time" onChange={(e) => setTime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
      </div>
      <div style={{ display: 'grid', gap: '15px' }}>
        {venues.map(venue => (
          <div key={venue} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f0f0f0' }}>
            <span style={{ fontWeight: 'bold' }}>{venue}</span>
            <button onClick={() => handleBook(venue)} style={{ backgroundColor: '#31704D', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SoloBookingView;