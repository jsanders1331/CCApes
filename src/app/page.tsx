"use client";

import Image from "next/image";
import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc721";
import { useState, useEffect } from "react";
import TypingText from "./components/TypingText";
import LoadingSquares from "./components/LoadingSquares";
import "./styles.css";
import { max } from "thirdweb/utils";

type SequenceState = "initial" | "allowlisted" | "notAllowlisted" | "minted";

// Static snapshot data
const SNAPSHOT_DATA: { [key: string]: number } = {
  "0x6A921d0494b66cFD3e53Bfc1b8a868403a23cD9b": 2,
  "0x000000000000000000000000000000000000dEaD": 5,
};

export default function Home() {
  const account = useActiveAccount();
  const chain = defineChain(33111);
  const [quantity, setQuantity] = useState(1);
  const [walletMaxClaimable, setWalletMaxClaimable] = useState(0);
  const [sequence, setSequence] = useState<SequenceState>("initial");
  const [mintedAmount, setMintedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x0f3cec48434f7A9C4a68C3C8eAbfD6C03D96370e",
  });

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract,
  });

  const { data: claimId, isLoading: isClaimIdLoading } = useReadContract({
    contract,
    method:
      "function getActiveClaimConditionId() public view returns (uint256)",
    params: [],
  });

  const { data: supplyClaimed, isLoading: isSupplyClaimedLoading } =
    useReadContract({
      contract,
      method:
        "function getSupplyClaimedByWallet(uint256 conditionId, address claimer) public view returns (uint256)",
      params: [claimId ?? 0n, account?.address ?? ""],
    });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } =
    useReadContract(getContractMetadata, { contract: contract });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } =
    useReadContract(getTotalClaimedSupply, { contract: contract });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, { contract: contract });

  // Initial loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Transition effect when sequence changes
  useEffect(() => {
    if (sequence !== "initial") {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sequence]);

  // Calculate maxClaimable based on snapshot data and already claimed supply
  useEffect(() => {
    if (account?.address) {
      const snapshotMaxClaimable = SNAPSHOT_DATA[account.address] || 0;
      const claimed = supplyClaimed ? Number(supplyClaimed) : 0;
      const maxClaimable = Math.max(0, snapshotMaxClaimable - claimed);
      setWalletMaxClaimable(maxClaimable);

      // Update sequence based on allowlist status
      if (snapshotMaxClaimable > 0) {
        setSequence("allowlisted");
      } else {
        setSequence("notAllowlisted");
      }
    } else {
      setWalletMaxClaimable(0);
      setSequence("initial");
    }
  }, [account, supplyClaimed]);

  useEffect(() => {
    if (account !== undefined) {
      console.log("claimId: ", claimId);
      console.log("supplyClaimed: ", supplyClaimed);
      console.log("maxClaimable from snapshot: ", walletMaxClaimable);
    }
  }, [account, claimId, supplyClaimed, walletMaxClaimable]);

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  // Update quantity if it exceeds new maxClaimable
  useEffect(() => {
    if (quantity > walletMaxClaimable) {
      setQuantity(Math.max(1, walletMaxClaimable));
    }
  }, [walletMaxClaimable]);

  const resetSequence = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSequence("initial");
      setQuantity(1);
      setMintedAmount(0);
      setIsTransitioning(false);
    }, 1000);
  };

  const renderInitialContent = () => (
    <>
      <Header />
      <TypingText />
      <div className="custom-connect-button-wrapper">
        <ConnectButton client={client} chain={chain} />
      </div>
    </>
  );

  const renderNotAllowlisted = () => (
    <div className="text-center">
      <h1 className="text-2xl md:text-4xl mb-6">
        you are not on the allowlist
      </h1>
      <button
        onClick={resetSequence}
        className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
      >
        Go Back
      </button>
    </div>
  );

  const renderMinted = () => (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-2xl mb-4">You minted {mintedAmount} Jungles</h2>
        <div className="relative inline-block">
          <Image
            alt="Jungle NFT"
            src="/apejungle.png"
            width={200}
            height={200}
          />
        </div>
      </div>
      <p className="mb-4">Reveal is scheduled for 6:00PM EST 24/11/2024</p>
      <button
        onClick={resetSequence}
        className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
      >
        Go Back
      </button>
    </div>
  );

  const renderMintInterface = () => (
    <div className="flex flex-col items-center mt-4">
      {isContractMetadataLoading ? (
        <LoadingSquares />
      ) : (
        <>
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="text-left text-2xl">
              <div className="mb-2">
                Wallet Allocated: {walletMaxClaimable} Jungles
              </div>
              <div>mint price per: {getPrice(1)} APE</div>
            </div>

            <div className="relative">
              <Image
                alt="ApeCity"
                src="/apejungle.png"
                width={200}
                height={200}
                style={{ border: "2px solid black" }}
              />
              <div className="text-center mt-2 text-lg">
                {!isClaimedSupplyLoading &&
                  !isTotalSupplyLoading &&
                  `${claimedSupply?.toString() || "0"} minted out of ${
                    totalNFTSupply?.toString() || "0"
                  } minted`}
              </div>
            </div>

            <div className="text-2xl">x {quantity}</div>
          </div>

          <div className="mt-8">
            <div className="mb-4 text-xl">
              <div>Amount: {quantity}</div>
              <div>Price: {getPrice(quantity)} APE</div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                className="bg-black text-white px-4 py-2 rounded-md"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  if (newQuantity <= walletMaxClaimable) {
                    setQuantity(newQuantity);
                  }
                }}
                max={walletMaxClaimable}
                className="w-16 text-center border border-gray-300 rounded-md bg-black text-white p-2"
                disabled={walletMaxClaimable === 0}
              />
              <button
                className="bg-black text-white px-4 py-2 rounded-md"
                onClick={() => setQuantity(Math.min(quantity + 1))}
              >
                +
              </button>
            </div>

            <TransactionButton
              transaction={() =>
                claimTo({
                  contract: contract,
                  to: account?.address || "",
                  quantity: BigInt(quantity),
                })
              }
              onTransactionConfirmed={async () => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setMintedAmount(quantity);
                  setSequence("minted");
                  setIsTransitioning(false);
                }, 1000);
              }}
              className="bg-black text-white text-2xl px-6 py-2 font-mono hover:bg-gray-800 opacity-100"
              style={{
                opacity: 1,
                borderRadius: 0,
                backgroundColor: "black",
                color: "white",
                height: "50px",
                width: "50px",
                padding: "0px",
              }}
              disabled={walletMaxClaimable === 0}
            >
              <div className="flex items-center justify-center">
                buy
                <Image
                  alt="city_icon"
                  src="/box_logo_small.png"
                  width={32}
                  height={32}
                />
              </div>
            </TransactionButton>
          </div>
          {walletMaxClaimable === 0 && (
            <div className="text-red-500 mt-4">
              You have reached your max claimable amount.
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading || isTransitioning) {
      return <LoadingSquares />;
    }

    switch (sequence) {
      case "initial":
        return renderInitialContent();
      case "notAllowlisted":
        return renderNotAllowlisted();
      case "allowlisted":
        return (
          <>
            <Header2 />
            <ConnectButton client={client} chain={chain} />
            {renderMintInterface()}
          </>
        );
      case "minted":
        return renderMinted();
      default:
        return renderInitialContent();
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">{renderContent()}</div>
    </main>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center text-center">
      <header className="flex flex-row items-center">
        <h1 className="text-3xl md:text-7xl tracking-tighter mb-6 text-black-100">
          EVERY APE NEEDS <br />A<br /> JUNGLE
        </h1>
      </header>
      <h2 className="text-xl md:text-3xl text-black-300">MINT PORTAL</h2>
    </div>
  );
}

function Header2() {
  return (
    <div className="flex flex-col items-center text-center">
      <header className="flex flex-row items-center">
        <div className="text-3xl md:text-7xl font-light tracking-tighter mb-6 text-black-100">
          You&#39;re on the <br></br> allowlist!
        </div>
      </header>
    </div>
  );
}
