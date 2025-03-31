import { DBManager, Err } from "../config";
import { Notification, Credential } from "@simplechat/shared";
import { HttpStatusCode } from "axios";

class NotificationModel{
    async seen(data: { credentail: Credential, notificationID: number }): Promise<Notification>{
        try{
            const database = await DBManager.instance();

            const notification = await database.notification.update({ 
                where: {id: data.notificationID,  recieverID: data.credentail.id },
                data: { received: true },
            });
            return notification;
        }catch(error){
           throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when updating notification");
        }
    }
}

export default NotificationModel;