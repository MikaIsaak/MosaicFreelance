import { toNano } from '@ton/core';
import { MosaicDealFactory } from '../wrappers/MosaicDealFactory';
import { NetworkProvider } from '@ton/blueprint';
import { DealDetails, MosaicDealContract } from '../wrappers/MosaicDealContract';
import { console } from 'inspector';

export async function run(provider: NetworkProvider) {
    const adminWallet = provider.sender();
    const adminAddress = provider.sender().address!;

    const mosaicDealFactory = provider.open(await MosaicDealFactory.fromInit());

    await mosaicDealFactory.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(mosaicDealFactory.address);
    console.log(`MosaicDealFactory deployed at ${mosaicDealFactory.address}`);

    await mosaicDealFactory.send(
        adminWallet,
        {
            value: toNano('0.2'),
            bounce: undefined,
        },
        {
            $$type: 'DealDetails',
            id: 5n,
            amount: toNano('0.08'),
            admin: adminAddress,
            customer: adminAddress,
            freelancer: adminAddress,
        },
    );

    // const DealDetails: DealDetails = {
    //     $$type: 'DealDetails',
    //     id: 4n,
    //     amount: toNano('0.08'),
    //     admin: adminAddress,
    //     customer: adminAddress,
    //     freelancer: adminAddress,
    // };

    // await new Promise((resolve) => setTimeout(resolve, 15000));

    // console.log('Mosaic deal contract ', await mosaicDealFactory.getAddressOfChildren(DealDetails));
}
