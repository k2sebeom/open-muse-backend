const isAuth = async (req, res, next) => {
  // TODO change it to authservice
  try {
    // If authenticated
    next();
  } catch (err) {
    res.sendStatus(401);
  }
};

export default isAuth;
