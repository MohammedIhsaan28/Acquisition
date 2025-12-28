import logger from '#config/logger.js';
import { signupSchema, signinSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;
    const user = await createUser({ name, email, password, role });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`User signed up: ${email} (${name}, role: ${role})`);

    res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Error in sign-up:', e);

    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;
    const user = await authenticateUser(email, password);
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`User signed in: ${email} (${user.name}, role: ${user.role})`);

    res.status(200).json({
      message: 'User signed in',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Error in sign-in:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');
    logger.info('User signed out');

    res.status(200).json({
      message: 'User signed out successfully',
    });
  } catch (e) {
    logger.error('Error in sign-out:', e);
    next(e);
  }
};

