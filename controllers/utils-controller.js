
const HttpError = require('../helpers/http-error');
const { default: mongoose } = require('mongoose');

const getOneResult = async (Model, options) => {
    let results;              
    try {
        results = await Model.findOne(options);
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching result', 500);
    };

    return results;
};
const getOneResultPass = async (Model, options) => {
    let results;
    try {       
        results = await Model.findOne(options).select('+password');
    } catch (error) {
        throw new Error('Error fetching result', 500);
    };

    return results;
};
const getAllResults = async (Model) => {
    let results;
    try {
        results = await Model.find({});
    } catch (error) {
        throw new Error('Error fetching result', 500);
    };
    return results;
};
exports.getAll = (Model, popOptions) => async (req, res, next) => {
    try {
      let query = Model.find({});
      if (popOptions) query = query.populate(popOptions);
      const data = await query;
      res.status(200).json({
      status: 'success',
      results: data.length,   
      data
    });
    } catch (error) {
      return next(new HttpError(error, 500));
    }
 };
const getOne = (Model,popOptions)=> async(req,res,next)=>{
    try {
        const checkId = mongoose.Types.ObjectId.isValid(req.params.id);
        if(!checkId){
            return next(new HttpError('invalid Id' ,404))
        }
        let query = Model.findById(req.params.id)
        if(popOptions) query = query.populate(popOptions)
        const data = await query;
        if(!data){
            return next(new HttpError('No data Find by this Id' ,404))
        }
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        throw new Error('Error fetching result', 500);
    }
  
}
const getOneById = async (Model, id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid id format');
    }

    let results;
    try {
        results = await Model.findById(id);
    } catch (error) {
        throw new Error('Error fetching result', 500);
    };

    if (!results) {
        throw new Error('No result found against id', 404);
    }

    return results;
};
const getDeleteOne = Model =>async(req,res,next)=>{
    try{
        const data = await Model.findByIdAndDelete(req .params.id);
        if(!data){
            return next(new HttpError('No doc Find by this Id' ,404))
        } 
        res.status(200).json({
            status: 'success',
            message:'data Deleted Successfully',
        });
    }catch(error){
        return next(new HttpError(error, 500));

    }
         
}
const getUpdateOne = Model =>  async(req,res,next)=>{
    try{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    if(!doc){
        return next(new HttpError('No doc Find by this Id' ,404))
    }
    res.status(200).json({         
        status: 'success',
        data:{
            doc
        }

    });
}catch(error){
    return next(new HttpError(error, 500));
}
}



exports.getOneResult = getOneResult;
exports.getOneById = getOneById;
exports.getOneResultPass = getOneResultPass;
exports.getAllResults = getAllResults;
exports.getDeleteOne = getDeleteOne;
exports.getUpdateOne = getUpdateOne;
exports.getOne = getOne;