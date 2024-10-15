import { toNano } from '@ton/core';
import { MosaicFactory } from '../wrappers/MosaicFactory';
import { NetworkProvider } from '@ton/blueprint';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';

export async function run(provider: NetworkProvider) {
    const mosaicFactory = provider.open(await MosaicFactory.fromInit());
    const mosaicDealContract = provider.open(
        await MosaicDealContract.fromInit(
            '1',
            toNano('0.05'),
            provider.sender().address!,
            provider.sender().address!,
            provider.sender().address!,
        ),
    );

    await mosaicFactory.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(mosaicFactory.address);

    await new Promise((resolve) => setTimeout(resolve, 20000));

    await mosaicFactory.send(
        provider.sender(),
        {
            value: toNano('0.01'),
        },
        {
            $$type: 'CreateDeal',
            id: '1',
            amount: toNano('0.05'),
            customer: provider.sender().address!,
            admin: provider.sender().address!,
            freelancer: provider.sender().address!,
        },
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));

    console.log(
        await mosaicFactory.getAddressOfChildren({
            $$type: 'CreateDeal',
            id: '1',
            amount: toNano('0.05'),
            customer: provider.sender().address!,
            admin: provider.sender().address!,
            freelancer: provider.sender().address!,
        }),
    );

    await mosaicDealContract.send(
        provider.sender(),
        {
            value: toNano('0.06'),
        },
        {
            $$type: 'Deposit',
            amount: toNano('0.06'),
        },
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));

    console.log(await mosaicDealContract.getAdmin());
    console.log(await mosaicDealContract.getId());
    console.log(await mosaicDealContract.getIsActive());
}
