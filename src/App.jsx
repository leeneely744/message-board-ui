import { use, useEffect, useState } from "react";
import { ethers } from "ethers";

import { abi, CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

function App() {
  const [account, setAccount] = useState(null);
  const [messages, setMessages] = useState([]);

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
  
  const fetchMessages = async () => {
    // ethers.js を使ってコントラクトを初期化
    const provider = new ethers.BrowserProvider(window.ethereum);
    const messageBoardContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const newMessages = await messageBoardContract.getLatestMessages(5);
    setMessages(newMessages);
  }

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
