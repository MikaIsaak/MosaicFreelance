import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { MosaicDealFactory, Info } from '../wrappers/MosaicDealFactory';
import '@ton/test-utils';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';

describe('MosaicDealFactory', () => {
    let blockchain: Blockchain;
    let freelancer: SandboxContract<TreasuryContract>;
    let customer: SandboxContract<TreasuryContract>;
    let admin: SandboxContract<TreasuryContract>;
    let deployer: SandboxContract<TreasuryContract>;
    let mosaicDealFactory: SandboxContract<MosaicDealFactory>;
    let mosaicDealContract: SandboxContract<MosaicDealContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        mosaicDealFactory = blockchain.openContract(await MosaicDealFactory.fromInit());

        deployer = await blockchain.treasury('deployer');
        freelancer = await blockchain.treasury('freelancer');
        customer = await blockchain.treasury('customer');
        admin = await blockchain.treasury('admin');

        const deployResult = await mosaicDealFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mosaicDealFactory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and mosaicDealFactory are ready to use
    });

    it('should create a new deal', async () => {
        const createResult = await mosaicDealFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'DealDetails',
                admin: deployer.address,
                customer: deployer.address,
                freelancer: deployer.address,
                amount: toNano('0.1'),
            },
        );

        expect(createResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mosaicDealFactory.address,
            success: true,
        });
    });

    it("Should return the deal's address", async () => {
        const createResult = await mosaicDealFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'DealDetails',
                admin: deployer.address,
                customer: deployer.address,
                freelancer: deployer.address,
                amount: toNano('0.1'),
            },
        );

        expect(createResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mosaicDealFactory.address,
            success: true,
        });

        let info: Info = {
            $$type: 'Info', // Это поле должно точно соответствовать строке "Info"
            id: 1n, // Используйте 'bigint' для id, например 1n
            admin: admin.address, // Укажите адрес администратора, например Address("admin_address")
            customer: customer.address, // Укажите адрес клиента
            freelancer: freelancer.address, // Укажите адрес фрилансера
            amount: toNano('0.1'), // Сумма в виде 'bigint', например 1000n
        };
        const dealAddress = await mosaicDealFactory.getAddressOfChildren(info);

        let mosaicDealContract = blockchain.openContract(
            await MosaicDealContract.fromInit(1n, admin.address, toNano('0.1'), customer.address, freelancer.address),
        );
        expect(dealAddress).toEqualAddress(mosaicDealContract.address);
    });

    it('Should start the deal', async () => {
        const createResult = await mosaicDealFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'DealDetails',
                admin: deployer.address,
                customer: deployer.address,
                freelancer: deployer.address,
                amount: toNano('0.1'),
            },
        );

        expect(createResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mosaicDealFactory.address,
            success: true,
        });

        let info: Info = {
            $$type: 'Info', // Это поле должно точно соответствовать строке "Info"
            id: 1n, // Используйте 'bigint' для id, например 1n
            admin: admin.address, // Укажите адрес администратора, например Address("admin_address")
            customer: customer.address, // Укажите адрес клиента
            freelancer: freelancer.address, // Укажите адрес фрилансера
            amount: toNano('0.1'), // Сумма в виде 'bigint', например 1000n
        };
        const dealAddress = await mosaicDealFactory.getAddressOfChildren(info);
        mosaicDealContract = blockchain.openContract(
            await MosaicDealContract.fromInit(1n, admin.address, toNano('0.1'), customer.address, freelancer.address),
        );

        const startResult = await mosaicDealContract.send(
            customer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'Deposit',
                amount: toNano('0.1'),
            },
        );

        expect(startResult.transactions).toHaveTransaction({
            from: customer.address,
            to: mosaicDealContract.address,
            success: true,
        });

        expect(await mosaicDealContract.getIsActive()).toEqual(true);

        const finushResult = await mosaicDealContract.send(
            customer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'FinishDeal',
                dealId: 1n,
            },
        );

        expect(await mosaicDealContract.getIsActive()).toEqual(false);
    });

    it("Should finish by Admin's request", async () => {
        const createResult = await mosaicDealFactory.send(
            customer.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'DealDetails',
                admin: admin.address,
                customer: customer.address,
                freelancer: freelancer.address,
                amount: toNano('0.1'),
            },
        );

        expect(createResult.transactions).toHaveTransaction({
            from: customer.address,
            to: mosaicDealFactory.address,
            success: true,
        });

        let info: Info = {
            $$type: 'Info', // Это поле должно точно соответствовать строке "Info"
            id: 1n, // Используйте 'bigint' для id, например 1n
            admin: admin.address, // Укажите адрес администратора, например Address("admin_address")
            customer: customer.address, // Укажите адрес клиента
            freelancer: freelancer.address, // Укажите адрес фрилансера
            amount: toNano('0.1'), // Сумма в виде 'bigint', например 1000n
        };
        //todo
        // const dealAddress = await mosaicDealFactory.getAddressOfChildren(info);
        mosaicDealContract = blockchain.openContract(
            await MosaicDealContract.fromInit(1n, admin.address, toNano('0.1'), customer.address, freelancer.address),
        );

        const startResult = await mosaicDealContract.send(
            customer.getSender(),
            {
                value: toNano('0.15'),
            },
            {
                $$type: 'Deposit',
                amount: toNano('0.15'),
            },
        );

        expect(startResult.transactions).toHaveTransaction({
            from: customer.address,
            to: mosaicDealContract.address,
            success: true,
        });

        expect(await mosaicDealContract.getIsActive()).toEqual(true);

        const freelancerBalanceBefore = await freelancer.getBalance();

        const finushResult = await mosaicDealContract.send(
            admin.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'AdminForceEnd',
                dealId: 1n,
                receiver: freelancer.address,
            },
        );

        expect(finushResult.transactions).toHaveTransaction({
            from: admin.address,
            to: mosaicDealContract.address,
            success: true,
        });

        const freelancerBalanceAfter = await freelancer.getBalance();
        expect(freelancerBalanceAfter).toBeGreaterThan(freelancerBalanceBefore);
        expect(await mosaicDealContract.getIsActive()).toEqual(false);
    });
});
