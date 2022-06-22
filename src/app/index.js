import './style.css';
import React, { useEffect, useState } from 'react';

import {
  signIn,
  signOut,
  getData,
  investInProperty,
  createProperty,
  rollbackInvestment,
  rentProperty,
  payRent,
  distributeRent,
  finalizeRent
} from '../chain';

import Loader from '../components/loader/loader';
import Header from '../components/header';
import InvestModal from '../components/modal/invest';
import NewModal from '../components/modal/new';
import PropertyList from '../components/list';

const App = ({ nearConfig, walletConnection, currentUser }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [data, setData] = useState([]);

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    refreshData()
  }, []);

  const refreshData = async () => {
    setShowLoader(true)
    setData(await getData(nearConfig, currentUser))
    setShowLoader(false)
  }

  const walletSignIn = () => {
    signIn(nearConfig, walletConnection);
  }

  const walletSignOut = () => {
    signOut(walletConnection);
  }

  const showInvest = (id) => {
    if (currentUser) {
      setSelectedProperty(data.find(prop => prop.id === id));
      setShowInvestModal(true);
    } else {
      walletSignIn();
    }
  }

  const cancelInvestment = () => {
    setSelectedProperty(null);
    setShowInvestModal(false);
  }

  const invest = async (id, amount) => {
    setShowLoader(true);
    try {
      await investInProperty(nearConfig, walletConnection, { id, amount });
    } catch (e) {
      alert(e);
    } finally {
      cancelInvestment();
      setShowLoader(false);
      refreshData();
    }
  }

  const showCreate = () => {
    if (currentUser) {
      setShowNewModal(true);
    } else {
      walletSignIn();
    }
  }

  const cancelCreate = () => {
    setShowNewModal(false);
  }

  const create = async ({ title, photo, price, rent }) => {
    cancelCreate();
    setShowLoader(true);
    try {
      await createProperty(nearConfig, walletConnection, { title, photo, price, rent });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  const rollback = async (id) => {
    setShowLoader(true);
    try {
      await rollbackInvestment(nearConfig, walletConnection, { id });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  const rent = async (id) => {
    const rent = data.find(property => property.id == id).rent
    setShowLoader(true);
    try {
      await rentProperty(nearConfig, walletConnection, { id, rent });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  const pay = async (id) => {
    const rent = data.find(property => property.id == id).rent
    setShowLoader(true);
    try {
      await payRent(nearConfig, walletConnection, { id, rent });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  const distribute = async (id) => {
    setShowLoader(true);
    try {
      await distributeRent(nearConfig, walletConnection, { id });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  const finalize = async (id) => {
    setShowLoader(true);
    try {
      await finalizeRent(nearConfig, walletConnection, { id });
    } catch (e) {
      alert(e);
    } finally {
      setShowLoader(false);
      refreshData();
    }
  }

  if (showLoader) {
    return (<Loader />)
  }

  return (
    <div id="page">
      <Header signIn={walletSignIn} signOut={walletSignOut} currentUser={currentUser} create={showCreate} />
      {showInvestModal && <InvestModal data={selectedProperty} cancel={cancelInvestment} invest={invest} />}
      {showNewModal && <NewModal cancel={cancelCreate} create={create} />}
      <PropertyList data={data} showInvest={showInvest} rollback={rollback} rent={rent} pay={pay} distribute={distribute} finalize={finalize} />
    </div>
  );
}

export default App;
