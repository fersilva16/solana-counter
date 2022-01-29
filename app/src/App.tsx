import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from '../../target/idl/solana_nft.json';
import { IDL } from '../../target/types/solana_nft';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletProvider,
  ConnectionProvider,
  useAnchorWallet,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [new PhantomWalletAdapter()];

const { SystemProgram, Keypair } = web3;
const baseAccount = Keypair.generate();
const programId = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState<number | undefined>(undefined);
  const wallet = useAnchorWallet();

  async function getProvider() {
    const network = 'http://127.0.0.1:8899';
    const connection = new Connection(network, 'processed');

    const provider = new Provider(connection, wallet!, {
      preflightCommitment: 'processed',
    });
    return provider;
  }

  async function createCounter() {
    const provider = await getProvider();
    const program = new Program(IDL, programId, provider);

    console.log(provider.wallet.publicKey);

    try {
      await program.rpc.create({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });

      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey,
      );

      console.log('account: ', account);
      setValue(account.count.toNumber());
    } catch (err) {
      console.log('Transaction error: ', err);
    }
  }

  async function increment() {
    const provider = await getProvider();
    const program = new Program(IDL, programId, provider);
    await program.rpc.increment({
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey,
    );
    console.log('account: ', account);
    setValue(account.count.toNumber());
  }

  useEffect(() => {
    (async () => {
      const provider = await getProvider();
      const program = new Program(IDL, programId, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey,
      );

      console.log({ account, count: account.count, n: account.count.toNumber });

      setValue(account.count.toNumber());
    })();
  }, []);

  if (!wallet) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '100px',
        }}
      >
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="App">
      <div>
        {value === undefined ? (
          <button onClick={createCounter}>Create counter</button>
        ) : (
          <button onClick={increment}>Increment counter</button>
        )}

        {value !== undefined ? (
          <h2>{value}</h2>
        ) : (
          <h3>Please create the counter.</h3>
        )}
      </div>
    </div>
  );
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default AppWithProvider;
