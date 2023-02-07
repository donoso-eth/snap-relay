import { OnRpcRequestHandler } from '@metamask/snap-types';
import { ethers, Contract,  Wallet, providers } from 'ethers';
import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver,
  JsonBIP44CoinTypeNode,
} from '@metamask/key-tree';
import {
  GaslessWallet,
  GaslessWalletConfig,
} from '@gelatonetwork/gasless-wallet';

// Fetch parent key from Metamask and generate a wallet from it, base on the input index
export async function getSigner(
  provider: providers.Provider,
  index: number,
): Promise<Wallet> {
  const dogecoinNode: BIP44CoinTypeNode = (await wallet.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 60,
    },
  })) as BIP44CoinTypeNode;

  // Next, we'll create an address key deriver function for the Ethereumcoin_type node.
  // In this case, its path will be: m / 60 / 3' / 0' / 0 / address_index
  const deriveDogecoinAddress = await getBIP44AddressKeyDeriver(dogecoinNode);

  // These are BIP-44 nodes containing the extended private keys for
  // the respective derivation paths.

  // m / 44' / 60' / 0' / 0 / 0
  const addressKey0 = await deriveDogecoinAddress(0);

  return new Wallet(addressKey0.privateKey!, provider);
}


/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'gelato-wallet':
      const params: any = request.params!;
      //throw new Error(params[0].data);

      //let provi = ethers.providers.EO

      const provider = new ethers.providers.Web3Provider(wallet as any)
      const network = await provider.getNetwork();
      if ((await provider.getNetwork()).name !== 'goerli') {
        throw new Error('network is not Goerli');
      }

      const myWallet = await getSigner(provider, 0); // Only for 1 first addresses

      const gaslessWalletConfig: GaslessWalletConfig = {
        apiKey: '1NnnocBNgXnG1VgUnFTHXmUICsvYqfjtKsAq1OCmaxk_',
      };

    

      const gaslessWallet = new GaslessWallet(provider as unknown as ethers.providers.ExternalProvider, gaslessWalletConfig);


      /// WHEN initializing the gasless wallet throws the erorr

      await gaslessWallet.init();



      const contract = new Contract(
        '0xf87389350764548698E35bFEF1682B1328811657',
        [
          {
            inputs: [
              { internalType: 'string', name: 'tokenURI', type: 'string' },
            ],
            name: 'aaMint',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        myWallet,
      );



      const addresses = myWallet.address;
      return addresses;
    default:
      throw new Error('Method not found.');
  }
};
