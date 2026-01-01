import React from "react";
import Badge from "./badge";
import { AccessKey } from "@simplechat/shared/models";
import Key from "./key";
import { apiClientInstance } from "../utils";

const enableButtonStyle: React.CSSProperties = {
    padding: "4px 6px",
    backgroundColor: "var(--primary)",
    borderRadius: 4,
    borderWidth: "2px",
    fontWeight: "lighter",
    borderStyle: "none",
    color: "white",
    fontSize: "12px"
}

interface AccessKeyViewProps{
    accessKey: AccessKey,
    onChange: (key: AccessKey) => void,
    onDelete: (key: AccessKey) => void
}

const AccessKeyView: React.FC<AccessKeyViewProps> = ({ accessKey, onChange, onDelete }) =>{
    const handleDeleteAccessKey = () => {
        if (!confirm("Delete this access key? This cannot be undone.")) return;

        apiClientInstance.delete(`/api/access-keys/${accessKey.id}`)
            .then(() => onDelete(accessKey))
            .catch(() => {});
    };

    const handleToggleAccessKey = () => {
        apiClientInstance.patch<{}, AccessKey>(`/api/access-keys/${accessKey.id}`)
            .then((updated: AccessKey) => onChange(updated))
            .catch(() => {});
    };

    return (
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
            <div style={{ display: "flex", flexDirection:"row", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <g fill="none">
                            <path fill="currentColor" stroke-width="1" d="m20.314 3.686l.53-.53zm0 8.14l.53.53zm-9.86-1.769l-.53-.53zM7.362 13.15l.53.53zm3.489 3.489l-.53-.53zm3.093-3.094l-.53-.53zm-6.935.614l-.746.082zm.193 1.74l-.745.083zm.9.9l-.083.745zm1.74.193l.083-.745zm-2.404-.602l.53-.53zm.173.173l-.53.53zm3.06-7.37l-.726.186zm4.137 4.137l-.186.726zm-3.854.3a.75.75 0 0 0-1.055 1.067zm4.566-5.148a.917.917 0 0 1 0-1.297l-1.061-1.06a2.417 2.417 0 0 0 0 3.417zm1.296 0a.917.917 0 0 1-1.297 0l-1.06 1.06a2.417 2.417 0 0 0 3.417 0zm0-1.297a.917.917 0 0 1 0 1.297l1.06 1.06a2.417 2.417 0 0 0 0-3.418zm1.06-1.06a2.417 2.417 0 0 0-3.417 0l1.06 1.06a.917.917 0 0 1 1.297 0zm1.909-1.909a5.006 5.006 0 0 1 0 7.079l1.06 1.06a6.506 6.506 0 0 0 0-9.2zm1.06-1.06a6.506 6.506 0 0 0-9.2 0l1.061 1.06a5.006 5.006 0 0 1 7.079 0zm-10.92 6.37L6.831 12.62l1.06 1.06l3.094-3.093zm1.456 7.643l1.034-1.034l-1.061-1.06l-1.034 1.033zm1.034-1.034l2.06-2.06l-1.061-1.06l-2.06 2.06zm-6.152-1.894l.194 1.741l1.49-.166l-.193-1.74zm1.756 3.303l1.74.194l.166-1.491l-1.74-.193zm-1.112-.624l.174.174l1.06-1.061l-.173-.174zm1.278-.866a.07.07 0 0 1-.043-.021l-1.061 1.06c.252.253.583.412.938.451zm-1.728-.072c.039.355.198.686.45.938l1.061-1.06a.07.07 0 0 1-.02-.044zm3.863.126a.48.48 0 0 1-.395.139l-.165 1.49a1.98 1.98 0 0 0 1.621-.568zM6.831 12.62a1.98 1.98 0 0 0-.569 1.622l1.491-.166a.48.48 0 0 1 .139-.395zm4.566-3.614a5 5 0 0 1 1.308-4.79l-1.06-1.06a6.5 6.5 0 0 0-1.701 6.223zm8.387 2.289a5 5 0 0 1-4.79 1.308l-.373 1.453a6.5 6.5 0 0 0 6.224-1.7zm-5.31 2.78a.1.1 0 0 1 .044-.022a.2.2 0 0 1 .103.003l.373-1.453c-.527-.135-1.143-.026-1.581.412zm-3.489-3.488c.438-.437.547-1.054.412-1.58l-1.453.372q.014.061.003.103a.1.1 0 0 1-.023.045zm1.426 4.485l-1.458-1.442l-1.055 1.067l1.458 1.441z"/>
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="1" d="M2 11.99c0 4.719 0 7.078 1.466 8.544S7.29 22 12.01 22s7.078 0 8.544-1.466c1.115-1.115 1.382-2.747 1.446-5.541M9.007 2c-2.794.064-4.426.33-5.541 1.446c-.977.977-1.303 2.35-1.412 4.554"/>
                        </g>
                    </svg>
                    <h4 style={{ color: "grey" }}>{accessKey.name}</h4>
                </div>
                <div style={{ display: "flex", flexDirection:"row", gap: "6px", alignItems: "center" }}>
                    {accessKey.default && <Badge label="Default" />}
                    <Badge label={ accessKey.enabled ? "Enabled" : "Disabled" } />
                </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", flexDirection:"row", alignItems: "end", justifyContent: "space-between" }}>
                <Key title="Key" secret={accessKey.key} />
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <button style={enableButtonStyle} onClick={handleToggleAccessKey}>{accessKey.enabled ? "Disable" : "Enable"}</button>
                    { !accessKey.default && (
                        <span onClick={handleDeleteAccessKey} style={{ color: "#d64545", cursor: "pointer" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                                <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/>
                                <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                            </svg>
                        </span>
                    ) }
                </div>
            </div>
            { accessKey.default && (
                <div style={{ marginTop: "10px", fontSize: "12px", color: "GrayText" }}>
                    Note: It is recommended not to use an Acess key that is tagged as default.
                </div>
            ) }
        </div>
    );
}

export default AccessKeyView;