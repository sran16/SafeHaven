import Joi from 'joi';

export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, message: 'Validation error', error: { code: 'BAD_REQUEST', details: error.details.map(d => d.message) } });
  }
  req.body = value;
  next();
};

export const schemas = {
  auth: {
    login: Joi.object({
      name: Joi.string().min(2).max(80).required(),
      password: Joi.string().min(6).max(128).required()
    }),
    register: Joi.object({
      name: Joi.string().min(2).max(80).required(),
      email: Joi.string().email().max(254).required(),
      password: Joi.string().min(6).max(128).required()
    })
  },
  experience: {
    create: Joi.object({
      content: Joi.string().min(1).max(2000).required()
    })
  },
  mood: {
    create: Joi.object({
      moodType: Joi.string().max(30).required(),
      description: Joi.string().allow('').max(500)
    })
  },
  user: {
    updateProfile: Joi.object({
      username: Joi.string().min(2).max(80).optional(),
      bio: Joi.string().allow('').max(500).optional()
    })
  }
};


