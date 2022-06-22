import '../style.css';
import './style.css';
import React, { useState } from 'react';

const NewModal = ({ cancel, create }) => {
  const [title, setTitle] = useState('');
  const [photo, setPhoto] = useState('');
  const [price, setPrice] = useState(0.00001);
  const [rent, setRent] = useState(0.00001);
  const handlers = {
    title: setTitle,
    photo: setPhoto,
    price: setPrice,
    rent: setRent
  };
  const [error, setError] = useState('');

  const preventPropagation = (e) => { e.stopPropagation() };

  const handleChange = (e) => {
    handlers[e.target.name](e.target.value);
  }

  const addProperty = async () => {
    const nearPrice = Math.round(price * 100000);
    const nearRent = Math.round(rent * 100000);
    if (title && photo && nearPrice && !isNaN(nearPrice) && nearRent && !isNaN(nearRent)) {
      setError("");
      create({ title, photo, price: nearPrice, rent: nearRent })
    } else {
      setError("At least one of the fields is incorrect");
    }
  }

  return (
    <div id="modal" onClick={cancel}>
      <div id="container" onClick={preventPropagation}>
        <h1>New property</h1>
        <div className="fieldContainer">
          <div className="field">
            <span className="fieldTitle">Title</span>
            <input type="text" name="title" onChange={handleChange} />
            <span className="spacer"></span>
          </div>
          <div className="field">
            <span className="fieldTitle">Photo</span>
            <input type="text" name="photo" onChange={handleChange} />
            <span className="spacer"></span></div>
          <div className="field">
            <span className="fieldTitle">Price</span>
            <input type="number" value={price} min="0" step="0.00001" name="price" onChange={handleChange} />
            <span>Ⓝ</span>
          </div>
          <div className="field">
            <span className="fieldTitle">Rent</span>
            <input type="number" value={rent} min="0" step="0.00001" name="rent" onChange={handleChange} />
            <span>Ⓝ</span>
          </div>
        </div>

        <div id="error">{error}</div>

        <div className="actions">
          <div className="addProperty" onClick={addProperty}>
            ADD PROPERTY
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewModal;