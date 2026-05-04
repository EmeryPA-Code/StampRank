import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
} from '@solana/web3.js';

const TREASURY_ADDRESS = new PublicKey('GsbwXfJraMomNxBcpR3DBDuFMEJyMSHjgcrLDSbDXQFj');

export async function stakeOnChain(
  walletPublicKey: PublicKey,
  projectSlug: string,
  amount: number,
  type: 'long' | 'skeptic',
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
  console.log('Connection endpoint:', connection.rpcEndpoint)

  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: TREASURY_ADDRESS,
        lamports: amount * 1000,
      }),
    );
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    console.log('Sending transaction...')
    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    console.log('Transaction sent:' + signature)

    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return signature;
  } catch (error) {
    console.error('Full error:', JSON.stringify(error, null, 2))
    throw error;
  }
}
