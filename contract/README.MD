# Real Estate Dapp

NOTE: You will find the code says `rentor` but it refers to the `rentee`

Important: If you deploy this to your own account you will need to update the react app to connect to it.
Update `/src/config.js` with the corresponding account name in the first line and/or the rest of the project if it applies.

## How To run and other commands:

### Deployment
- Compile: `RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release`
- Login to your account: `near login` -> use the logged in account for _{accountId}_ below
- Deploy contract: `near deploy --wasmFile target/wasm32-unknown-unknown/release/real_estate.wasm --accountId {accountId})`
- Instatiate contract: `near call {accountId} new --accountId {accountId})`

### Property interaction
- Get properties: `near view {accountId} get_properties --accountId {accountId}`
- Get property by id: `near view {accountId} get_property '{"id":"{string: property id}"}' --accountId {accountId}`
- Get properties by user account: `near view {accountId} get_properties_by_asker '{"asker": "{string: user account"}' --accountId {user account}`
- Create property: `near call {accountId} create_property '{"title": "{string: title}", "price": {u32}, "rent": {u32}, "photo": "{string: path to photo"}' --accountId {propery owner account}`
- Invest in property: `near call {accountId} invest_in_property '{"id":"{string: property ID}"}' --accountId {investor account} --amount {investment amount}`
- Rollback/cancel investment: `near call {accountId} rollback_investment '{"id":"{string: property ID}"}' --accountId {property owner account}`


### Rent interaction
- Rent propery: `near call {accountId} rent_property '{string: property ID}' --accountId {rentee accound} --amount {rent amount}`
- Pay rent: `near call {accountId} pay_rent '{string: property ID}' --accountId {rentee accound} --amount {rent amount}`
- Distribute funds: `near call {accountId} distribute_rent '{string: property ID}' --accountId {property owner account}`
- Finalize rent: `near call {accountId} finalize_rent '{string: property ID}' --accountId {property owner accounr}`


## Aknowledgements:
- Investments are only incremental and locked (could be a policy)
- There is no profit here this would not work eventually gas would kill you (fixed charge per transaction?)
- Property owner can't extract funding money. Since this is a POC and testnet accounts have small funds this would make playing around with money very boring since you'd run out of money quickly.
- Missing tests for quick release, again... POC.