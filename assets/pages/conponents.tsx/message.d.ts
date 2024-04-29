import React from "react";
import { GroupResponse, ChannelResponse } from "../responses";
interface MessageProps {
    message: GroupResponse | ChannelResponse;
}
declare const Message: React.FC<MessageProps>;
export default Message;
