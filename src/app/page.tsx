"use client";

import { ConnectWallet, useAddress, ThirdwebProvider, Web3Button, useContract, useContractRead, useOwnedNFTs } from "@thirdweb-dev/react";

const CONTRACT_ADDRESS = "0x0f3cec48434f7A9C4a68C3C8eAbfD6C03D96370e";

const ClaimNFT = () => {
  const address = useAddress();
  
  // Get contract instance
  const { contract } = useContract(CONTRACT_ADDRESS);
  
  // Get owned NFTs
  const { data: ownedNFTs, isLoading: isLoadingOwned } = useOwnedNFTs(contract, address);

  if (isLoadingOwned) {
    return <div className="text-center">Loading NFT information...</div>;
  }

  return (
    <div className="space-y-6 text-center">
      {address ? (
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="p-4 rounded-lg bg-gray-100">
            <p className="text-sm font-medium mb-2">Connected Wallet:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
          
          {/* NFT Stats */}
          <div className="p-4 rounded-lg bg-green-50">
            <p className="text-sm font-medium">Your NFTs</p>
            <p className="text-2xl font-bold">{ownedNFTs?.length || 0}</p>
          </div>
          
          {/* Claim Button */}
          <Web3Button
            contractAddress={CONTRACT_ADDRESS}
            action={async (contract) => {
              return contract.erc721.claim(1);
            }}
            onSuccess={() => alert("Successfully claimed NFT!")}
            onError={(error) => alert(`Error claiming NFT: ${error.message}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Claim NFT
          </Web3Button>

          {/* Display owned NFTs */}
          {ownedNFTs && ownedNFTs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Your Collection</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ownedNFTs.map((nft) => (
                  <div key={nft.metadata.id} className="p-4 border rounded-lg">
                    {nft.metadata.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={nft.metadata.image} 
                        alt={nft.metadata.name || 'NFT'}
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                    <p className="mt-2 font-medium">{nft.metadata.name || `NFT #${nft.metadata.id}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Connect your wallet to view and claim NFTs</p>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <ThirdwebProvider 
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain="ethereum" // Change this to match your contract's network
    >
      <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-20 space-y-8">
          <div className="flex justify-center">
            <ConnectWallet 
              theme="light"
              btnTitle="Connect Wallet"
            />
          </div>
          
          <ClaimNFT />
        </div>
      </main>
    </ThirdwebProvider>
  );
}