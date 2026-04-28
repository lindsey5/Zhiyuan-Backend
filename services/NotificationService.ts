import { Namespace } from "socket.io";
import { deleteCache } from "../config/redis";
import { DistributorSaleAttributes } from "../models/DistributorSale";
import SaleNotification from "../models/SaleNotification";
import User from "../models/User";
import UserNotification from "../models/UserNotification";
import PERMISSIONS from "../utils/permissions";
import { ReturnRequestAttributes } from "../models/ReturnRequest";
import ReturnNotification from "../models/ReturnNotification";
import '../models/ReturnRequest';
import { StockTransferAttributes } from "../models/StockTransfer";
import StockTransferNotification from '../models/StockTransferNotification';
import { StockOrderAttributes } from "../models/StockOrder";
import StockOrderNotification from "../models/StockOrderNotification";
import Distributor from "../models/Distributor";
import { SponsoredItemAttributes } from "../models/SponsoredItem";
import SponsoredItemNotification from "../models/SponsoredItemNotification";


class NotificationService {
    namespace: Namespace;

    constructor(namespace : Namespace){
        this.namespace = namespace;

        this.sendSaleNotification = this.sendSaleNotification.bind(this);
        this.sendReturnNotification = this.sendReturnNotification.bind(this);
        this.sendCancelReturnNotification = this.sendCancelReturnNotification.bind(this);
        this.sendStockTransferNotification = this.sendStockTransferNotification.bind(this);
        this.sendStockOrderNotification = this.sendStockOrderNotification.bind(this);
        this.sendStockOrderUpdate = this.sendStockOrderUpdate.bind(this);
        this.sendSponsoredItemNotification = this.sendSponsoredItemNotification.bind(this);
        this.sendSponsoredItemUpdateNotification = this.sendSponsoredItemUpdateNotification.bind(this);
    }

    async sendSaleNotification (payload : { distributor_id: string, distributor_name: string, sales: DistributorSaleAttributes[]}) {
        try{
            const { distributor_id, distributor_name, sales } = payload;

            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.DISTRIBUTOR_SALES_VIEW)
            );
            
