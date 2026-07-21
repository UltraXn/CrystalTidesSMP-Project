#![allow(dead_code)]

use thiserror::Error;

#[derive(Error, Debug)]
pub enum NativeError {
    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Registry Error: {0}")]
    Registry(String),

    #[error("Archive Error: {0}")]
    Archive(String),

    #[error("NeoForge Error: {0}")]
    NeoForge(String),

    #[error("Mod Loader Error: {0}")]
    ModLoader(String),

    #[error("Java Manager Error: {0}")]
    Java(String),

    #[error("Network Error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Serialization Error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Invalid Input: {0}")]
    InvalidInput(String),

    #[error("Unknown Error")]
    Unknown,
}

impl NativeError {
    pub fn to_code(&self) -> i32 {
        match self {
            NativeError::Io(_) => -5,
            NativeError::Registry(_) => -6,
            NativeError::Archive(_) => -10,
            NativeError::NeoForge(_) => -20,
            NativeError::ModLoader(_) => -21,
            NativeError::Java(_) => -30,
            NativeError::Network(_) => -40,
            NativeError::Serialization(_) => -50,
            NativeError::InvalidInput(_) => -1,
            NativeError::Unknown => -99,
        }
    }
}

pub type NativeResult<T> = Result<T, NativeError>;
