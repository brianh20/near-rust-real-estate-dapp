import './style.css';
import React from 'react';
import Item from '../item';

const PropertyList = ({ data, showInvest, rollback, rent, pay, distribute, finalize }) => {
  return (
    <div id="list">
      {data && data.map && data.map((property, dix) => {
        return (
          <Item
            item={property}
            key={`property-${dix}`}
            showInvest={showInvest}
            rollback={rollback}
            rent={rent}
            pay={pay}
            distribute={distribute}
            finalize={finalize}
          />
        )
      })}
    </div>
  );
}

export default PropertyList;