import { Address, fromNano, toNano } from '@ton/core';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const admin: Address = provider.sender().address!;
    const adminWallet = provider.sender();
    const mosaicDealContract = provider.open(
        await MosaicDealContract.fromInit('10', toNano('0.005'), admin, admin, admin),
    );

    // console.log(mosaicDealContract.address);

    // await mosaicDealContract.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.5'),
    //     },
    //     {
    //         $$type: 'Deploy',
    //         queryId: 0n,
    //     },
    // );

    // await provider.waitForDeploy(mosaicDealContract.address);

    // await new Promise((resolve) => setTimeout(resolve, 20000));

    const result = await mosaicDealContract.getAdmin();
    console.log(`Admin address: ${result}`);

    // const DepositResult = await mosaicDealContract.send(
    //     adminWallet,
    //     {
    //         value: toNano('0.05'),
    //     },
    //     {
    //         $$type: 'Deposit',
    //         amount: toNano('0.005'),
    //     },
    // );

    // await new Promise((resolve) => setTimeout(resolve, 20000));

    const isActive = await mosaicDealContract.getIsActive();
    console.log(`Contract is active: ${isActive}`);

    console.log('Customer ', await mosaicDealContract.getCustomer());
    console.log('deal id ', await mosaicDealContract.getId());

    const finishDeal = await mosaicDealContract.send(
        adminWallet,
        {
            value: toNano('0.02'),
        },
        {
            $$type: 'FinishDeal',
            id: '10',
        },
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));

    const isActive1 = await mosaicDealContract.getIsActive();
    console.log(`Contract is active: ${isActive1}`);
}
