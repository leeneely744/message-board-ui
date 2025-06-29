import { useState } from "react";
import { ethers, formatEther } from "ethers";
import contractInfo from './contract-address.json';

import { CONTRACT_ABI } from './contract';
const CONTRACT_ADDRESS = contractInfo.address;

import { Message } from "./Message";

function App() {
  const [account, setAccount] = useState(null);
  const [messageBoardContract, setMessageBoardContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [tips, setTips] = useState(0);
  const [tipEth, setTipEth] = useState("0.01");
  const [editingMessage, setEditingMessage] = useState("");

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
      
      // ethers.js を使ってコントラクトを初期化
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const newContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setMessageBoardContract(newContract);

      // account / chain 変更でリセット
      window.ethereum.on("accountsChanged", () => {
        setAccount(null);
        setMessageBoardContract(null);
      });
    } catch (err) {
      console.error("接続エラー:", err);
    }
  };
  
  const fetchMessages = async () => {
    const newMessages = await messageBoardContract.getLatestMessages(5);
    if (newMessages.length === 0) {
      alert("メッセージが存在しません");
      return;
    }
    setMessages(newMessages);
  };

  const postMessage = async () => {
    if (!newMessage) {
      alert("メッセージが空です。");
      return;
    }
    
    try {
      // transaction overrides: https://docs.ethers.org/v5/api/contract/contract/#Contract-functionsCall
      const tx = await messageBoardContract.postMessage(newMessage, {
        value: ethers.parseEther(tipEth)
      });
      await tx.wait();

      await updateTotalTips();
      await fetchMessages();
      setNewMessage("");
    } catch (err) {
      console.error("投稿失敗: ", err);
      alert("投稿に失敗しました。");
    }
  };

  const updateTotalTips = async () => {
    if (!messageBoardContract) return;
    
    // totalTip: 自動生成された getter
    const raw = await messageBoardContract.totalTip();
    const eth = formatEther(raw);
    setTips(eth);
  }

  const dialogTypes = {
    none: "none", edit: "edit", delete: "delete"
  };
  const [openedDialog, setOpenedDialog] = useState(dialogTypes.none);

  const onClickEdit = (id) => {
    setEditingMessage(messages[id]);
    setOpenedDialog(dialogTypes.edit);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MessageBoard</h1>

      {account ? (
        <>
          <p>接続済みアカウント: {account}</p>
          <input
            type="number"
            step="0.01"
            value={tipEth}
            onChange={e => setTipEth(e.target.value)}
            placeholder="tip ETH"
          />
          <br/>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="input message"
          />
          <button onClick={postMessage}>投稿する</button>
          <br/>
          <p>合計Tips: {tips} ETH</p>
          <button onClick={fetchMessages}>最新メッセージを取得</button>
          <ul>
            {messages.map((msg, index) => (
              <Message
                key={index}
                message={msg.text}
                timestamp={msg.timestamp}
                isAuthor={true}
                handleEdit={() => onClickEdit(index)}
                handleDelete={() => {console.log("Delete")}}
              />
            ))}
          </ul>
          {openedDialog == dialogTypes.edit &&
            <dialog id="edit-modal" open>
              <h2>編集</h2>
              <input placeholder={editingMessage}></input>
              <button onClick={()=>{console.log("キャンセル")}}>キャンセル</button>
              <button onClick={()=>{console.log("確定")}}>確定</button>
            </dialog>
          }
        </>
      ) : (
        <button onClick={connectWallet}>ウォレット接続</button>
      )}
    </div>
  );
}

export default App;
