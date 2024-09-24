import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { useState, useEffect } from "react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

/**
 * The main application component for the Luxury Goods UI.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * return (
 *   <App />
 * )
 * 
 * @description
 * This component handles the user interface for the Luxury Goods application. It manages the user's wallet connection state and displays a navigation bar with a button to connect the wallet.
 * 
 * @function
 * @name LuxuryGoods App
 * 
 * @property {string} userAddress - The user's wallet address, retrieved from session storage or user session.
 * @property {function} setUserAddress - Function to update the user's wallet address state.
 * 
 * @hook
 * @name useState
 * @description Initializes the userAddress state with a value from session storage.
 * 
 * @hook
 * @name useEffect
 * @description Checks if the user is signed in and updates the userAddress state with the testnet address from the user session.
 * 
 * @function
 * @name handleConnectWallet
 * @description Handles the wallet connection process, updating the userAddress state and storing the address in session storage upon successful connection.
 * 
 * @returns {JSX.Element} The main application component with a navigation bar and wallet connection button.
 */
function App() {
  const [userAddress, setUserAddress] = useState(() => {
    return JSON.parse(sessionStorage.getItem("userAddress"));
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const {
        profile: {
          stxAddress: { testnet },
        },
      } = userSession.loadUserData();
      setUserAddress(testnet);
    }
  }, []);

  const handleConnectWallet = () => {
    showConnect({
      appDetails: {
        name: "My App",
        icon: "",
      },
      onFinish: () => {
        const {
          profile: {
            stxAddress: { testnet },
          },
        } = userSession.loadUserData();

        setUserAddress(testnet);
        sessionStorage.setItem("userAddress", JSON.stringify(testnet));
      },
      userSession,
    });
  };

  return (
    <main>
      <nav className="bg-yellow-800 py-8 px-16 flex items-center justify-between">
        <h1 className="text-white text-2xl">Luxury Goods UI</h1>
        <button
          className="bg-black px-8 py-2 text-white text-xl rounded-md"
          onClick={handleConnectWallet}
        >
          {!userAddress ? "Connect Wallet" : "Wallet Connected"}
        </button>
      </nav>
    </main>
  );
}

export default App;
