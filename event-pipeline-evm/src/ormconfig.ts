import { ConnectionOptions } from 'typeorm';

import { POSTGRES_URI, SHOULD_SYNCHRONIZE } from './config';

import {
    Block,
    Transaction,
    TransactionLogs,
    TransactionReceipt,
    ParamsSetEvent,
    LastBlockProcessed,
    TransformedERC20Event,
    OneinchSwappedEvent,
    ParaswapSwappedEvent,
    SlingshotTradeEvent,
    NativeFill,
    V4LimitOrderFilledEvent,
    V4RfqOrderFilledEvent,
    ExpiredRfqOrderEvent,
    V4CancelEvent,
    ERC20BridgeTransferEvent,
} from './entities';

const entities = [
    Block,
    Transaction,
    TransactionLogs,
    TransactionReceipt,
    ParamsSetEvent,
    LastBlockProcessed,
    TransformedERC20Event,
    NativeFill,
    OneinchSwappedEvent,
    ParaswapSwappedEvent,
    SlingshotTradeEvent,
    V4LimitOrderFilledEvent,
    V4RfqOrderFilledEvent,
    ExpiredRfqOrderEvent,
    V4CancelEvent,
    ERC20BridgeTransferEvent,
];

const config: ConnectionOptions = {
    type: 'postgres',
    url: POSTGRES_URI,
    synchronize: SHOULD_SYNCHRONIZE,
    logging: ['error'],
    entities,
    migrations: ['lib/migrations/*.js'],
    migrationsTableName: 'evm_event_pipeline_migrations',
};

module.exports = config;
