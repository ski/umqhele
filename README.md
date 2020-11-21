# UMQHELE
Umqhele is an application that allows your to auction and trade NTF tokens that grant access to live video streams. It allows you to auction live video streams for Moola. You can create auctions as well as bid on them. This dapp demonstrates Agoric contract composition, offer safety and object capabilities.

#### Installing Prerequisites
Ensure agoric is installed and working before running Umqhele. You can find details of how to setup Agoric here [gs]: https://agoric.com/documentation/getting-started/start-a-project.html .

Unqhele uses ion-fsu for its video. In order to run ion-fsu, you will have to install Golang. You can download and install it from *[Go](https://golang.org/doc/install)*. Once that is done. You can following the instructions found on the ion-sfu readme page to install and run it *[ion-sfu](https://github.com/pion/ion-sfu)*.

#### Umqhele Installation
 It uses Vue.js 3 as its framework and Bulma components for its UI styling. In order to run it, first ensure you acn [start up Agoric][gs] correctly. Then follow the steps below.
```bash
$ git clone https://github.com/ski/umqhele.git
$ cd umqhele
$ agoric install
# start agoric in a different terminal by running agoric start --reset.
# deploy the umqhele contract
$ agoric deploy contract/deploy.js
# deploy the umqhele api
$ agoric deploy api/deploy.js
# install and start the umqhele dapp ui
$ cd ui
$ rm -rf node_modules
$ yarn install
# start the ui
$ yarn dev
# start the agoric wallet in another terminal. 
$ agoric open
# The above command should open the Agoric wallet in your default browser. 
```
You then be able to open the Umqhele home page at http://localhost:3000/. The UI will present you with a blank page. You have to hit the 'power' button to connect to wallet and install the dapp in your wallet. When you click on the power button, change to the Agoric wallet UI and enable the dapp. Then you can shift back to the dapp UI and click on the '+' icon to create an NFT token proposal. In the current itereation, the form is pre-populated with random but suitable values so you can just click on 'Save Auction'. This will send a proposal to the Wallet. You have to change back to the wallet and accept the offer. When you accept the offer, the token will be added to the your Wallet and the mint will charge you 2 moolas for the operation. The token will also appear in your dapp ui. 

You now have the option to 'Publish' the NFT token the the Dapp's auction catalogue inviting users to bid on the token in exchange for moolas. Winning the auction will cause your winning bid worth of Moolas to be escrowed till the online video event is concluded.

#### Todo
The auction flow and the actual online video event remains to be completed.
