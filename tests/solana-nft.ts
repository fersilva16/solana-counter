import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { SolanaNft } from '../target/types/solana_nft';

describe('solana-nft', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaNft as Program<SolanaNft>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
