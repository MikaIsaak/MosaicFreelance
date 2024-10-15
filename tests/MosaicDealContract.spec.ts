import { Blockchain, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { address, Address, toNano } from '@ton/core';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';
import '@ton/test-utils';
import exp from 'constants';
import { SenderArguments } from '@ton/core/dist/contract/Sender';

describe('MosaicDealContract', () => {
    let blockchain: Blockchain;
    let freelancer: SandboxContract<TreasuryContract>;
    let customer: SandboxContract<TreasuryContract>;
    let admin: SandboxContract<TreasuryContract>;
    let mosaicDealContract: SandboxContract<MosaicDealContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        customer = await blockchain.treasury('customer');
        freelancer = await blockchain.treasury('freelancer');
        admin = await blockchain.treasury('admin');

        mosaicDealContract = blockchain.openContract(
            await MosaicDealContract.fromInit(
                BigInt(0),
                admin.address,
                toNano('0.05'),
                customer.address,
                freelancer.address,
            ),
        );

        const balanceBefore = await admin.getBalance();

        const deployResult = await mosaicDealContract.send(
            admin.getSender(),
            {
                value: toNano('0.05'),
                bounce: false,
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        printTransactionFees(deployResult.transactions);

        const balanceAfter = await admin.getBalance();

        console.log('Deployer balance after delta', balanceBefore - balanceAfter);
        console.log(await mosaicDealContract.getDealId(), ' id ');

        expect(deployResult.transactions).toHaveTransaction({
            from: admin.address,
            to: mosaicDealContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const DepositResult = await mosaicDealContract.send(
            admin.getSender(),
            {
                value: toNano('0.05'),
                bounce: false,
            },
            {
                $$type: 'Deposit',
                amount: toNano('0.05'),
            },
        );
        console.log('Contract balance ', await mosaicDealContract.getContractBalance());
        printTransactionFees(DepositResult.transactions);
        // console.log(' Amount balance ', await mosaicDealContract.getAmount());
    });

    it('should revert if zero values in constructor', async () => {
        mosaicDealContract = blockchain.openContract(
            await MosaicDealContract.fromInit(
                BigInt(0),
                admin.address,
                toNano('0.10'),
                customer.address,
                freelancer.address,
            ),
        );

        const balanceBefore = await admin.getBalance();

        const deployResult = await mosaicDealContract.send(
            admin.getSender(),
            {
                value: toNano('0.05'),
                bounce: true,
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );
    });

    it('should revert if zero values in constructor', async () => {
        const amountBefore = await mosaicDealContract.getAmount();
        const finishDeal = await mosaicDealContract.send(
            customer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'AddAdditionalValue',
                amount: toNano('0.01'),
            },
        );
        const amountAfter = await mosaicDealContract.getAmount();
        console.log('Difference is ', amountAfter - amountBefore);
    });

    it('should finish the deal', async () => {
        const balanceBefore = await customer.getBalance();
        const freelancerBalanceBefore = await freelancer.getBalance();
        const finishDeal = await mosaicDealContract.send(
            customer.getSender(),
            {
                value: toNano('0.01'),
            },
            {
                $$type: 'FinishDeal',
                dealId: await mosaicDealContract.getDealId(),
            },
        );
        const balanceAfter = await customer.getBalance();
        const freelancerBalanceAfter = await freelancer.getBalance();
        console.log('Fee spent ', balanceBefore - balanceAfter);
        expect(await mosaicDealContract.getIsActive()).toBe(false);
        expect(freelancerBalanceAfter).toEqual(freelancerBalanceBefore + toNano('0.05'));
    });
});
