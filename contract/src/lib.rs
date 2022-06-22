use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};

use serde_json::json;

near_sdk::setup_alloc!();

const PRICE_TO_YOCTO: u128 = 10_000_000_000_000_000_000;
const REVENUE_TO_YOCTO: u128 = PRICE_TO_YOCTO / 10_0000;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    contract_owner: AccountId,
    properties: UnorderedMap<u64, Property>,
}

#[derive(BorshDeserialize, BorshSerialize, Debug, Hash)]
pub struct Property {
    property_owner: AccountId,
    funding: Vec<Funds>, // this could be hashmap {investor, amount}?
    title: String,
    price: u32,
    rent: u32,
    rentor: Option<AccountId>,
    collected_rent: u32,
    security_deposit: u32,
    photo: String,
}

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, Hash)]
pub struct Funds {
    investor: AccountId,
    amount: u32,
}

#[near_bindgen]
impl Contract {
    // // ## Constructor Initializer
    #[init]
    pub fn new() -> Self {
        let log_message = format!("Contract initialized");
        env::log(log_message.as_bytes());

        Self {
            contract_owner: env::predecessor_account_id(),
            properties: UnorderedMap::new(b"s".to_vec()),
        }
    }

    // // ## PROPERTY INVESTMENT FUNCTIONS

    pub fn create_property(&mut self, title: String, price: u32, rent: u32, photo: String) {
        let property_owner = env::signer_account_id();

        let property = Property {
            property_owner,
            funding: vec![],
            title: title,
            rent,
            price, // includes 5 decimals so 100000(0000000000000000000)
            rentor: None,
            collected_rent: 0,
            security_deposit: 0,
            photo,
        };
        let hash = calculate_hash(&property);

        self.properties.insert(&hash, &property);
        env::log(b"Property created correctly.");
    }

    pub fn get_properties(&self) -> Vec<String> {
        let mut properties = vec![];
        for (id, _property) in self.properties.to_vec().iter() {
            let log_message = format!("Property funding {:?}", _property.funding);
            env::log(log_message.as_bytes());
            let property = json!({
                "id": id.to_string(),
                "owner": _property.property_owner,
                "title": _property.title,
                "price": _property.price,
                "rent": _property.rent,
                "rentor": _property.rentor,
                "funding_available": get_available_funding(&_property),
                "funded": _property.price - get_available_funding(&_property),
                "locked": get_available_funding(&_property) == 0,
                "collected_rent": _property.collected_rent,
                "security_deposit": _property.security_deposit,
                "photo": _property.photo
            });
            properties.push(property.to_string());
        }
        properties
    }

    pub fn get_properties_by_asker(&self, asker: AccountId) -> Vec<String> {
        let mut properties = vec![];
        for (id, _property) in self.properties.to_vec().iter() {
            if let Some(funding) = _property
                .funding
                .clone()
                .to_vec()
                .into_iter()
                .find(|x| x.investor == asker)
            {
                let property = json!({
                    "id": id.to_string(),
                    "user_funding": funding.amount,
                });
                properties.push(property.to_string())
            }
        }
        properties
    }

    pub fn get_property(&self, id: String) -> String {
        let kid = id.parse::<u64>().unwrap();
        let found_property = self.properties.get(&kid).unwrap();
        let property = json!({
            "id": id,
            "owner": found_property.property_owner,
            "title": found_property.title,
            "price": found_property.price,
            "rent": found_property.rent,
            "rentor": found_property.rentor,
            "funding_available": get_available_funding(&found_property),
            "funded": found_property.price - get_available_funding(&found_property),
            "locked": get_available_funding(&found_property) == 0,
            "collected_rent": found_property.collected_rent,
            "photo": found_property.photo
        });
        property.to_string()
    }

    #[payable]
    pub fn invest_in_property(&mut self, id: String) {
        let kid = id.parse::<u64>().unwrap();
        let mut property = self.properties.get(&kid).unwrap();

        let available_funding = get_available_funding(&property) as u128 * PRICE_TO_YOCTO;
        let investment = env::attached_deposit();
        let store_investment = (investment / PRICE_TO_YOCTO) as u32;

        if investment <= available_funding {
            let investor = env::signer_account_id();
            let new_funding =
                get_updated_investments(&investor, &store_investment, property.funding);
            property.funding = new_funding;
            self.properties.insert(&kid, &property);
            env::log(b"Investment went through correctly.");
        } else {
            env::panic(
                format!(
                    "Funding for amount not currently available ({}). Sent: {} ",
                    available_funding,
                    env::attached_deposit()
                )
                .as_bytes(),
            );
        }
    }

    pub fn rollback_investment(&mut self, id: String) {
        let kid = id.parse::<u64>().unwrap();
        let property = self.properties.get(&kid).unwrap();

        let caller = env::signer_account_id();
        if caller == property.property_owner {
            if get_available_funding(&property) > 0 {
                for fund in property.funding.iter() {
                    let message = format!(
                        "Returning Investment => Investor:{} - Investment: {}",
                        String::from(&fund.investor),
                        fund.amount.to_string()
                    );

                    let return_funds = fund.amount as u128 * PRICE_TO_YOCTO;
                    Promise::new(String::from(&fund.investor)).transfer(return_funds);
                    env::log(message.as_bytes());
                }
                self.properties.remove(&kid);
            } else {
                env::panic(b"Can't cancel investment, funding is complete.")
            }
        } else {
            env::panic(b"Only property owner can cancel investment")
        }
    }

