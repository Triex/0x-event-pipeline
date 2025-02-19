const abiCoder = require('web3-eth-abi');
import { RawLogEntry } from 'ethereum-types';
import { OneinchSwappedEvent } from '../../entities';
import { parseEvent } from './parse_event';
import { ONEINCH_SWAPPED_ABI } from '../../constants';
import { BigNumber } from '@0x/utils';

export function parseOneinchSwappedEvent(eventLog: RawLogEntry): OneinchSwappedEvent {
    const oneinchSwappedEvent = new OneinchSwappedEvent();

    parseEvent(eventLog, oneinchSwappedEvent);

    const decodedLog = abiCoder.decodeLog(ONEINCH_SWAPPED_ABI.inputs, eventLog.data, []);

    oneinchSwappedEvent.from = decodedLog.sender.toLowerCase();
    oneinchSwappedEvent.to = decodedLog.dstReceiver.toLowerCase();
    oneinchSwappedEvent.fromToken = decodedLog.srcToken.toLowerCase();
    oneinchSwappedEvent.toToken = decodedLog.dstToken.toLowerCase();
    oneinchSwappedEvent.fromTokenAmount = new BigNumber(decodedLog.spentAmount);
    oneinchSwappedEvent.toTokenAmount = new BigNumber(decodedLog.returnAmount);

    return oneinchSwappedEvent;
}
