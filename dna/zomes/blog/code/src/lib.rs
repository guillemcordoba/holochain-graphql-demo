#![feature(proc_macro_hygiene)]

use hdk::prelude::*;
use hdk_proc_macros::zome;
use hdk::api::AGENT_ADDRESS;
use holochain_anchors::anchor;

// see https://developer.holochain.org/api/0.0.47-alpha1/hdk/ for info on using the hdk library

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Post {
    content: String,
    author_address: Address,
    timestamp: u64,
}

impl Post {
    pub fn new(content: String, author_address: Address, timestamp: u64) -> Self {
        Post {
            content,
            author_address,
            timestamp,
        }
    }
    pub fn entry(self) -> Entry {
        Entry::App("post".into(), self.into())
    }
}

#[zome]
mod blog {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    #[entry_def]
    fn post_entry_definition() -> ValidatingEntryType {
        entry!(
            name: "post",
            description: "this is the post entry defintion",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<Post>| {
                Ok(())
            },
            links: [
                from!(
                    holochain_anchors::ANCHOR_TYPE,
                    link_type: "anchor->posts",
                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },
                    validation: | _validation_data: hdk::LinkValidationData | {
                        Ok(())
                    }
                ),
                from!(
                    "%agent_id",
                    link_type: "author->posts",
                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },
                    validation: | _validation_data: hdk::LinkValidationData | {
                        Ok(())
                    }
                )
            ]
        )
    }

    #[entry_def]
    fn anchor_definition() -> ValidatingEntryType {
        holochain_anchors::anchor_definition()
    }

    #[zome_fn("hc_public")]
    fn create_post(content: String, timestamp: u64) -> ZomeApiResult<Address> {
        let new_post_entry = Post::new(content, AGENT_ADDRESS.to_string().into(), timestamp).entry();
        let new_post_address = hdk::commit_entry(&new_post_entry)?;
        let anchor_address = anchor("post_anchor".into(), "posts".into())?;
        hdk::link_entries(&anchor_address, &new_post_address, "anchor->posts", "")?;
        hdk::link_entries(&AGENT_ADDRESS, &new_post_address, "author->posts", "")?;
        Ok(new_post_address)
    }

    #[zome_fn("hc_public")]
    fn get_post(post_address: Address) -> ZomeApiResult<Post> {
        hdk::utils::get_as_type(post_address)
    }

    #[zome_fn("hc_public")]
    fn get_all_posts() -> ZomeApiResult<Vec<Address>> {
        let addresses = hdk::get_links(
            &anchor("post_anchor".into(), "posts".into())?, 
            LinkMatch::Exactly("anchor->posts"),
            LinkMatch::Any
        )?.addresses();
        Ok(addresses)
    }

    #[zome_fn("hc_public")]
    fn get_author_posts(agent_id: Address) -> ZomeApiResult<Vec<Address>> {
        let addresses = hdk::get_links(
            &agent_id, 
            LinkMatch::Exactly("author->posts"),
            LinkMatch::Any
        )?.addresses();
        Ok(addresses)
    }

    #[zome_fn("hc_public")]
    fn get_agent_id() -> ZomeApiResult<Address> {
        Ok(hdk::AGENT_ADDRESS.clone())
    }
}
