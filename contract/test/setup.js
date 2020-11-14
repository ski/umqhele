import { makeIssuerKit } from '@agoric/ertp';
import { makeFakeVatAdmin } from '@agoric/zoe/src/contractFacet/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe/src/zoeService/zoe';
import buildManualTimer from './manualTimer';

/**
 * stuff that is already on chain before our app comes along.
 */
const setupMixed = () => {
  const {
    issuer: moolaIssuer,
    mint: moolaMint,
    amountMath: { make: makeMoola },
  } = makeIssuerKit('moola');

  const timer = buildManualTimer(console.log);
  const zoe = makeZoe(makeFakeVatAdmin().admin);
  return {
    zoe,
    timer,
    moolaIssuer,
    moolaMint,
    makeMoola,
  };
};

harden(setupMixed);
export { setupMixed };
