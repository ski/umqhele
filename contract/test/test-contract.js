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


  let itemProperties = {
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


  const ticketIssuerP = E(catalogEntryMaker).getIssuer();
  const ticketBrand = await E(ticketIssuerP).getBrand();
  const ticketSalesPublicFacet = await E(zoe).getPublicFacet(sellItemsInstance);
  const ticketsForSale = await E(ticketSalesPublicFacet).getAvailableItems();
  t.deepEqual(
    ticketsForSale,
    {
      brand: ticketBrand,
      value: [
        {
          imageHash: 'this is a hash',
          showTime: 'a date and time',
          reservePrice: 9,
          startingBid: 3,
          number: 1,
          auctionEndDate: 'a date and time'
        }
      ],
    },
    `the catalog item is now open for bids`,
  );

  itemProperties = {
    imageHash: 'this is a hash e',
    showTime: 'a date and time s',
    reservePrice: 3,
    startingBid: 1,
    auctionEndDate: 'as a date and time'
  }

  const { sellItemsInstance: sellItemsInstance2 } = await E(
    catalogEntryMaker,
  ).sellTokens({
    customValueProperties: {
      ...itemProperties
    },
    count: 1,
    moneyIssuer: moolaIssuer,
    sellItemsInstallation,
    pricePerItem: moolaAmountMath.make(20),
  });
  const sellItemsPublicFacet2 = await E(zoe).getPublicFacet(sellItemsInstance2);
  const ticketsForSale2 = await E(sellItemsPublicFacet2).getAvailableItems();

  t.deepEqual(
    ticketsForSale2,
    {
      brand: ticketBrand,
      value: [
        {
          imageHash: 'this is a hash e',
          showTime: 'a date and time s',
          reservePrice: 3,
          number: 1,
          startingBid: 1,
          auctionEndDate: 'as a date and time'
              }
      ],
    },
    `we can reuse the mint to add more catalog entries and open them for bidding`,
  );

});
