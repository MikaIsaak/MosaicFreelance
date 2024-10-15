import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/mosaic_factory.tact',
    options: {
        debug: true,
    },
};
