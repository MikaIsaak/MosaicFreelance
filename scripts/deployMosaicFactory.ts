import { Address, toNano } from '@ton/core';
import { MosaicFactory } from '../wrappers/MosaicFactory';
import { NetworkProvider } from '@ton/blueprint';
import { MosaicDealContract } from '../wrappers/MosaicDealContract';
import TonWeb from 'tonweb';
import { ContractProvider } from '@ton/core';
import { TonClient } from '@ton/ton';

export async function run(provider: NetworkProvider) {
    // const mosaicFactory1 = await MosaicFactory.fromInit();
    // console.log(mosaicFactory1.address);

    console.log(
        (
            await MosaicDealContract.fromInit(
                '4',
                toNano('0.15'),
                Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
                Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
                Address.parse('UQAuvsxxbG7SAFytUaS7ZXjJ90OBX8A9b9ZFc28nfQxjDz-D'),
            )
        ).address,
    );

    const mosaicFactory = provider.open(await MosaicFactory.fromInit());
    const mosaicDealContract = provider.open(
        await MosaicDealContract.fromInit(
            '4',
            toNano('0.15'),
            Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            Address.parse('UQAuvsxxbG7SAFytUaS7ZXjJ90OBX8A9b9ZFc28nfQxjDz-D'),
        ),
    );

    await mosaicFactory.send(
        provider.sender(),
        {
            value: toNano('0.1'),
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
            value: toNano('0.2'),
        },
        {
            $$type: 'CreateDeal',
            id: '4',
            amount: toNano('0.15'),
            customer: Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            admin: Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            freelancer: Address.parse('UQAuvsxxbG7SAFytUaS7ZXjJ90OBX8A9b9ZFc28nfQxjDz-D'),
        },
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));

    console.log(
        await mosaicFactory.getAddressOfChildren({
            $$type: 'CreateDeal',
            id: '4',
            amount: toNano('0.15'),
            customer: Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            admin: Address.parse('EQC45pmsJGhG3v0W9JkFi4iwL_H_OKNdA6b0soXuIyNg0KtD'),
            freelancer: Address.parse('UQAuvsxxbG7SAFytUaS7ZXjJ90OBX8A9b9ZFc28nfQxjDz-D'),
        }),
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));

    console.log(await mosaicDealContract.getFreelancer());

    // await mosaicDealContract.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.06'),
    //     },
    //     {
    //         $$type: 'Deposit',
    //         amount: toNano('0.06'),
    //     },
    // );

    // await new Promise((resolve) => setTimeout(resolve, 20000));

    // console.log(await mosaicDealContract.getAdmin());
    // console.log(await mosaicDealContract.getId());
    // console.log(await mosaicDealContract.getIsActive());
}
