import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
} from '@solana/web3.js';

const TREASURY_ADDRESS = new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo');

export async function stakeOnChain(
  walletPublicKey: PublicKey,
  _projectSlug: string,
  amount: number,
  _type: 'long' | 'skeptic',
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
  console.log('Connection endpoint:', connection.rpcEndpoint)

  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: TREASURY_ADDRESS,
        lamports: amount * 1000,
      }),
    );
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = walletPublicKey;

    console.log('Sending transaction...')
    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true, preflightCommitment: 'processed' });
    console.log('Transaction sent:' + signature)

    return signature;
  } catch (error) {
    console.error('Full error:', JSON.stringify(error, null, 2))
    throw error;
  }
}
