import { ZERO_ADDRESS } from "../libs/const";
import { Noren, NorenHolder, NorenRank } from "../types"; // 修正: NorenRankをインポート
import type { TransferSingleLog } from "../types/abi-interfaces/NOREN";

export const handleTransferSingleLog = async (
  log: TransferSingleLog
): Promise<void> => {
  if (!log.args) return;
  const contractAddress = log.address;
  const tokenId = log.args.id;
  const norenId = contractAddress + tokenId;
  const shopId = Number(tokenId.toString().slice(1));
  const rankId = Number(tokenId.toString().slice(0, 1));
  const amount = log.args.value.toNumber();
  const from = log.args.from;
  const to = log.args.to;

  let noren = await Noren.get(norenId);
  if (!noren) {
    noren = Noren.create({
      id: norenId,
      contractAddress: log.address,
      tokenId: log.args.id.toNumber(),
      shopId,
      rankId,
      currentSupply: 1,
      metadataUri: `https://metadata.noren.dev.sarah30.com/${tokenId}.json`,
      owners: [to],
      amounts: [amount],
    });
    await noren.save();
    return;
  }

  // If the transfer is minting a new Noren, increase the current supply
  if (from === ZERO_ADDRESS) {
    noren.currentSupply = Number(noren.currentSupply) + Number(amount);
    await noren.save();
  } else {
    const index = noren.owners.indexOf(from);
    if (Number(noren.amounts[index]) - Number(amount) === 0) {
      noren.owners.splice(index, 1);
      noren.amounts.splice(index, 1);
    }
  }

  const index = noren.owners.indexOf(to);
  if (index === -1) {
    // If the receiver is a new owner, add them to the end of owners/amounts array
    noren.owners.push(to);
    noren.amounts.push(amount);
  } else {
    noren.amounts[index] = noren.amounts[index] + amount;
  }
  await noren.save();
};

export const handleNorenHolder = async (log: TransferSingleLog) => {
  if (!log.args) return;
  const norenId = log.address + log.args.id.toString();
  const norenReceinverId = log.args.to + norenId;
  const norenReceiver = await NorenHolder.get(norenReceinverId);
  if (!norenReceiver && log.args.to !== ZERO_ADDRESS) {
    const newNorenReceiver = NorenHolder.create({
      id: norenReceinverId,
      account: log.args.to,
      norenId,
      amount: log.args.value.toNumber(),
    });
    await newNorenReceiver.save();
  }

  const norenSenderId = log.args.from + norenId;
  const norenSender = await NorenHolder.get(norenSenderId);
  if (!norenSender || log.args.from !== ZERO_ADDRESS) return;
  norenSender.amount -= log.args.value.toNumber();
  await norenSender.save();
};
