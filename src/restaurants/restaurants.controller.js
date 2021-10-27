const restaurantsService = require("./restaurants.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const hasProperties = require("../errors/hasProperties");

//my middleware here
const VALID_PROPERTIES = [
  "restaurant_name",
  "cuisine",
  "address",
]


function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

const hasRequiredProperties = hasProperties("restaurant_name", "cuisine", "address");
//middleware section end 



async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}


//edited create function
async function create(req, res, next) {
  // your solution here
  restaurantsService
    .create(req.body.data)
    .then((data) => res.status(201).json({ data }))
    .catch(next);
  res.json({ data: {} });
}



async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
    restaurant_id: res.locals.restaurant.restaurant_id,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}


//edited destroy function
async function destroy(req, res, next) {
  // your solution here
   restaurantsService
    .delete(res.locals.restaurant.restaurant_id)
    .then(() => res.sendStatus(204))
    .catch(next);
  res.json({ data: {} });
}




module.exports = {
  list: asyncErrorBoundary(list),
  create: [asyncErrorBoundary(create), hasOnlyValidProperties, hasRequiredProperties, create]
  update: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
