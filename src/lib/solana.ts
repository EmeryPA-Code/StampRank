import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js';

const TREASURY_ADDRESS = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');
// SPL Memo v2 program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function stakeOnChain(
  walletPublicKey: PublicKey,
  projectSlug: string,
  amount: number,
  type: 'long' | 'skeptic',
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>,
): Promise<string> {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const memoText = `STAMPRANK:${type.toUpperCase()}:${projectSlug}:${amount}`;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: TREASURY_ADDRESS,
      lamports: amount * 1000,
    }),
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(memoText, 'utf-8'),
    }),
  );

  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}
