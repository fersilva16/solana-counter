import assert from 'assert';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { SolanaNft } from '../target/types/solana_nft';

describe('solana-nft', () => {
  const provider = anchor.Provider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaNft as Program<SolanaNft>;

  let baseAccount: anchor.web3.Keypair | undefined = undefined;

  it('creates a counter', async () => {
    baseAccount = anchor.web3.Keypair.generate();

    await program.rpc.create({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey,
    );

    assert.ok(account.count.toNumber() === 0);
  });

  it('increments a counter', async () => {
    assert.ok(baseAccount !== undefined);

    await program.rpc.increment({
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey,
    );

    assert.ok(account.count.toNumber() === 1);
  });
});
