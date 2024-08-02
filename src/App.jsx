import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import Web3Modal from 'web3modal';
import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      setAccount(accountAddress);
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  async function getNFTsForOwner() {
    setLoading(true);
    setError(null);
    try {
      const config = {
        apiKey: '_0uETKZZjS8Gj3EpFLVrP9R0qO7TzfVk',
        network: Network.ETH_MAINNET,
      };

      const alchemy = new Alchemy(config);
      const data = await alchemy.nft.getNftsForOwner(userAddress);
      setResults(data);

      const tokenDataPromises = data.ownedNfts.map((nft) =>
        alchemy.nft.getNftMetadata(nft.contract.address, nft.tokenId)
      );

      setTokenDataObjects(await Promise.all(tokenDataPromises));
    } catch (err) {
      setError('Failed to fetch NFTs');
    } finally {
      setLoading(false);
      setHasQueried(true);
    }
  }

  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Connect your wallet and plug in an address to see your NFTs!
          </Text>
          <Button onClick={connectWallet} mt={36} bgColor="blue" color="white">
            Connect Wallet
          </Button>
          {account && <Text mt={4}>Connected Account: {account}</Text>}
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getNFTsForOwner} mt={36} bgColor="blue" color="white">
          Fetch NFTs
        </Button>

        <Heading my={36}>Here are your NFTs:</Heading>

        {loading && <div className="spinner"></div>}

        {error && <Text color="red.500">{error}</Text>}

        {hasQueried && !loading && (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => (
              <Flex
                className="nft-item"
                flexDir={'column'}
                color="white"
                bg="blue"
                w={'20vw'}
                key={e.id}
              >
                <Box>
                  <b>Name:</b>{' '}
                  {tokenDataObjects[i]?.title?.length === 0
                    ? 'No Name'
                    : tokenDataObjects[i]?.title}
                </Box>
                <Image
                  src={
                    tokenDataObjects[i]?.rawMetadata?.image ??
                    'https://via.placeholder.com/200'
                  }
                  alt={'Image'}
                />
              </Flex>
            )}
          </SimpleGrid>
        )}
      </Flex>
    </Box>
  );
}

export default App;
