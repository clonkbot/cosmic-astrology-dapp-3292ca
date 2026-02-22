import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const BASE_CHAIN_ID = 8453;
const CONTRACT_ADDRESS = '0x374531294780aB871568Ebc8a3606c80D62cdc5e';

// ABI for the astrology contract - only the functions we need
const CONTRACT_ABI = [
  'function createProfile() external',
  'function claimDailyFortune() external',
  'function matchWithAddress(address other) external view returns (uint256)',
  'function getProfile(address user) external view returns (uint256 element, uint256 level, uint256 xp, uint256 energy, uint256 luckyNumber, uint256 winStreak, uint256 lastFortune)',
  'function hasProfile(address user) external view returns (bool)',
];

interface ProfileData {
  element: number;
  level: number;
  xp: number;
  energy: number;
  luckyNumber: number;
  winStreak: number;
  lastFortune: number;
}

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const isCorrectNetwork = chainId === BASE_CHAIN_ID;

  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // 8453 in hex
      });
    } catch (switchError: unknown) {
      // Chain not added, add it
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } catch {
          setError('Failed to add Base network');
        }
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setAddress(accounts[0]);
      setChainId(network.chainId);

      // If wrong network, try to switch
      if (network.chainId !== BASE_CHAIN_ID) {
        await switchToBase();
      }

      // Setup contract
      const signer = web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [switchToBase]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
    setContract(null);
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      setChainId(parseInt(chainIdHex, 16));
      // Reload provider when chain changes
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // Contract interaction functions
  const getProfile = useCallback(async (userAddress: string): Promise<ProfileData | null> => {
    if (!contract || !isCorrectNetwork) return null;

    try {
      const hasProf = await contract.hasProfile(userAddress);
      if (!hasProf) return null;

      const profile = await contract.getProfile(userAddress);
      return {
        element: profile.element.toNumber(),
        level: profile.level.toNumber(),
        xp: profile.xp.toNumber(),
        energy: profile.energy.toNumber(),
        luckyNumber: profile.luckyNumber.toNumber(),
        winStreak: profile.winStreak.toNumber(),
        lastFortune: profile.lastFortune.toNumber(),
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, [contract, isCorrectNetwork]);

  const checkHasProfile = useCallback(async (userAddress: string): Promise<boolean> => {
    if (!contract || !isCorrectNetwork) return false;
    try {
      return await contract.hasProfile(userAddress);
    } catch {
      return false;
    }
  }, [contract, isCorrectNetwork]);

  const createProfile = useCallback(async (): Promise<boolean> => {
    if (!contract || !isCorrectNetwork) {
      setError('Please connect to Base network');
      return false;
    }

    try {
      const tx = await contract.createProfile({ value: 0 });
      await tx.wait();
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create profile');
      return false;
    }
  }, [contract, isCorrectNetwork]);

  const claimDailyFortune = useCallback(async (): Promise<boolean> => {
    if (!contract || !isCorrectNetwork) {
      setError('Please connect to Base network');
      return false;
    }

    try {
      const tx = await contract.claimDailyFortune({ value: 0 });
      await tx.wait();
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to claim fortune');
      return false;
    }
  }, [contract, isCorrectNetwork]);

  const matchWithAddress = useCallback(async (otherAddress: string): Promise<number | null> => {
    if (!contract || !isCorrectNetwork) {
      setError('Please connect to Base network');
      return null;
    }

    try {
      const compatibility = await contract.matchWithAddress(otherAddress);
      return compatibility.toNumber();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to match');
      return null;
    }
  }, [contract, isCorrectNetwork]);

  return {
    address,
    chainId,
    isConnecting,
    isCorrectNetwork,
    error,
    provider,
    connect,
    disconnect,
    switchToBase,
    getProfile,
    checkHasProfile,
    createProfile,
    claimDailyFortune,
    matchWithAddress,
    setError,
  };
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
