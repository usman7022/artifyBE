const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const HttpError = require('../helpers/http-error');
const Session = require('../models/session');
const Store = require('../models/store');
const User = require('../models/user');
const Barcode = require('../models/barCode');
const mongoose = require('mongoose');
const fs = require('fs');
const factoryHandler = require('./utils-controller');
const moment = require('moment')
const bwipjs = require('bwip-js');
const generateCode = async (req, res, next) => {
  const { storeId, sessionId, amount } = req.body;
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResult(User, { _id: req.userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  if (!existingUser) {
    return next(new HttpError('No User In DB', 401));
  }
  let existingStore;    
  try {
    existingStore = await factoryHandler.getOneResult(Store, { _id: storeId });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500)); 
  }
  if (!existingStore) {
    return next(new HttpError('No Store In DB', 401));
  }
  let existingSession;
  try {
    existingSession = await factoryHandler.getOneResult(Session, { _id: sessionId });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  if (!existingSession) {
    return next(new HttpError('No Session In DB', 401));
  }
  const barCodeNumber = `${Math.floor(100000000 + Math.random() * 900000000)}`;
  let percentage = (amount*10)/100
  if(percentage >= existingStore.totalAmount ){
    discountPrice = existingStore.totalAmount
  }else{
    discountPrice = percentage
  }
  const uniqueKey = Date.now().toString();
  const imagePath = `uploads/barCode/${uniqueKey}.png`;

  let newBarcode = new Barcode({
    storeId: existingStore.id,
    sessionId: existingSession.id,
    userId: existingUser.id,
    discountPrice: discountPrice,
    barcodeURL: imagePath,
    barCodeNumber: barCodeNumber,
  });
  let buffer
  try {
     buffer = await bwipjs.toBuffer({
      bcid: 'code128', 
      text: JSON.stringify(newBarcode),
      backgroundcolor: 'FFFFFF',
    });
  } catch (error) {
    console.error('Error generating barcode:', error);
    return next(new HttpError('Error Generating Barcode', 500));
  }
  try {
    fs.writeFileSync(imagePath, buffer);
    } catch (err) {
    console.error('Error writing barcode image:', err);
    return next(new HttpError('Error Creating Barcode', 404));
  }
  try {
    const expirationDate = moment(newBarcode.createdAt).add(24, 'hours');
    const formattedExpirationDate = expirationDate.format('DD MMM YYYY HH:mm:ss');
    const formattedDate = moment(newBarcode.createdAt).format('DD MMM YYYY HH:mm:ss');
    existingUser.isLocked =true
    existingUser.lockedTime = formattedDate
    existingUser.unlockedTime =formattedExpirationDate
    existingSession.status ='redeem'
    const savePromises = [
      newBarcode.save(),
      existingUser.save(),
      existingSession.save(),
    ];
      await Promise.all(savePromises);
    const barCodeObj = {
      barcodeURL:newBarcode.barcodeURL,
      createDate:formattedDate,
      expireDate:formattedExpirationDate 
    }
    console.log(barCodeObj)
    res.status(201).json({
      status: 'success',
      data:barCodeObj
    });
  } catch (err) {
    console.error('Error saving barcode data:', err);
    return res.status(500).send('Error saving barcode data');
  }
};
const scanCode = async (req, res, next) => {
try {
  const barcodeData = await Barcode.findOne({barCodeNumber:req.query.barCodeNumber});
  res.send({ data: barcodeData });
} catch (error) {
  console.error('Error getting barcode data:', err);
  return res.status(500).send('Error getting barcode data');
}
}
const getRedeemSession = async (req, res, next) => {
  let barcodeData
  try {
    barcodeData  = await Barcode.find({userId:req.userId}).populate({
      path: 'sessionId',
      match: { status: 'redeem' },
    }).populate('storeId'); 
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error getting redeem Session data');  
  }
  res.send({ data: barcodeData });
};
exports.generateCode = generateCode;
exports.scanCode = scanCode;
exports.getRedeemSession = getRedeemSession;