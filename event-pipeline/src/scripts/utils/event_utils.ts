import { logger } from '@0x/pipeline-utils';
import { Connection } from 'typeorm';

import { FIRST_SEARCH_BLOCK, MAX_BLOCKS_TO_SEARCH, START_BLOCK_OFFSET } from '../../config';
import { LastBlockProcessed } from '../../entities';
import { LogWithDecodedArgs } from '@0x/dev-utils';

export class PullAndSaveEvents {
    public async getParseSaveContractWrapperEventsAsync<ARGS, EVENT>(
        connection: Connection,
        latestBlockWithOffset: number,
        eventName: string,
        tableName: string,
        getterFunction: (startBlock: number, endBlock: number) => Promise<LogWithDecodedArgs<ARGS>[] | null>,
        parser: (decodedLog: LogWithDecodedArgs<ARGS>) => EVENT,
    ): Promise<void> {
        const startBlock = await this._getStartBlockAsync(eventName, connection, latestBlockWithOffset);
        const endBlock = Math.min(latestBlockWithOffset, startBlock + (MAX_BLOCKS_TO_SEARCH - 1));

        logger
            .child({ eventName, startBlock, endBlock, lag: latestBlockWithOffset - startBlock, type: 'BLOCK_LAG' })
            .info(`Searching for events`);
        const eventLogs = await getterFunction(startBlock, endBlock);

        if (eventLogs === null) {
            logger
                .child({ eventName })
                .info(`Encountered an error searching for events. Waiting until next iteration.`);
        } else {
            const parsedEventLogs = eventLogs.map(log => parser(log));
            const lastBlockProcessed: LastBlockProcessed = await this._lastBlockProcessedAsync(eventName, endBlock);

            logger.child({ count: parsedEventLogs.length, eventName }).info(`Saving events`);

            await this._deleteOverlapAndSaveAsync<EVENT>(
                connection,
                parsedEventLogs,
                startBlock,
                endBlock,
                tableName,
                lastBlockProcessed,
            );
        }
    }

    private async _lastBlockProcessedAsync(eventName: string, endBlock: number): Promise<LastBlockProcessed> {
        const lastBlockProcessed = new LastBlockProcessed();
        lastBlockProcessed.eventName = eventName;
        lastBlockProcessed.lastProcessedBlockNumber = endBlock;
        lastBlockProcessed.processedTimestamp = new Date().getTime();
        return lastBlockProcessed;
    }

    private async _getStartBlockAsync(
        eventName: string,
        connection: Connection,
        latestBlockWithOffset: number,
    ): Promise<number> {
        const queryResult = await connection.query(
            `SELECT last_processed_block_number FROM events.last_block_processed WHERE event_name = '${eventName}'`,
        );

        logger
            .child({ last_processed_block_number: queryResult[0].last_processed_block_number || 0, eventName })
            .info(`Last processed block number for ${eventName}`);
        const lastKnownBlock = queryResult[0] || { last_processed_block_number: FIRST_SEARCH_BLOCK };

        return Math.min(
            Number(lastKnownBlock.last_processed_block_number) + 1,
            latestBlockWithOffset - START_BLOCK_OFFSET,
        );
    }

    private async _deleteOverlapAndSaveAsync<T>(
        connection: Connection,
        toSave: T[],
        startBlock: number,
        endBlock: number,
        tableName: string,
        lastBlockProcessed: LastBlockProcessed,
    ): Promise<void> {
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();
        try {
            // delete events scraped prior to the most recent block range
            await queryRunner.manager.query(
                `DELETE FROM events.${tableName} WHERE block_number >= ${startBlock} AND block_number <= ${endBlock}`,
            );
            await queryRunner.manager.save(toSave);
            await queryRunner.manager.save(lastBlockProcessed);

            // commit transaction now:
            await queryRunner.commitTransaction();
        } catch (err) {
            logger.error(err);
            // since we have errors lets rollback changes we made
            await queryRunner.rollbackTransaction();
        } finally {
            // you need to release query runner which is manually created:
            await queryRunner.release();
        }
    }
}