            const totalItems = sales.reduce((total, sale) => total + sale.quantity, 0);

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name} sold ${totalItems} items`
                })

                const saleNotification = await SaleNotification.create({
                    notification_id: userNotification._id,
                    distributor_id,
                    sale_ids: sales.map(sale => sale._id)
                })

                await saleNotification.populate([
                    { 
                        path: "sales", 
                        populate: {
                            path: "variant",
                            populate: "product"
                        }
                    },
                    { 
                        path: "sold_by", 
                        select: "-password", 
                        populate: 'parent_distributor' 
                    }
                ])
                await deleteCache(`user-notifications:${user._id}:*`)

                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        saleNotification
                    }
                })
            }

            await deleteCache(`commissions:${distributor_id}:*`);
            await deleteCache(`distributor-sales:*`);
            await deleteCache(`distributor-stocks:${distributor_id}:*`);
            await deleteCache(`distributor-items-sold:*`);
        }catch(err){
            console.log(err);
        }
    }

    async sendReturnNotification (payload : { returnRequest : ReturnRequestAttributes, distributor_name: string, distributor_id: string }) {
        try{
            const { distributor_name, returnRequest } = payload;
            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_VIEW || p.action === PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE)
            );

            const totalItems = returnRequest.items.reduce((total, item) => total + item.quantity, 0);

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name} requested to return ${totalItems} items`
                })

                const returnNotification = await ReturnNotification.create({
                    return_id: returnRequest._id,
                    notification_id: userNotification._id
                })

                await returnNotification.populate({ 
                    path: "returnRequest", 
                    populate: [
                        { path: "items.variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })
                await deleteCache(`user-notifications:${user._id}:*`);
                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        returnNotification
                    }
                })
            }

            await deleteCache('return-requests:*');

        }catch(err){
            console.log(err);
        }
    }

    async sendCancelReturnNotification (returnRequest : ReturnRequestAttributes) {
        try{
            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.DISTRIBUTOR_SALES_VIEW)
            );

            const distributor_name = returnRequest.distributor?.distributor_name || "";

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name}'s return request has been cancelled`
                })

                const returnNotification = await ReturnNotification.create({
                    return_id: returnRequest._id,
                    notification_id: userNotification._id
                })

                await returnNotification.populate({ 
                    path: "returnRequest", 
                    populate: [
                        { path: "items.variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })
                await deleteCache(`user-notifications:${user._id}:*`)
                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        returnNotification
                    }
                })
            }

            await deleteCache('return-requests:*');
        }catch(err){
            console.log(err);
        }
    }

    async sendStockTransferNotification (payload : { distributor_name: string, stockTransfer: StockTransferAttributes, status: string }) {
        try{
            const { distributor_name, stockTransfer, status } = payload;

            const user = await User.findById(stockTransfer.sender_id);

            if(!user) return;
            
            const userNotification = await UserNotification.create({
                user_id: user._id,
                message: `Stock distribution for ${distributor_name} has been marked as ${status}`
            })

            const stockTransferNotification = await StockTransferNotification.create({
                notification_id: userNotification._id,
                stock_transfer_id: stockTransfer._id
            })

            await stockTransferNotification.populate({
                path: "stockTransfer",
                populate: [
                    { path: "sender", select: "-password" },
                    { path: 'receiver', select: "-password" },
                    { 
                        path: "items",
                        populate: {
                            path: "variant",
                            populate: "product"
                        }
                    }
                ]
            })

            await deleteCache(`user-notifications:${user._id}:*`)
            await deleteCache("stock-transfer-logs:*");
            await deleteCache(`products:*`);
            await deleteCache(`variants:*`);
            await deleteCache(`distributor-stocks:${stockTransfer.receiver_id.toString()}:*`);

            this.namespace.to(user._id.toString()).emit("receive-notification", { 
                userNotification: {
                    ...userNotification.toObject(),
                    stockTransferNotification
                }
            })

        }catch(err){
            console.log(err);
        }
    }

    async sendStockOrderNotification (payload : { distributor_name: string, stockOrder: StockOrderAttributes }) {
        try{
            const { distributor_name, stockOrder } = payload;
    
            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.STOCK_ORDERS_VIEW_ALL || p.action === PERMISSIONS.STOCK_ORDERS_UPDATE)
            );

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name} submitted a stock order request.`
                })

                const stockOrderNotification = await StockOrderNotification.create({
                    order_id: stockOrder._id,
                    notification_id: userNotification._id,
                })

                await stockOrderNotification.populate({ 
                    path: "stockOrder", 
                    populate: [
                        { path: "items.variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })

                await deleteCache(`user-notifications:${user._id}:*`)
                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        stockOrderNotification
                    }
                })
            }

            await deleteCache('stock-orders:*');
        }catch(err){
            console.log(err);
        }
    }

    async sendStockOrderUpdate (stockOrder : StockOrderAttributes) {
        try{
            const distributor = await Distributor.findById(stockOrder.distributor_id);

            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.STOCK_ORDERS_VIEW_ALL || p.action === PERMISSIONS.STOCK_ORDERS_UPDATE)
            );

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor?.distributor_name} stock order has been ${stockOrder.status}`
                })

                const stockOrderNotification = await StockOrderNotification.create({
                    order_id: stockOrder._id,
                    notification_id: userNotification._id,
                })

                await stockOrderNotification.populate({ 
                    path: "stockOrder", 
                    populate: [
                        { path: "items.variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })

                await deleteCache(`user-notifications:${user._id}:*`);
                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        stockOrderNotification
                    }
                })
            }

            await deleteCache('stock-orders:*');
            await deleteCache('products:*');
            await deleteCache('variants:*');
            await deleteCache(`distributor-stocks:${stockOrder.distributor_id.toString()}:*`)
        }catch(err){
            console.log(err);
        }
    }

    async sendSponsoredItemNotification (sponsored_item : SponsoredItemAttributes) {
        try{
            const distributor = await Distributor.findById(sponsored_item.distributor_id);

            if(!distributor) return;

            const distributor_name = distributor.distributor_name;
    
            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.SPONSORED_PRODUCT_UPDATE|| p.action === PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL)
            );

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name} wants to sponsor a product`
                })

                const sponsoredItemNotification = await SponsoredItemNotification.create({
                    notification_id: userNotification._id,
                    sponsored_id: sponsored_item._id
                })

                await sponsoredItemNotification.populate({ 
                    path: "sponsored_item", 
                    populate: [
                        { path: "variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })

                await deleteCache(`user-notifications:${user._id}:*`)

                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        sponsoredItemNotification
                    }
                })
            }

            await deleteCache('sponsored-items:*');
        }catch(err){
            console.log(err);
        }
    }

    async sendSponsoredItemUpdateNotification (sponsored_item : SponsoredItemAttributes) {
        try{
            const distributor = await Distributor.findById(sponsored_item.distributor_id);

            if(!distributor) return;

            const distributor_name = distributor.distributor_name;
    
            const users = await User.find({ status: 'active' })
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                });

            const authorizedUsers = users.filter(user =>
                user.role?.permissions?.some(p => p.action === PERMISSIONS.SPONSORED_PRODUCT_UPDATE|| p.action === PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL)
            );

            for(const user of authorizedUsers){
                const userNotification = await UserNotification.create({
                    user_id: user._id,
                    message: `${distributor_name} sponsor request has been mark as ${sponsored_item.status}`
                })

                const sponsoredItemNotification = await SponsoredItemNotification.create({
                    notification_id: userNotification._id,
                    sponsored_id: sponsored_item._id
                })

                await sponsoredItemNotification.populate({ 
                    path: "sponsored_item", 
                    populate: [
                        { path: "variant", populate: "product" },
                        { path: 'distributor', select: '-password' }
                    ]
                })

                await deleteCache(`user-notifications:${user._id}:*`)
                
                this.namespace.to(user._id.toString()).emit("receive-notification", { 
                    userNotification: {
                        ...userNotification.toObject(),
                        sponsoredItemNotification
                    }
                })
            }
            await deleteCache(`distributor-stocks:${sponsored_item.distributor_id.toString()}:*`)
            await deleteCache('sponsored-items:*');
        }catch(err){
            console.log(err);
        }
    }

}

export default NotificationService