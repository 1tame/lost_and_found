import React, { useState } from 'react';
import '../AddItemPage.css'; // Import the CSS file

const AddItemPage = () => {
  const [item_type, setItemType] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item_type || !city || !status) {
      alert('Item type, city, and status are required');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      let response;

      if (status === 'Lost') {
        const formData = new FormData();
        formData.append('item_type', item_type);
        formData.append('city', city);
        formData.append('status', status);
        formData.append('description', description);
        if (image) formData.append('image', image);

        response = await fetch('http://localhost:3001/api/items/add', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch('http://localhost:3001/api/items/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ item_type, city, status }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        alert('Item added successfully!');
        setItemType('');
        setCity('');
        setStatus('');
        setDescription('');
        setImage(null);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="add-item-container">
      <h2 className="add-item-title">Add Lost or Found Item</h2>

      <form onSubmit={handleSubmit} className="add-item-form">
        <div>
          <label>Item Type:</label>
          <input
            type="text"
            value={item_type}
            onChange={(e) => setItemType(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            required
          >
            <option value="">--Select--</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        {status === 'Lost' && (
          <>
            <div>
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="form-input"
                required
              ></textarea>
            </div>

            <div>
              <label>Upload Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="file-input"
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-button">Submit Item</button>
      </form>
    </div>
  );
};

export default AddItemPage;
