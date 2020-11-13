// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';
import { E } from '@agoric/eventual-send';
import { makeIssuerKit, makeLocalAmountMath } from '@agoric/ertp';
import { makeFakeVatAdmin } from '@agoric/zoe/src/contractFacet/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe';
import { defaultAcceptanceMsg } from '@agoric/zoe/src/contractSupport';

const contractPath = `${__dirname}/../src/contract`;

test('tokenized video', async (t) => {
  const zoe = makeZoe(makeFakeVatAdmin().admin);

  // bundle, install the contract
  const bundle = await bundleSource(contractPath);
  const installation = await E(zoe).install(bundle);

  // Let's create a fungible token (1) to pay for catalog entries and
  // (2) to bid on video streams.
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    amountMath: { make: moola },
  } = makeIssuerKit('moola');

  const { creatorInvitation, publicFacet: videoService } = await E(
    zoe,
  ).startInstance(installation, { Money: moolaIssuer }, { pricePerItem: 2 });

  // Bob opens the catalog and establishes his
  // seat for trading listings for money.
  const sellerSeat = zoe.offer(creatorInvitation, harden({}));

  /** @type { Issuer } */
  const listingIssuer = videoService.getIssuer();
  const listing = await makeLocalAmountMath(listingIssuer);

  const show1 = listing.make(
    harden([
      {
        title: 'Learn to build smart contracts',
        showTime: Date.parse('2020-11-30 14:00:00'),
        // these don't go in the amountmath, do they?
        auctionEndDate: Date.parse('2020-11-16 14:00:00'),
        reservePrice: 9,
        startingBid: 3,
      },
    ]),
  );

  const fee = moolaMint.mintPayment(moola(2));
  const AliceListingOffer = harden({
    want: { Items: show1 },
    give: { Money: moola(2) }, // cheap to list
  });

  const invitation1 = videoService.makeListingInvitation();

  const seat1 = zoe.offer(
    invitation1,
    AliceListingOffer,
    harden({ Money: fee }),
  );

  // yay! offers match. rights are exchanged.
  // house has 2 moola
  const bobStuff = await E(sellerSeat).getCurrentAllocation();
  t.is(bobStuff.Money.value, 2);
  // Alice has a listing token.
  t.is(await E(seat1).hasExited(), true, 'listing seat has exited');
  const gains = E(seat1).getPayout('Items');
  const actual = await listingIssuer.getAmountOf(gains);
  t.deepEqual(actual.value, [
    {
      auctionEndDate: 1605556800000,
      reservePrice: 9,
      showTime: 1606766400000,
      startingBid: 3,
      title: 'Learn to build smart contracts',
    },
  ]);

  // issue: we're bothering Alice a 2nd time during the "publish" step.
  // to approve this offer.
  const AliceAuctionSellOffer = {
    want: { ReservePrice: moola(9) }, // reserve price
    give: { Detail: show1 },
  };
  // show1 NFT is escrowed.

  const EveOffer = {
    give: { Bid: moola(20) },
    want: { Detail: show1 },
  };

  // auction concludes...
  // losing bids exit with refunds.
  // Eve's offer remains escrowed, as does Alice's.

  // Eve won the auction; if she exits early,
  // that's against "the rules" and she loses reputation or whatever.
  // (see governance TBD)

  // show happens
  // show end time timer fires.
  // (or: Eve says "I'm satisfied".)
  // rights are exchanged
  // Alice gets 9 moola
  // Eve gets an "I was there when!" NFT.
});

async function XXX() {
  // ////////////////// throw away the rest???

  // Also install the sellItems contract from agoric-sdk
  const sellItemsBundle = await bundleSource(
    require.resolve('@agoric/zoe/src/contracts/sellItems'),
  );
  const sellItemsInstallation = await E(zoe).install(sellItemsBundle);

  // TODO: base these on publication requests
  const initialEntryDescriptions = harden([
    {
      title: 'Learn to build smart contracts',
      showTime: Date.parse('2020-11-30 14:00:00'),
      // these don't go in the amountmath, do they?
      auctionEndDate: Date.parse('2020-11-16 14:00:00'),
      reservePrice: 9,
      startingBid: 3,
    },
    { title: 'cute kittens' },
  ]);
  const moneyIssuer = moolaIssuer;
  const pricePerEntry = moola(10);

  // offer to sell some initial entries
  const {
    sellItemsCreatorSeat,
    sellItemsCreatorFacet,
    sellItemsPublicFacet,
    sellItemsInstance,
  } = await E(catalogEntrySellerFacet).sellItems(
    initialEntryDescriptions,
    moneyIssuer,
    sellItemsInstallation,
    pricePerEntry,
  );

  const bobInvitation = E(sellItemsCreatorFacet).makeBuyerInvitation();

  // Bob buys his own baseball card

  const cardIssuer = await E(sellItemsPublicFacet).getItemsIssuer();
  const cardMath = await makeLocalAmountMath(cardIssuer);

  const cardsForSale = await E(sellItemsPublicFacet).getAvailableItems();
  t.deepEqual(cardsForSale, cardMath.make(initialEntryDescriptions));

  const terms = await E(zoe).getTerms(sellItemsInstance);

  // make the corresponding amount
  const bobCardAmount = cardMath.make(
    harden(initialEntryDescriptions.slice(0, 1)),
  );

  const bobProposal = harden({
    give: { Money: terms.pricePerItem },
    want: { Items: bobCardAmount },
  });

  const bobPaymentKeywordRecord = harden({
    Money: moolaMint.mintPayment(moola(10)),
  });

  const seat = await E(zoe).offer(
    bobInvitation,
    bobProposal,
    bobPaymentKeywordRecord,
  );
  const bobCardPayout = seat.getPayout('Items');
  const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);

  t.deepEqual(
    bobObtained,
    cardMath.make(harden(initialEntryDescriptions.slice(0, 1))),
    'Bob bought his own baseball card!',
  );

  // That's enough selling for now, let's take our inventory back

  E(sellItemsCreatorSeat).tryExit();

  const moneyPayment = await E(sellItemsCreatorSeat).getPayout('Money');
  const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  t.deepEqual(moneyEarned, moola(10));

  const cardInventory = await E(sellItemsCreatorSeat).getPayout('Items');
  const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  t.deepEqual(
    inventoryRemaining,
    cardMath.make(harden(initialEntryDescriptions.slice(1, 2))),
  );
}
