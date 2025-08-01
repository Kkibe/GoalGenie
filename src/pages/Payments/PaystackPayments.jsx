import React, { useContext } from 'react'
import './Ticket.scss';
import { PriceContext } from '../../PriceContext';
import AppHelmet from '../../components/AppHelmet';
import { PaystackButton } from 'react-paystack';
import { AuthContext } from '../../AuthContext';
import { db, getUser, updateUser } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function PaystackPayments({ setUserData }) {
  const { price, setPrice } = useContext(PriceContext)
  const { currentUser } = useContext(AuthContext);

  const handleUpgrade = async () => {
    try {
      const currentDate = new Date().toISOString();
      /*await updateUser(currentUser.email, true, returnPeriod(), currentDate).then(async () => {
        alert('You Have Upgraded To ' + returnPeriod() + " VIP");
      }).then(async () => {
        await getUser(currentUser.email, setUserData);
      }).then(() => {
        //window.location.pathname = '/';
      }).catch(() => {

      });*/

      const userDocRef = doc(db, "users", currentUser.email);
      await setDoc(userDocRef, {
        email: currentUser.email,
        username: currentUser.email,
        isPremium: true,
        subscription: returnPeriod(),
        subDate: currentDate
      }, { merge: true }).then(async (response) => {
        alert('You Have Upgraded To ' + returnPeriod() + " VIP");
      }).then(async () => {
        await getUser(currentUser.email, setUserData);
      }).then(async () => {
        window.location.pathname = '/';
      }).catch(async (error) => {
        const errorMessage = await error.message;
        alert(errorMessage);
      });
    } catch (error) {
      console.error("Error upgrading user:", error.message);
    }
  };


  const returnPeriod = () => {
    if (price === 100) {
      return 'Daily'
    } else if (price === 350) {
      return 'Weekly'
    } else if (price === 1200) {
      return 'Monthly'
    } else {
      return 'Yearly'
    }
  }

  const componentProps = {
    reference: (new Date()).getTime().toString(),
    email: currentUser.email,
    amount: price * 100,
    publicKey: 'pk_live_3536854dd4b68716f9d7515d748772e701c04832',
    currency: "KES",
    metadata: {
      name: currentUser.email,
    },
    text: 'Pay Now',
    onSuccess: (response) => {
      console.log("Payment success response:", response);
      handleUpgrade();
    },
    onClose: () => {
      //console.log('Payment dialog closed');
      // Handle payment closure here
    },
  };
  return (
    <div className="pay">
      <AppHelmet title={"Pay"} location={'/pay'} />
      <form>
        <fieldset>
          <input name="prices" type="radio" value={100} id="daily" checked={price === 100 ? true : false} onChange={(e) => setPrice(100)} />
          <label htmlFor="daily">Daily VIP</label>
          <span className="price">KSH 100</span>
        </fieldset>
        <fieldset>
          <input name="prices" type="radio" value={350} id="weekly" checked={price === 350 ? true : false} onChange={(e) => setPrice(350)} />
          <label htmlFor="weekly">7 Days VIP</label>
          <span className="price">KSH 350</span>
        </fieldset>
        <fieldset>
          <input name="prices" type="radio" value={1200} id="monthly" checked={price === 1200 ? true : false} onChange={(e) => setPrice(1200)} />
          <label htmlFor="monthly">30 Days VIP</label>
          <span className="price">KSH 1200</span>
        </fieldset>
        <fieldset>
          <input name="prices" type="radio" value={4000} id="yearly" checked={price === 4000 ? true : false} onChange={(e) => setPrice(4000)} />
          <label htmlFor="yearly">1 Year VIP</label>
          <span className="price">KSH 4000</span>
        </fieldset>
      </form>
      <h4>GET {returnPeriod().toUpperCase()} VIP FOR {price}</h4>
      <PaystackButton {...componentProps} className='btn' />
    </div>
  )
}
