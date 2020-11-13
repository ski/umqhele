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

  // bundle, install the auction contract
  // ISSUE / TODO: let caller supply the installation?
  const auctionInstallation = await E(zoe).install(
    await bundleSource(
      require.resolve('@agoric/zoe/src/contracts/auction/secondPriceAuction'),
    ),
  );

  // Let's create a fungible token (1) to pay for catalog entries and
  // (2) to bid on video streams.
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    amountMath: { make: moola },
  } = makeIssuerKit('moola');

  const {
    creatorFacet,
    creatorInvitation,
    publicFacet: videoService,
  } = await E(zoe).startInstance(
    installation,
    { Money: moolaIssuer },
    { pricePerItem: 2 },
  );

  // Bob opens the catalog and establishes his
  // seat for trading listings for money.
  creatorFacet.setAuctionContract(auctionInstallation);
  const sellerSeat = zoe.offer(creatorInvitation);

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
  // house has 2 moola
  const bobStuff = await E(sellerSeat).getCurrentAllocation();
  t.is(bobStuff.Money.value, 2);

  // issue: we're bothering Alice a 2nd time during the "publish" step.
  // to approve this offer.
  const aliceAuctionSellOffer = harden({
    want: { Ask: moola(9) }, // reserve price
    give: { Asset: show1 },
    // hm. https://github.com/Agoric/agoric-sdk/blob/master/packages/zoe/test/unitTests/contracts/test-secondPriceAuction.js#L49
    exit: { waived: null },
  });
  const aliceSellInvitation = await videoService.makeAuctionSellerInvitation();
  console.log({ aliceSellInvitation });
  const aliceSellSeat = zoe.offer(
    aliceSellInvitation,
    aliceAuctionSellOffer,
    harden({ Asset: gains }),
  );
  // show1 NFT is escrowed.
  const makeBidInvitationObj = await E(aliceSellSeat).getOfferResult();

  const evePurse = moolaIssuer.makeEmptyPurse();
  evePurse.deposit(moolaMint.mintPayment(moola(50)));
  const eveBidPmt = evePurse.withdraw(moola(20));

  const eveOffer = harden({
    give: { Bid: moola(20) },
    want: { Asset: show1 },
  });
  // ISSUE: how does this makeBidInvitationObj get from Alice to Eve? Bob should have it.
  const eveInvitation = E(makeBidInvitationObj).makeBidInvitation();
  zoe.offer(eveInvitation, eveOffer, harden({ Bid: eveBidPmt }));

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
