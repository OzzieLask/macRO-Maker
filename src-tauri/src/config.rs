use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Remap {
    /// Physical key the user presses (KeyboardEvent.code).
    pub from: String,
    /// Key sent to the target app instead.
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub id: String,
    pub name: String,
    /// Executable name the remaps apply to, e.g. "RobloxPlayerBeta.exe".
    pub target_exe: String,
    pub remaps: Vec<Remap>,
    /// Small JPEG data URL shown on the folder tile.
    #[serde(default)]
    pub thumbnail: Option<String>,
    /// Made-in-app icon, used when there's no thumbnail image.
    #[serde(default)]
    pub icon: Option<FolderIcon>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderIcon {
    pub color: String,
    pub symbol: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub folders: Vec<Folder>,
    pub active_folder: Option<String>,
    /// Global kill-switch key (KeyboardEvent.code).
    pub toggle_key: String,
}

impl Default for Config {
    fn default() -> Self {
        Config { folders: vec![], active_folder: None, toggle_key: "F8".into() }
    }
}

impl Config {
    pub fn active(&self) -> Option<&Folder> {
        let id = self.active_folder.as_ref()?;
        self.folders.iter().find(|f| &f.id == id)
    }

    pub fn load(path: &Path) -> Config {
        std::fs::read_to_string(path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    }

    pub fn save(&self, path: &Path) -> std::io::Result<()> {
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir)?;
        }
        std::fs::write(path, serde_json::to_string_pretty(self)?)
    }
}
