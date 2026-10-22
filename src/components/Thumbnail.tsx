import { Folder } from "../api";
import { IconArt } from "./IconArt";

/** Folder artwork: uploaded image, else the made-in-app icon, else the folder's first letter. */
export function Thumbnail({ folder, className = "" }: { folder: Folder; className?: string }) {
  if (folder.thumbnail) {
    return <img className={`thumb ${className}`} src={folder.thumbnail} alt="" draggable={false} />;
  }
  if (folder.icon) {
    return <IconArt icon={folder.icon} className={className} />;
  }
  return (
    <div className={`thumb thumb-empty ${className}`}>{folder.name.trim().charAt(0).toUpperCase() || "?"}</div>
  );
}
