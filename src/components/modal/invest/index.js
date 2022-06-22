import '../style.css';
import './style.css';
import React, { useState } from 'react';

const InvestModal = ({ data, cancel, invest }) => {
  const [investment, setInvestment] = useState(0.00001);
  const [error, setError] = useState('');

  const preventPropagation = (e) => { e.stopPropagation() };
  const handleChange = e => {
    setInvestment(e.target.value);
    if (e.target.value > data.fundingAvailable) {
      setError("Funding higher than available");
    }
  }

  const handleSubmit = () => {
    if (investment <= data.fundingAvailable) {
      invest(data.id, investment)
    }
  }

  return (
    <div id="modal" onClick={cancel}>
      <div id="container" onClick={preventPropagation}>
        <h1>Invest</h1>
        <div className="field">
          <input type="number" min="0" max={data.fundingAvailable} step="0.00001" value={investment} onChange={handleChange} />
          <span>Ⓝ</span>
        </div>

        <div id="max">Max: {data.fundingAvailable}</div>

        <div id="error">{error}</div>

        <div className="actions">
          <div className="invest" onClick={() => handleSubmit(data.id)}>
            INVEST
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestModal;