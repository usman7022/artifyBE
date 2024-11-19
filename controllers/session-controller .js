const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');
const HttpError = require('../helpers/http-error');
const Session = require('../models/session');
const Item = require('../models/item');
const Store = require('../models/store');
const User = require('../models/user');


const addSession = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResult(User, { _id: req.userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user exists in DB', 404));
  }

  let newItem;
  try {
    newItem = await Item.insertMany(req.body);
    let sum = 0;
    for (const item of newItem) {
      if (item.total > sum) {
        sum = item.total;
      }
    }
    const itemIds = newItem.map(item => item._id);
    const newSession = new Session({
      userId: existingUser._id,
      itemIds: itemIds,
      total: sum
    });
    await newSession.save();
  } catch (error) {
    console.error(error);
    return next(new HttpError('Error adding new Session', 500));
  }

  res.status(200).json({
    message: 'newSession added successfully',
    status: 'success',
  });
};
const getSessionByStatus = async (req, res, next) => {
  try {
    const { status, categoryName } = req.body;
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a status parameter in the request body.',
      });
    }
    let totalBottles = 0;
    let totalBags = 0;
    if (categoryName === 'bags') {
      const sessions = await Session.find({ status: status, userId: req.userId });
      sessions.map((session) => {
        totalBags += session.ownBagsQty + session.otherBagsQty;
      });
      return res.status(200).json({
        status: 'success',
        totalBags,
        totalBottles,
      });
    } else if (categoryName === 'bottles') {
      const sessions = await Session.find({ status: status, userId: req.userId });
      sessions.map((session) => {
        totalBottles += session.ownBottlesQty + session.otherBottlesQty;
      });
      return res.status(200).json({
        status: 'success',
        totalBottles,
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};
const getSessionByUser = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.userId, status: 'pending' }).populate('itemIds');
    res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }

}
const getStoreBySessionId = async (req, res, next) => {
  let sessions;
  try {
    sessions = await Session.findById({ _id: req.body.sessionId })
      .populate({
        path: 'itemIds',
        populate: {
          path: 'storeId',
        },
      });


    const sessionobj = sessions.itemIds.map(item => {
      return {
        storeName: item.storeId.storeName,
        storeImagesPath :item.storeId.image,
        total: item.total,
      }
    })
    res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }

}




const getAllSession = factoryHandler.getAll(Session)
const getOneSession = factoryHandler.getOne(Session)
const deleteSession = factoryHandler.getDeleteOne(Session)
const UpdateSession = factoryHandler.getUpdateOne(Session)
exports.addSession = addSession;
exports.getAllSession = getAllSession;
exports.getOneSession = getOneSession;
exports.deleteSession = deleteSession;
exports.UpdateSession = UpdateSession;
exports.getSessionByStatus = getSessionByStatus;
exports.getSessionByUser = getSessionByUser;
exports.getStoreBySessionId = getStoreBySessionId;
