"use client";

import Image from "next/image";
import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
  getNFT,
} from "thirdweb/extensions/erc721";
import { useState, useEffect } from "react";
import TypingText from "./components/TypingText";
import "./styles.css";

export default function Home() {
  const account = useActiveAccount();
  const chain = defineChain(33111);
  const [quantity, setQuantity] = useState(1);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x0f3cec48434f7A9C4a68C3C8eAbfD6C03D96370e",
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } =
    useReadContract(getContractMetadata, { contract: contract });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } =
    useReadContract(getTotalClaimedSupply, { contract: contract });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, { contract: contract });

  const { data: currentNFT, isLoading: isCurrentNFTLoading } = useReadContract(
    getNFT,
    {
      contract: contract,
      tokenId: claimedSupply ? BigInt(claimedSupply.toString()) : BigInt(0),
      includeOwner: true,
    }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contract,
  });

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  // Assuming max allocation is 6 for this example - you might want to get this from the contract
  const maxAllocation = 6;

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <TypingText />

        <div className="custom-connect-button-wrapper">
          <ConnectButton client={client} chain={chain} />
        </div>

        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-8 mt-8">
                {/* Left side - Allocation info */}
                <div className="text-left font-mono">
                  <div className="mb-2">
                    Wallet Allocated: {maxAllocation} Jungles
                  </div>
                  <div>mint price per: {getPrice(1)} APE</div>
                </div>

                {/* Center - Image */}
                <div className="relative">
                  <Image
                    alt="ApeCity"
                    src="/apejungle.png"
                    width={200}
                    height={200}
                  />
                  {/* Supply counter below image */}
                  <div className="text-center mt-2 font-mono text-sm">
                    {!isClaimedSupplyLoading &&
                      !isTotalSupplyLoading &&
                      `${claimedSupply?.toString() || "0"} minted out of ${
                        totalNFTSupply?.toString() || "0"
                      } minted`}
                  </div>
                </div>

                {/* Right side - Quantity indicator */}
                <div className="font-mono text-2xl">x {quantity}</div>
              </div>

              <div className="mt-8">
                {/* Amount and Price display */}
                <div className="font-mono mb-4">
                  <div>Amount: {quantity}</div>
                  <div>Price: {getPrice(quantity)} APE</div>
                </div>

                {/* Quantity controls */}
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
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-16 text-center border border-gray-300 rounded-md bg-black text-white p-2 font-mono"
                  />
                  <button
                    className="bg-black text-white px-4 py-2 rounded-md"
                    onClick={() =>
                      setQuantity(Math.min(maxAllocation, quantity + 1))
                    }
                  >
                    +
                  </button>
                </div>

                {/* Claim button */}
                <TransactionButton
                  transaction={() =>
                    claimTo({
                      contract: contract,
                      to: account?.address || "",
                      quantity: BigInt(quantity),
                    })
                  }
                  onTransactionConfirmed={async () => {
                    alert("NFT Claimed!");
                    setQuantity(1);
                  }}
                  className="bg-black text-white px-6 py-2 rounded-md font-mono hover:bg-gray-800"
                >
                  buy
                </TransactionButton>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center text-center">
      <header className="flex flex-row items-center">
        <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-black-100">
          EVERY APE NEEDS <br />A<br /> JUNGLE
        </h1>
      </header>
      <h2 className="text-lg md:text-2xl text-black-300">MINT PORTAL</h2>
    </div>
  );
}
