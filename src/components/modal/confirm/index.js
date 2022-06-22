import '../style.css';
import './style.css';
import React from 'react';

const ConfirmModal = ({ message, confirm }) => {
  const preventPropagation = (e) => { e.stopPropagation() };

  return (
    <div id="modal" onClick={() => confirm(false)}>
      <div id="container" onClick={preventPropagation}>
        <h1>Confirm</h1>
        <div className="message">
          {message}
        </div>
        <div className="actions">
          <div className="no" onClick={() => confirm(false)}>
            NO
          </div>
          <div className="yes" onClick={() => confirm(true)}>
            YES
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;