    // // ## RENT FUNCTIONS

    // Rent property: requires one rent as security deposit
    #[payable]
    pub fn rent_property(&mut self, id: String) {
        let rentor = env::signer_account_id();
        let kid = id.parse::<u64>().unwrap();
        let mut property = self.properties.get(&kid).unwrap();

        if property.rentor == None {
            let rent = property.rent as u128 * 10000000000000000000;

            if rent == env::attached_deposit() {
                property.security_deposit += property.rent;
                property.rentor = Some(rentor);
                self.properties.insert(&kid, &property);
                env::log(b"Rent went through correctly.");
            } else {
                env::panic(
                    format!(
                        "Rentor has sent incorrect price. Attached {} Price is {}",
                        env::attached_deposit(),
                        property.rent as u128 * 10000000000000000000
                    )
                    .as_bytes(),
                );
            }
        } else {
            env::panic(format!("Property not available for rent.").as_bytes());
        }
    }

    // Pay rent
    #[payable]
    pub fn pay_rent(&mut self, id: String) {
        let caller = env::signer_account_id();
        let kid = id.parse::<u64>().unwrap();
        let mut property = self.properties.get(&kid).unwrap();

        if property.rentor == Some(caller) {
            let rent = property.rent as u128 * 10000000000000000000;

            if rent == env::attached_deposit() {
                property.collected_rent += property.rent;

                self.properties.insert(&kid, &property);
                env::log(b"Payment went through correctly.");
            } else {
                env::panic(
                    format!(
                        "Rentor has sent incorrect price. Attached {} Price is {}",
                        env::attached_deposit(),
                        property.rent as u128 * 10000000000000000000
                    )
                    .as_bytes(),
                );
            }
        } else {
            env::panic(format!("Rent can only be payed by rentor").as_bytes());
        }
    }

    // Distribute rent to investors
    pub fn distribute_rent(&mut self, id: String) {
        let caller = env::signer_account_id();
        let kid = id.parse::<u64>().unwrap();
        let mut property = self.properties.get(&kid).unwrap();

        if property.property_owner == caller {
            if property.collected_rent >= property.rent {
                let total_funding = property.price;
                for fund in property.funding.iter() {
                    let percentage =
                        ((fund.amount as f32 / total_funding as f32) * 100000 as f32) as u128;
                    let revenue_in_yocto = percentage * property.rent as u128 * REVENUE_TO_YOCTO;
                    let message = format!(
                        "Investor:{}  - Investment: {} - Proportion: {} - Revenue: {}",
                        String::from(&fund.investor),
                        fund.amount.to_string(),
                        percentage,
                        revenue_in_yocto
                    );

                    Promise::new(String::from(&fund.investor)).transfer(revenue_in_yocto);
                    env::log(message.as_bytes());
                }
                property.collected_rent -= property.rent;
                self.properties.insert(&kid, &property);
            } else {
                env::panic(b"Insufficient funds available for distribution.")
            }
        } else {
            env::panic(b"Rent distribution must be done by property owner.")
        }
    }

    // Finalize rent, give security deposit back
    pub fn finalize_rent(&mut self, id: String) {
        let caller = env::signer_account_id();
        let kid = id.parse::<u64>().unwrap();
        let mut property = self.properties.get(&kid).unwrap();

        if let Some(rentor) = property.rentor {
            if property.property_owner == caller {
                let message = format!(
                    "Returning security deposit ({}) to rentor: {}",
                    property.security_deposit, rentor
                );
                env::log(message.as_bytes());
                Promise::new(rentor).transfer(property.security_deposit as u128 * PRICE_TO_YOCTO);
                property.security_deposit = 0;
                property.rentor = None;
                self.properties.insert(&kid, &property);
            } else {
                env::panic(b"Rent can only be finalized by property owner.")
            }
        } else {
            // Destructure failed. Change to the failure case.
            env::panic(b"Property is not rented");
        }
    }
}

fn get_updated_investments(
    investor: &AccountId,
    investment: &u32,
    funding: Vec<Funds>,
) -> Vec<Funds> {
    match funding
        .clone()
        .to_vec()
        .into_iter()
        .find(|x| &x.investor == investor)
    {
        None => {
            if funding.len() == 0 {
                return vec![Funds {
                    investor: String::from(investor),
                    amount: *investment,
                }];
            } else {
                let mut appended = funding.clone();
                appended.push(Funds {
                    investor: String::from(investor),
                    amount: *investment,
                });
                return appended;
            }
        }
        Some(_x) => funding
            .clone()
            .to_vec()
            .into_iter()
            .map(|fund| {
                let mut updated_funds = Funds {
                    investor: fund.investor,
                    amount: fund.amount,
                };
                if investor == &updated_funds.investor {
                    updated_funds.amount += investment;
                }
                updated_funds
            })
            .collect(),
    }
}

fn get_available_funding(property: &Property) -> u32 {
    let price = &property.price;
    let total_funding = get_total_funding(&property.funding);

    price - total_funding
}

fn get_total_funding(current_funding: &Vec<Funds>) -> u32 {
    let mut total_funding = 0;
    for fund in current_funding.iter() {
        total_funding += fund.amount;
    }
    total_funding
}

fn calculate_hash<T: Hash>(t: &T) -> u64 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish()
}
