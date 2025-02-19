import { Column, PrimaryColumn } from 'typeorm';

import { numberToBigIntTransformer } from '../transformers';

// Transaction Receipt Logs for storage
export abstract class TransactionLogs {
    // When the event was scraped
    @Column({ name: 'observed_timestamp', type: 'bigint', transformer: numberToBigIntTransformer })
    public observedTimestamp!: number;
    // hash of the transaction
    @PrimaryColumn({ name: 'transaction_hash', type: 'varchar' })
    public transactionHash!: string;
    // Logs from the transaction receipt
    @Column({ name: 'logs', type: 'varchar' })
    public logs!: string;
}
