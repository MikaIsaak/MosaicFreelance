import { Address, fromNano, toNano } from '@ton/core';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const admin: Address = provider.sender().address!;
    const adminWallet = provider.sender();
    const mosaicDealContract = provider.open(
        await MosaicDealContract.fromInit(1n, toNano('0.05'), admin, admin, admin),
    );

    console.log(mosaicDealContract.address);

    await mosaicDealContract.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(mosaicDealContract.address);
    console.log(`MosaicDealContract deployed at ${mosaicDealContract.address}`);

    const result = await mosaicDealContract.getAdmin();
    console.log(`Admin address: ${result}`);

    const isActive = await mosaicDealContract.getIsActive();
    console.log(`Contract is active: ${isActive}`);

    const DepositResult = await mosaicDealContract.send(
        adminWallet,
        {
            value: toNano('0.005'),
        },
        {
            $$type: 'Deposit',
            amount: toNano('0.0005'),
        },
    );

    // console.log('Deal is active ', await mosaicDealContract.getIsActive());
}
