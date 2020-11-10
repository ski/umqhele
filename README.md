# UMQHELE

Umqhele is the user interface layer for the Agoric Hack The Orb project. It uses Vue.js 3 as its framework and Bulma components for its UI styling. In order to run it, first ensure you acn start up Agoric correctly. Then follow the steps below.
```bash
$ git clone https://github.com/ski/umqhele.git
$ cd umqhele
$ yarn
$ yarn dev
```
You then be able to open the Umqhele home page at http://localhost:3000/. The app initialises the underlying CAPT and Websocket plumbing on page load. However, in order to get the application rolling, you will have to click the power switch displayed in the home page navigation. If everything works, the page will then display the three purses installed on the Agoric wallet. Please note that the CAPT endpoint URL is hard coded to be ``` 'ws://127.0.0.1:8000/private/captp?accessToken=zYd7mBI7EUHf0b8gzCdIiIQu7cL5w0DncRVZU0F8jJo9lki94j_WPapukEfDAfIz' ``` in lib/capt.js. You will have to change this if you are receiving a CONNECTION REFUSED error. 

###### Installing Prerequisite
Unqhele uses ion-fsu for its video. In order to run ion-fsu, you will have to install Golang. You can download and install it from *[Go](https://golang.org/doc/install)*. Once that is done. You can following the instructions found on the ion-sfu readme page to install and run it *[ion-sfu](https://github.com/pion/ion-sfu)*.
