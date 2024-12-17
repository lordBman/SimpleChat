import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Notification, Credential } from "@prisma/client";
import { HttpStatusCode } from "axios";

class NotificationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async seen(data: { credentail: Credential, notificationID: number }): Promise<Notification>{
        try{
            const notification = await this.database.client.notification.update({ 
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