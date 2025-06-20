---
title: Bitpiece
appId: bitpiece
authors:
- danny
released: 2016-07-03
discontinued: 
updated: 
version: 
binaries: 
dimensions: 
weight: 
provider: miffman
providerWebsite: 
website: https://bitcointalk.org/index.php?topic=1537080.0
shop: 
country: US
price: 
repository: https://github.com/jondale/serpcoin
issue: 
icon: bitpiece.png
bugbounty: 
meta: obsolete
verdict: prefilled
date: 2022-05-19
signer: 
twitter: 
social:
- https://bitcointalk.org/index.php?action=profile;u=83038
features: 

---

## Background 

From this [page:](https://bitcointalk.org/index.php?topic=1537080.0)

> Mintage:
> 
> - Brass w/o plating: 100 (numbered 001-100)
> - Brass w/ silver plating: 10 (numbered 01-10) SOLD OUT
> - Brass w/ gold plating: 5 (numbered 1-5) SOLD OUT
>
> Keys and key generation
>
> The coin features a custom security anti-counterfeit hologram that secures the private key. Private keys were generated with the serpcoin software (https://github.com/jondale/serpcoin) which was modified in various ways in order to fit the coin and coin requirements. The exact code I used will be uploaded as an attachment. The private key generation was done on a fresh ubuntu install. It was done as follows:
> 
> Bitpiece Obverse cluster-The serpcoin software prerequisits were installed and the software was downloaded
> - Some of the scripts were modified as follows (not exactly in this order):
> - removed the label section of the front part of the key entirely
> - inverted the colours of the text and background of the first address characters
> - added several iterations of the first address characters, one below the next (the character string may be replaced with the string “EMPTY!!!”)
> - removed the coin name and numbering from the label
> - removed the private key in mini private key format along with the coin name and label entirely
> - the config was changed to fit the size of the coin ****
> - labels were then generated offline
> - labels were printed on a dumb offline printer
> - scrub.sh script was run
> - Private keys are cut and are safely stored waiting for assembly.
> - The fresh install of ubuntu was then destroyed.
>
> - No private keys or private key information was stored.
>
> The modified software leaves a label with several iterations of the first characters of the address on the front and a QR code of the private key in Base58 Wallet Import format on the back. (i.e. Private keys start with the number 5) Note that the files MiniKey.py, scCopyAddress.php, run.sh and scrub.sh was not modified in any way.

## Funded and Unfunded Coins 

> All coins will either be funded or unfunded.
>
> Funded coins
> 
> Funded coins will have will the first 6-8 characters displayed through the hologram window. To purchase a funded coin, please let me know that you would like your coin to be funded and send over the funding amount with along with the cost per coin as stated above. The full amount including funded will need to be received (or escrowed) or the coin will not be shipped. Coins will be funded after you receive them.
>
> A signed list of addresses for funding will be posted. To avoid any ambiguity that might be present in the first few characters of an address, I've written a java program that checks the first n characters of a list of addresses that would be generated by the serpcoin generator. The addresses I am using for funding all have unique first four characters. The program runs solely on the output file 'addr.sav' created by the serpcoin key generator.
>
> Unfunded coins
>
> Unfunded coins will have the text "EMPTY!!!" displaying through the window
of the hologram. Should you wish to fund your coin at some point, I will have a separate PGP signed list of the address corresponding to each coin via it's coin number. This will be updated as coins are assembled.

## Video Review 

<iframe width="560" height="315" src="https://www.youtube.com/embed/BaDtq4aL0Go" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Analysis 

The creators aver that the coins' private keys are created using serpcoin: 

> Private keys were generated with the serpcoin software (https://github.com/jondale/serpcoin)

The repository shows that the last commit was made on [January 12, 2014](https://github.com/jondale/serpcoin/commit/5f6984bfbe529f7858a11734f8724c5749043f21).

This is a very old project and no longer produced. Like in most of these coin-type bearer tokens, a huge amount of trust has to be placed on the provider. *Simply claiming that "no private keys or private key information was stored" is, in our own humble opinion, insufficient.*  

