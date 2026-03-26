import ROLES from "../utils/roles";
import { Permission, Role } from '../database/models/index';
import sequelize from "../config/db";

const setupRoles = async () => {
    try{
        await sequelize.sync();
        console.log('Database synced.');

        for(const [, roleData] of Object.entries(ROLES)){
            const existingRole = await Role.findOne({
                where: {
                    name: roleData.name
                }
            })

            if(existingRole){
                await Role.update(
                    { description: roleData.description },
                    {
                        where: { id: existingRole.toJSON().id }
                    }
                )

                for(const permission of roleData.permissions){
                    const existingPermission = await Permission.findOne({
                        where: {
                            role_id: existingRole.toJSON().id,
                            action: permission,
                        }
                    })

                    if(!existingPermission){
                        await Permission.create({
                            action: permission,
                            role_id: existingRole.toJSON().id
                        })
                    }
                }

                console.log(`Role ${roleData.name} updated`);
                
            }else{
                const { permissions, ...rest } = roleData;

                const role = await Role.create(rest);

                const permissionData = permissions.map((action: string) => ({
                    action,
                    role_id: role.toJSON().id
                }));

                await Permission.bulkCreate(permissionData);

                console.log(`Role ${role.toJSON().name} created with permissions`);

            }
            
        }

    }catch(err : any){
        console.error('❌ Error setting up roles:', err);
    }finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
}

setupRoles();