import { DBManager } from "../config";
import Database from "../config/database";
import { Notification, User } from "@prisma/client";
import { HttpStatusCode } from "axios";

class NotificationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async seen(data: { user: User, notificationID: number }): Promise<Notification | undefined>{
        try{
            const notification = await this.database.client.notification.update({ 
                where: {id: data.notificationID,  recieverID: data.user.id },
                data: { received: true },
            });
            return notification;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating notification");
        }
    }
}

export default NotificationModel;