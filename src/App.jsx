import { useState } from "react";
import { ethers } from "ethers";
import contractInfo from './contract-address.json';

import { CONTRACT_ABI } from './contract';
const CONTRACT_ADDRESS = contractInfo.address;

function App() {
  const [account, setAccount] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

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
    if (newMessages.length === 0) {
      alert("メッセージが存在しません");
      return;
    }
    setMessages(newMessages);
    setNewMessage("");
  }

  const postMessage = async () => {
    if (!newMessage) {
      alert("メッセージが空です。");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.postMessage(newMessage);
      await tx.wait();
    } catch (error) {
      console.error("投稿失敗: ", err);
      alert("投稿に失敗しました。");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MessageBoard</h1>

      {account ? (
        <>
          <p>接続済みアカウント: {account}</p>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="input message"
          />
          <button onClick={postMessage}>投稿する</button>
          <br/>
          <button onClick={fetchMessages}>最新メッセージを取得</button>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg.text} at {new Date(Number(msg.timestamp) * 1000).toLocaleString()}</li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={connectWallet}>ウォレット接続</button>
      )}
    </div>
  );
}

export default App;
