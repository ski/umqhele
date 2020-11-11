// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, MathKind } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';

/**
 * Tokenized Video Stream contract
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  // Create the internal catalog entry mint
  const { issuer, mint, amountMath: entryMath } = makeIssuerKit(
    'catalog entries',
    MathKind.SET,
  );

  const zoeService = zcf.getZoeService();

  const sellItems = async (
    newCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  ) => {
    const newCardsForSaleAmount = entryMath.make(harden(newCardNames));
    const allCardsForSalePayment = mint.mintPayment(newCardsForSaleAmount);
    // Note that the proposal `want` is empty because we don't know
    // how many cards will be sold, so we don't know how much money we
    // will make in total.
    // https://github.com/Agoric/agoric-sdk/issues/855
    const proposal = harden({
      give: { Items: newCardsForSaleAmount },
    });
    const paymentKeywordRecord = harden({ Items: allCardsForSalePayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const sellItemsTerms = harden({
      pricePerItem: pricePerCard,
    });
    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(sellItemsInstallation, issuerKeywordRecord, sellItemsTerms);
    const sellItemsCreatorSeat = await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );
    return harden({
      sellItemsCreatorSeat,
      sellItemsCreatorFacet: creatorFacet,
      sellItemsInstance: instance,
      sellItemsPublicFacet: publicFacet,
    });
  };

  const creatorFacet = harden({ sellItems, getIssuer: () => issuer });

  return harden({ creatorFacet });
};

harden(start);
export { start };
