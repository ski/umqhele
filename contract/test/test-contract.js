// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeIssuerKit } from '@agoric/ertp';

import { makeFakeVatAdmin } from '@agoric/zoe/src/contractFacet/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe';
import { makeLocalAmountMath } from '@agoric/ertp';
const mintAndSellNFTRoot = '../node_modules/@agoric/zoe/src/contracts/mintAndSellNFT';
const sellItemsRoot = '../node_modules/@agoric/zoe/src/contracts/sellItems';

test('zoe - mint payments', async (t) => {
  const zoe = makeZoe(makeFakeVatAdmin().admin);

  const mintAndSellNFTBundle = await bundleSource(mintAndSellNFTRoot);
  const mintAndSellNFTInstallation = await E(zoe).install(mintAndSellNFTBundle);

  const sellItemsBundle = await bundleSource(sellItemsRoot);
  const sellItemsInstallation = await E(zoe).install(sellItemsBundle);

  const { issuer: moolaIssuer, amountMath: moolaAmountMath } = makeIssuerKit(
    'moola',
  );

  const { creatorFacet: catalogEntryMaker } = await E(zoe).startInstance(
    mintAndSellNFTInstallation,
  );


  const itemProperties = {
    imageHash: 'this is a hash',
    showTime: 'a date and time',
    reservePrice: 9,
    startingBid: 3,
    auctionEndDate: 'a date and time'
  }
  // Some is publishing a auction catalog entry
  const { sellItemsCreatorSeat, sellItemsInstance } = await E(
    catalogEntryMaker,
  ).sellTokens({
    customValueProperties: {
      ...itemProperties
    },
    count: 1,
    moneyIssuer: moolaIssuer,
    sellItemsInstallation,
    pricePerItem: moolaAmountMath.make(1),
  });

  t.is(
    await sellItemsCreatorSeat.getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
    `escrowTicketsOutcome is default acceptance message`,
  );

  // const invitation = E(catalogEntryMaker).makeInvitation();

  // // Bob makes an offer using the invitation
  // const seat = await E(zoe).offer(invitation);

  // const paymentP = E(seat).getPayout('Token');

  // // Let's get the tokenIssuer from the contract so we can evaluate
  // // what we get as our payout
  // const publicFacet = await E(zoe).getPublicFacet(instance);
  // const tokenIssuer = await E(publicFacet).getTokenIssuer();
  // const amountMath = await makeLocalAmountMath(tokenIssuer);

  // const tokens1000 = await E(amountMath).make(1000);
  // const tokenPayoutAmount = await E(tokenIssuer).getAmountOf(paymentP);

  // // Bob got 1000 tokens
  // t.deepEqual(tokenPayoutAmount, tokens1000);
});
