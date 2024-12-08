import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const getEthereumContract = () => {
    if (!window.ethereum) {
        console.log('Metamask is not installed!');
    } else {
        console.log('Metamask is available:', window.ethereum);
    }
    const ethereum = window.ethereum;
    console.log(ethereum);
    if (!ethereum) {
        throw new Error("No ethereum object");
    }
    
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Contract - ", contract);
    return contract;
    };
export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const handleEthereum = async () => {
        if (ethereum) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                setCurrentAccount(accounts[0]);
                console.log("Connected account:", accounts[0]);
            } catch (error) {
                console.error("Error connecting to MetaMask:", error);
            }
        } else {
            console.error("Please install MetaMask!");
            // Display message to inform the user
            const messageElement = document.getElementById("metamask-message");
            if (messageElement) {
                messageElement.textContent = "Please install MetaMask to use this feature.";
                messageElement.style.display = "block";
            }
        }
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            throw new Error("No ethereum object");
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;
    
            if (!ethereum) {
            alert("Please install MetaMask!");
            return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            console.log("Connected account:", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
        };

    const sendTransaction = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) return alert("Please install MetaMask");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            if (!transactionContract) return;
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208", // 21000 GWEI
                    value: parsedAmount._hex, // 0.00001
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        handleEthereum(); // Check Ethereum availability on load
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                setFormData,
                handleChange: (e, name) => {
                    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
                },
                sendTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
