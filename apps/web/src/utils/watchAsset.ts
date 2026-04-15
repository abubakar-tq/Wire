export async function addErc721ToWallet(
  address: string,
  symbol: string,
  tokenId: string,
  imageUrl?: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No integrated wallet provider found');
  }

  try {
    const success = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address,
          symbol,
          tokenId,
          image: imageUrl,
        },
      },
    });
    return Boolean(success);
  } catch (error) {
    console.error('Failed to add ERC721 token to wallet:', error);
    throw error;
  }
}
