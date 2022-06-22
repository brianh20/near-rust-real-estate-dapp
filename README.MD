# Real Estate dApp

Before you continue, keep in mind that this project is connected to our working example by default.
If you deploy your own contract `(./contract/README.MD)` you will need to update `./src/config.js` accordingly.

This is a dApp where users can:
* Post an investment on a property
* Invest in a property
* Rent a funded property

NOTE: Since this is a POC the "platform" does not keep any currency from the transaction.
NOTE: Everything mentioned as free has a gas cost.
NOTE: You will find the code says `rentor` but it refers to the `rentee`

# Parts

This project has two parts. Each has its own README

- NEAR Smart contract in the `/contract` folder. Readme explains how to deploy and run from CLI
- React App in the `/app` folder connected to the NEAR testnet. Usage is pretty straight forward, connect and use!

# Working example

A working example has been deployed to IPFS using Fleek: https://red-lab-5824.on.fleek.co/


# Application Flow

## 1. A user can post a property. Posting is free.

![Post Property](readme/post-property.png?raw=true "Post property")

## 2. The user is then presented with a list of properties: 
- Those which have been posted by the user will have badge displaying "OWNED". 
- Each listing has a detailed description of how much investment is needed, what the rent will be.
- Each listing will display the funding received and how much was from the user.
- Each listing will display how much from the rent the user will receive acccording to their investment.
- If the listing has not been fully funded the owner can cancel the investment which will return the funds to each investor.

User             |  Owner
:-------------------------:|:-------------------------:
![Invest](readme/invest.png?raw=true "Invest")  |  ![Cancel](readme/cancel.png?raw=true "Cancel")


## 3. Once the property has been funded:
- A badge on top of the picture will mark it as funded.
- The investment is now locked, a marketplace for selling shares is not part of this POC.
- The property will now be displayed as available for Rent.
- The user who decides to rent the property will have to pay an equivalent of the rent as a security deposit.

![Rent](readme/rent.png?raw=true "Rent")

## 4. Once the security deposit has been paid:
- The user now owes rent which they can pay
- Other users will see this property as occupied
- The owner will see the rent is due and has an option to finalize (more on this below)

User             |Rentee             |  Owner
:-------------------------:|:-------------------------:|:-------------------------:
![Occupied](readme/occupied.png?raw=true "Occupied")  |  ![Pay rent](readme/pay-rent.png?raw=true "Pay rent")  |  ![Finalize](readme/finalize.png?raw=true "Finalize")


## If the rent has been paid:
- The rentee will see this reflected on the curated
- The owner will have the right to distribute funds to investors

Rentee             |  Owner
:-------------------------:|:-------------------------:
![Paid rent](readme/paid-rent.png?raw=true "Paid rent")  |  ![Distribute](readme/distribute.png?raw=true "Distribute")

## Finalizing the rent
- The finalize button returns the security deposit to the rentee.
- The finalize button returns the security deposit marks the property as available for rent. 

![Finalize](readme/finalize.png?raw=true "Finalize")

# Out of scope / Ignored due to POC nature
- Real life/timed events such as a monthly job to perform actions such as collecting rent and/or distributing funds have not been implemented. The point is to see all the moving parts and therefore there are buttons to perform those actions.
- Investments on non-funded properties can't be withdrawn. Although this is short of development it could make sense in a real life scenario that you are tied to the investment given all the offchain events that depend on people not backing out on fundings.
- A marketplace for transfering ownership of investments has not been done. Investments are locked to a user.
- Filtering UI view according to property status or ownership.
- Security deposit could be different from rent.
- Security deposit and/or rent can't be updated.
- Finalize rent could keep security deposit for owner if in real life scenarios there were a reason for it.
- Owner should be able to lock property from being rented if in real life scenarios the property were unavailable.
