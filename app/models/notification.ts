import { DBManager, Err } from "../config";
import { Notification, Details, Group  } from "@simplechat/shared";
class NotificationModel{
    database = DBManager.instance();

    async create(data: { details?: Details, group?: Group, message: string, alert: string }): Promise<Notification>{
        if(data.details || data.group){
            try{
                const notification = await this.database.notification.create({ 
                    data: {
                        recieverID: data.details ? data.details.id : data.group?.id,
                        message: data.message, alert: data.alert,
                        nType: data.details ? "User" : "Group"
                    },
                    include: { group: { include: { creator: { include: { details: true } } } }, reciecver: true }
                });

                const group = notification.group ? { ...notification.group, creator: notification.group.creator.details } : undefined;

                return { ...notification, ntype: notification.nType === "User" ? "User" : "Group", group  };
            }catch(error){
                throw new Err(503, error, "error encountered when updating notification");
            }
        }else{
            throw new Err(400, "", "bad reuest to server");
       }
    }

    async seen(data: { notificationID: number }): Promise<Notification>{
        try{
            const notification = await this.database.notification.update({ 
                where: {id: data.notificationID },
                data: { received: true },
            });
            return { ...notification, ntype: notification.nType === "User" ? "User" : "Group" };
        }catch(error){
            throw new Err(503, error, "error encountered when updating notification");
        }
    }
}

export default NotificationModel;