import { BigNumber } from '@0x/utils';
import { Column } from 'typeorm';

import { Event } from './event';
import { bigNumberTransformer } from '../transformers';

// Emitted whenever an `RfqOrder` is filled.
export abstract class V4RfqOrderFilledEvent extends Event {
    @Column({ name: 'order_hash', type: 'varchar' })
    public orderHash!: string;
    @Column({ name: 'maker', type: 'varchar' })
    public maker!: string;
    @Column({ name: 'taker', type: 'varchar' })
    public taker!: string;
    @Column({ name: 'maker_token', type: 'varchar' })
    public makerToken!: string;
    @Column({ name: 'taker_token', type: 'varchar' })
    public takerToken!: string;
    @Column({ name: 'taker_token_filled_amount', type: 'numeric', transformer: bigNumberTransformer })
    public takerTokenFilledAmount!: BigNumber;
    @Column({ name: 'maker_token_filled_amount', type: 'numeric', transformer: bigNumberTransformer })
    public makerTokenFilledAmount!: BigNumber;
    @Column({ name: 'pool', type: 'varchar' })
    public pool!: string;
}
