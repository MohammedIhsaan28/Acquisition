import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async ()=>{
  try{
    const allUsers = await db.select({
      id:users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at:users.createdAt,
      updated_at: users.updatedAt,
    }).from(users);

    return allUsers;
  } catch(e){
    logger.error('Error getting users',e);
    throw e;
  }
};

export const getUserById = async (id) =>{
  try{
    const [user] = await db.select({
      id:users.id,
      email:users.email,
      name: users.name,
      role:users.role,
      created_at: users.createdAt,
      updated_at: users.updatedAt,

    }).from(users).where(eq(users.id,id)).limit(1);

    if(!user){
      throw new Error('User not found');
    }
    return user;
  } catch(e){
    logger.error('Something went wrong in getUserbyId');
    throw e;
  }
};

export const updateUser = async (id,updates) =>{
  try{
    const existingUser = await getUserById(id);
    if(updates.email && updates.email!== existingUser.email){
      const [emailExists] = await db.select().from(users).where(eq(users.email,updates.email)).limit(1);
      if(emailExists) {
        throw new Error('Email already exists');
      }
    }
    const updated = await db.update(users).set(updates).where(eq(users.id,id)).returning({
      id:users.id,
      email:users.email,
      name:users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt:users.updatedAt,
    });

    return updated[0];

  } catch(e){
    logger.error('Error during update user');
    throw e;
  }
};

export const deleteUser = async (id) =>{
  try{
    await getUserById(id);

    const [deleted] = await db.delete(users).where(eq(users.id,id)).returning({
      id: users.id,
      email: users.email,
      name:users.name,
      role:users.role,
    });

    return deleted[0];
  } catch(e){
    logger.error('Error during deleting a user');
    throw e;
  }
};