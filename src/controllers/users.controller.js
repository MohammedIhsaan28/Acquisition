import logger from '#config/logger.js';
import { getAllUsers, getUserById, updateUser, deleteUser } from '#services/users.service.js';
import { formatValidationError } from '#utils/format.js';
import { userIdSchema, updateUserSchema } from '#validations/users.validation.js';

export const fetchAllUsers = async(req,res,next)=>{
  try{
    logger.info('Getting users...');
    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully Fetch Users data',
      users: allUsers,
      count: allUsers.length,
    });
  } catch(e){
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req,res,next) =>{
  try{
    logger.info('Getting user by id:',req.params.id);

    const validationResult = userIdSchema.safeParse({id: req.params.id});

    if(!validationResult.success){
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const {id} = validationResult.data;
    const requester = req.user;

    if(requester.role !== 'admin' && requester.id !==id){
      return res.status(403).json({
        error: 'Forbidden - You can only access your own user data'
      });
    };

    const user = await getUserById(id);

    logger.info('User retrived successfully');

    res.json({
      message: 'User retrieved successfully',
      user 
    });
  } catch(e){
    logger.error('Error during fetch user by id');
    next(e);

  }
};

export const updateUserById = async (req,res,next) => {
  try{
    const validationResult = userIdSchema.safeParse({id: req.params.id});

    if(!validationResult.success){
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const {id} = validationResult.data;
    const payloadValidation = updateUserSchema.safeParse(req.body);
    if (!payloadValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(payloadValidation.error),
      });
    }

    const user = await getUserById(id);
    const updatedUser = await updateUser(id, payloadValidation.data);
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });


  } catch(e){
    logger.error('Error during update user');
    next(e);
  }
};

export const deleteUserById = async(req,res,next) =>{
  try{
    const validation = userIdSchema.safeParse({ id: req.params.id });
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validation.error),
      });
    }

    const { id } = validation.data;

    // Ensure user exists
    await getUserById(id);

    // Delete user and return result
    const removed = await deleteUser(id);
    return res.status(200).json({
      message: 'User deleted successfully',
      user: removed,
    });
  } catch(e){
    logger.error('Error during deleting user');
    next(e);
  }
};