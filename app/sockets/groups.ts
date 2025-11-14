import { GroupModel } from '../models';
import jetLogger from 'jet-logger';
import { Err } from '../config';
import {Client, Project} from "@simplechat/shared/models";
import { ElysiaWS } from "elysia/ws";
import { SocketPaths, WSGroupOperation} from "@simplechat/shared";
import MemberModel from "../models/members";
import { MemberRoles } from '@simplechat/shared/models/member';
import Organization from '@simplechat/shared/models/organization';

type GroupsData = { name?: string, groupID?: string, userID?: string, memberID?: string, role?: MemberRoles }
const path: SocketPaths = "groups";

const groupSocketHandler = (ws: ElysiaWS, project: Project, client: Client, operation: string, data: GroupsData, organization?: Organization) =>{
    const model = new GroupModel();
    const memberModel = new MemberModel();

    switch (operation as WSGroupOperation){
        case "Create":
            if(data.name === undefined){
                ws.send({ path, operation: operation, message: "you must provided a group name", status: 400 });
                return;
            }else{
                model.create({ project, organization, client, name: data.name }).then((response)=>{
                    ws.subscribe(response.group.id);
                    ws.publish(response.group.id, { path, operation, member: response });
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when creating group", status: 503 });
                    }
                });
            }
            break;
        case "Cancel":
            if(data.groupID === undefined){
                ws.send({ path, operation: operation, message: "you must provide a group id", status: 400 });
            }else{
                memberModel.cancel({ client, groupID: data.groupID }).then((response)=>{
                    ws.publish(response.group.id, { path, operation, member: response });
                    ws.unsubscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when canceling group request", status: 503 });
                    }
                });
            }
            break;
        case "Accept":
            if(data.groupID === undefined || data.memberID === undefined){
                ws.send({ path, operation: operation, message: "you must provide a member id", status: 400 });
            }else{
                memberModel.accept({ client, memberID: data.memberID }).then((response)=>{
                    ws.publish(response.group.id, { path, operation, member: response });
                    ws.subscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when accepting group request", status: 503 });
                    }
                });
            }
            break;
        case "Reject":
            if( data.memberID === undefined){
                ws.send({ path, operation, message: "you must provide a member id", status: 400 });
            }else{
                memberModel.reject({ client, memberID: data.memberID }).then((response)=>{
                    ws.publish(response.group.id, { path, operation, member: response });
                    ws.unsubscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when rejecting group request", status: 503 });
                    }
                });
            }
            break;
        case "Request":
            if(data.groupID){
                memberModel.create({ client, project, groupID: data.groupID }).then((response)=>{
                    ws.subscribe(response.group.id);
                    ws.publish(response.group.id, { path, operation, member: response });
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when creating group request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "you must provide both group id", status: 400 });
            }
            break;
        case "Assign":
            if(data.memberID && data.role){
                memberModel.assign({ client, memberID: data.memberID, role: data.role }).then((response)=>{
                    ws.publish(response.group.id, { path, operation, member: response });
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when rejecting group request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "you must provide both the member id and desired role", status: 400 });
            }
            break;
        case "Delete":
            if(data.groupID){
                model.delete({ client, groupID: data.groupID }).then((response)=>{
                    ws.publish(response.group.id, { path, operation, member: response });
                    ws.unsubscribe(data.groupID!);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when rejecting group request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "you must provide a group id", status: 400 });
            }
            break;
        default:

    }
}

export default groupSocketHandler;