import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { useState, useEffect } from "react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

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
