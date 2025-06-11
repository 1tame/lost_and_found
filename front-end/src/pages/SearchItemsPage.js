import React, { useState } from 'react';

const SearchItemsPage = () => {
  const [itemType, setItemType] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [claimData, setClaimData] = useState
  ({
    item_name: '',
    item_color: '',
    model: '',
    special_tag_or_symbol: '',
    specific_location: '',
    image: null,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!itemType || !city) return alert('Both fields are required');

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/items/search', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_type: itemType, city }),
      });

      const data = await res.json();
      res.ok ? setResults(data.results) : setError(data.message || 'No items found');
    } catch (err) {
      console.error(err);
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (item_id) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    Object.entries(claimData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      const res = await fetch(`http://localhost:3001/api/claims/${item_id}/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Claim submitted!');
        setActiveClaimId(null);
        setClaimData({
          item_name: '',
          item_color: '',
          model: '',
          special_tag_or_symbol: '',
          specific_location: '',
          image: null,
        });
      } else {
        alert(data.message || 'Claim failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const handleRemoveItem = (id) => {
    setResults(results.filter((item) => item.id !== id));
    if (activeClaimId === id) setActiveClaimId(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Search Found Items</h2>
      <form onSubmit={handleSearch}>
        <input
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
          placeholder="Item Type"
          required
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          required
        />
        <br /><br />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginTop: '15px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            position: 'relative',
          }}
        >
          {/* ❌ Close icon to remove this result card */}
          <span
            onClick={() => handleRemoveItem(item.id)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#999',
            }}
            title="Remove this result"
          >
            ❌
          </span>

          <p><strong>Item Type:</strong> {item.item_type}</p>
          <p><strong>City:</strong> {item.city}</p>
          <p><strong>Status:</strong> {item.status}</p>

          <button onClick={() => setActiveClaimId(item.id)}>Claim</button>

          {activeClaimId === item.id && (
            <div style={{ marginTop: '10px', backgroundColor: '#fff', padding: '10px', position: 'relative' }}>
              {/* ❌ Close icon to cancel claim form */}
              <span
                onClick={() => setActiveClaimId(null)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '10px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#999',
                }}
                title="Close claim form"
              >
                ❌
              </span>

              <h4>Submit Claim</h4>
              <input
                placeholder="Item Name *"
                value={claimData.item_name}
                onChange={(e) => setClaimData({ ...claimData, item_name: e.target.value })}
                required
              /><br />
              <input
                placeholder="Item Color *"
                value={claimData.item_color}
                onChange={(e) => setClaimData({ ...claimData, item_color: e.target.value })}
                required
              /><br />
              <input
                placeholder="Model (optional)"
                value={claimData.model}
                onChange={(e) => setClaimData({ ...claimData, model: e.target.value })}
              /><br />
              <input
                placeholder="Special Tag or Symbol"
                value={claimData.special_tag_or_symbol}
                onChange={(e) => setClaimData({ ...claimData, special_tag_or_symbol: e.target.value })}
              /><br />
              <input
                placeholder="Specific Location"
                value={claimData.specific_location}
                onChange={(e) => setClaimData({ ...claimData, specific_location: e.target.value })}
              /><br />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setClaimData({ ...claimData, image: e.target.files[0] })}
              /><br /><br />
              <button onClick={() => handleClaimSubmit(item.id)}>Submit Claim</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchItemsPage;
