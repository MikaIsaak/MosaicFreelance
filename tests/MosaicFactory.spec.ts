import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { MosaicFactory } from '../wrappers/MosaicFactory';
import '@ton/test-utils';

describe('MosaicFactory', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let mosaicFactory: SandboxContract<MosaicFactory>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        mosaicFactory = blockchain.openContract(await MosaicFactory.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await mosaicFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mosaicFactory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and mosaicFactory are ready to use
    });
});
