import ROLES from "../utils/roles";
import { Permission, Role } from '../models/index';
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
                        where: { id: existingRole.id }
                    }
                )

                for(const permission of roleData.permissions){
                    const existingPermission = await Permission.findOne({
                        where: {
                            role_id: existingRole.id,
                            action: permission,
                        }
                    })

                    if(!existingPermission){
                        await Permission.create({
                            action: permission,
                            role_id: existingRole.id
                        })
                    }
                }

                console.log(`Role ${roleData.name} updated`);
                
            }else{
                const { permissions, ...rest } = roleData;

                const role = await Role.create(rest);

                const permissionData = permissions.map((action: string) => ({
                    action,
                    role_id: role.id
                }));

                await Permission.bulkCreate(permissionData);

                console.log(`Role ${role.name} created with permissions`);

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