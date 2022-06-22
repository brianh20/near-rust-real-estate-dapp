
import './style.css';
import React, { useState } from 'react';
import ConfirmModal from '../modal/confirm';

const Item = ({ item, showInvest, rollback, rent, pay, distribute, finalize }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handlers = {
    'showInvest': showInvest,
    'rollback': rollback,
    'rent': rent,
    'pay': pay,
    'distribute': distribute,
    'finalize': finalize
  }
  const confirmModalMessage = {
    'rollback': 'Are you sure you want to rollback this property funding?',
    'rent': 'Are you sure you want to rent this property?',
    'pay': 'Are you sure you want to pay rent?',
    'distribute': 'Are you sure you want to distribute monthly rent?',
    'finalize': 'Are you sure you want to finalize and return deposit?',
  }

  const invest = () => showInvest(item.id);

  const confirm = (confirm) => {
    setPendingAction(null);
    setShowConfirmModal(false);
    if (confirm) {
      handlers[pendingAction](item.id);
    }
  }

  const displayConfirmModal = (pendingAction, actionId) => {
    setPendingAction(pendingAction);
    setShowConfirmModal(true);
  }


  return (
    <div className="property">
      {showConfirmModal && <ConfirmModal message={confirmModalMessage[pendingAction]} confirm={confirm} />}
      <div className="photoContainer">
        {item.locked && !item.fundingAvailable && <div className="locked"><span>FUNDED</span></div>}
        <img className="photo" src={item.photo} />
      </div>
      <div className="descriptionContainer">

        <div className="description">
          <div className="addressContainer">
            <div className="address">
              {item.title.split(",").map((line, idx) => <div key={`${item.id}-line-${idx}`} className="title">{line}</div>)}
            </div>
            {item.owned && <div className="ownerBadge">OWNED</div>}
          </div>

          <div className="funding">
            <div>Funded</div>
            <div>
              <span>{item.funded}</span>
              <span> / </span>
              <span>{item.price} </span>
              <span>Ⓝ</span>
            </div>
          </div>
          <div className="yourFunding">
            <div>Your funding</div>
            <div>
              <span>{item.userFunding} </span>
              <span>Ⓝ</span>
            </div>
          </div>


          <div className="renting">
            <div>Rent (monthly)</div>
            <div>
              <span>{item.rent} </span>
              <span>Ⓝ</span>
            </div>
          </div>
          <div className="yourRent">
            <div>You get (approx)</div>
            <div>
              <span>{item.rent * (item.userFunding / item.price)} </span>
              <span>Ⓝ</span>
            </div>
          </div>
        </div>


        <div className="actions">
          {!item.locked && item.fundingAvailable &&
            <div className="invest" onClick={invest}>
              INVEST
            </div>
          }

          {!item.locked && item.fundingAvailable && item.owned &&
            <div className="cancel" onClick={() => displayConfirmModal('rollback')}>
              CANCEL
            </div>
          }

          {item.locked && !item.fundingAvailable && !item.rentor &&
            <div className="rent" onClick={() => displayConfirmModal('rent')}>
              RENT
            </div>
          }

          {!item.rented && item.rentor && !item.owned && // you are neither, property is occupied
            <div className="occupied">
              OCCUPIED
            </div>
          }

          {item.rented && !(item.collected_rent >= item.rent) && // you are rentor, rent is pending
            <div className="rented" onClick={() => displayConfirmModal('pay')}>
              PAY RENT
            </div>
          }

          {item.rented && item.collected_rent >= item.rent && // you are rentor, rent is paid
            <div className="paid">
              RENT PAID
            </div>
          }

          {/* Could show collected rent */}
          {item.rentor && item.owned && item.collected_rent >= item.rent && // if funds available => you are admin distribute funds
            <div className="distribute" onClick={() => displayConfirmModal('distribute')}>
              DISTRIBUTE
            </div>
          }
          {item.rentor && item.owned && !(item.collected_rent >= item.rent) && // if funds not available => you are owed
            <div className="pastDue">
              PAST DUE
            </div>
          }
          {item.rentor && item.owned && item.collected_rent == 0 &&
            <div className="finalize" onClick={() => displayConfirmModal('finalize')}>
              FINALIZE
            </div>
          }
        </div>
      </div>

    </div >
  );
}

export default Item;