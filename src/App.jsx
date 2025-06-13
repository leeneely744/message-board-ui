import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMaskが見つかりません。インストールしてください。");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("接続エラー:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MessageBoard</h1>

      {account ? (
        <p>接続済みアカウント: {account}</p>
      ) : (
        <button onClick={connectWallet}>ウォレット接続</button>
      )}
    </div>
  );
}

export default App;
