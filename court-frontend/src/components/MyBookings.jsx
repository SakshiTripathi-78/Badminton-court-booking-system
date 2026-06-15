import { useState, useEffect } from 'react';

const MyBookings = ({ currentUser }) => {
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    // Fetch both types of bookings
    fetch(`http://localhost:3000/my-bookings/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setMyBookings(data))
      .catch(err => console.error("Error fetching bookings:", err));
  }, [currentUser.id]);

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <h2 style={{ color: '#333' }}>My Court Bookings</h2>
      {myBookings.length === 0 ? (
        <p>No bookings found yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {myBookings.map(booking => (
            <div key={booking.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{booking.court_name}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{booking.booking_date} at {booking.booking_time}</div>
              </div>
              <span style={{ backgroundColor: '#E6F5EC', color: '#31704D', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Confirmed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyBookings;